import { shipperSheetConfigs } from "@/server/config/shipperSheet.config";
import { createGoogleSheetsClient } from "@/server/integrations/googleSheet/googleSheet.client";
import { SaveTicketInput, Ticket } from "@/types/ticket.types";
import { mapSheetRowToTicket } from "./ticket.mapper";

const spreadsheetId = "1hqEg879-W7XGKqIZe1u6e9sdSDAaL1P8rv_9TWIII6I";
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
  rows[config.otherFeeColumn] = input.otherFee

  const sheets = createGoogleSheetsClient();
  const escapedName = config.sheetName.replace(/'/g, "''");

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${escapedName}'!A:L`,
    valueInputOption: "USER_ENTERED",
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

export async function getTicketSheet(shipperCode: string): Promise<Ticket[]> {
  const normalizedCode = shipperCode.trim().toUpperCase();
  const config = shipperSheetConfigs[normalizedCode];

  if (!config) {
    throw new Error("Không tìm thấy cấu hình shipper.");
  }

  const sheets = await createGoogleSheetsClient();
  const escapedSheetName = config.sheetName.replace(/'/g, "''");
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: `'${escapedSheetName}'!A:L`,
    valueRenderOption: "FORMATTED_VALUE",
  });
  const rows = response.data.values ?? [];
  const tickets: Ticket[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map((value) => String(value ?? ""));

    const ticket = mapSheetRowToTicket({
      row,
      rowNumber: i + 1,
      shipperCode: normalizedCode,
      config,
    });
    if (ticket) {
      tickets.push(ticket);
    }
  }
  return tickets;
}
