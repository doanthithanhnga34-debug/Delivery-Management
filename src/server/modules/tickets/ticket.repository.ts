import { shipperSheetConfigs } from "@/server/config/shipperSheet.config";
import { createGoogleSheetsClient } from "@/server/integrations/googleSheet/googleSheet.client";
import { SaveTicketInput, Ticket } from "@/types/ticket.types";
import { mapSheetRowToTicket } from "./ticket.mapper";

const spreadsheetId = "1hqEg879-W7XGKqIZe1u6e9sdSDAaL1P8rv_9TWIII6I";
const DAYS_TO_FETCH = 30;



export async function saveTicketToSheet(input: SaveTicketInput) {
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SHIPPER_TEST_ID");
  }
  const config = shipperSheetConfigs[input.shipperName.toUpperCase()];
  if (!config) {
    throw new Error("Shipper configuration not found");
  }
  const rows = Array(config.totalColumns).fill("");

  const timestamp = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .replace(",", "");

  rows[config.timestampColumn] = timestamp;
  rows[config.contentColumn] = input.content;
  rows[config.shippingFeeColumn] = input.shippingFee;
  rows[config.otherFeeColumn] = input.otherFee;

  const sheets = createGoogleSheetsClient();
  const escapedName = config.sheetName.replace(/'/g, "''");

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${escapedName}'!A:L`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [rows],
    },
  });

  return {
    success: true,
    sheetName: config.sheetName,
    updatedRange: response.data.updates?.updatedRange ?? null,
  };
}

function parseSheetDate(value: string): Date | null {
  const match = value.trim().match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) return null;

  const [, day, month, year, hour, minute, second = "0"] = match;

  const timestamp = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - 7,
    Number(minute),
    Number(second),
  );

  const date = new Date(timestamp);

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value;

  if (
    Number(get("day")) !== Number(day) ||
    Number(get("month")) !== Number(month) ||
    Number(get("year")) !== Number(year) ||
    Number(get("hour")) !== Number(hour) ||
    Number(get("minute")) !== Number(minute) ||
    Number(get("second")) !== Number(second)
  ) {
    return null;
  }

  return date;
}
export async function getTicketSheet(
  shipperCode: string,
): Promise<Ticket[]> {
  const normalizedCode = shipperCode.trim().toUpperCase();
  const config = shipperSheetConfigs[normalizedCode];

  if (!config) {
    throw new Error("Không tìm thấy cấu hình shipper.");
  }

  const sheets = createGoogleSheetsClient();
  const escapedSheetName = config.sheetName.replace(/'/g, "''");

  // Cột timestamp trong cấu hình đang dùng index từ 0.
  const timestampColumn = String.fromCharCode(
    65 + config.timestampColumn,
  );

  const timestampResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${escapedSheetName}'!${timestampColumn}2:${timestampColumn}`,
    valueRenderOption: "FORMATTED_VALUE",
  });

  const dateRows = timestampResponse.data.values ?? [];

  const now = Date.now();
  const from = now - 30 * 24 * 60 * 60 * 1000;

  const matchingRowNumbers = new Set<number>();

  for (let index = 0; index < dateRows.length; index++) {
    const value = String(dateRows[index]?.[0] ?? "");
    const date = parseSheetDate(value);

    if (!date) continue;

    const timestamp = date.getTime();

    if (timestamp >= from && timestamp <= now) {
      matchingRowNumbers.add(index + 2);
    }
  }

  if (matchingRowNumbers.size === 0) {
    return [];
  }
  const firstRow = Math.min(...matchingRowNumbers);
  const lastRow = Math.max(...matchingRowNumbers);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${escapedSheetName}'!A${firstRow}:L${lastRow}`,
    valueRenderOption: "FORMATTED_VALUE",
  });

  const rows = response.data.values ?? [];
  const tickets: Ticket[] = [];

  for (let index = 0; index < rows.length; index++) {
    const rowNumber = firstRow + index;

    if (!matchingRowNumbers.has(rowNumber)) {
      continue;
    }

    const row = rows[index].map((value) => String(value ?? ""));

    const ticket = mapSheetRowToTicket({
      row,
      rowNumber,
      shipperCode: normalizedCode,
      config,
    });

    if (ticket) {
      tickets.push(ticket);
    }
  }

  return tickets;
}
