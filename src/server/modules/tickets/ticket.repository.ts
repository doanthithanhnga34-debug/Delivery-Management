import { shipperSheetConfigs } from "@/server/config/shipperSheet.config";
import { createGoogleSheetsClient } from "@/server/integrations/googleSheet/googleSheet.client";
import { SaveTicketInput } from "@/types/ticket.types";

export async function saveTicketToSheet(input: SaveTicketInput) {
  const spreadsheetId = "1hqEg879-W7XGKqIZe1u6e9sdSDAaL1P8rv_9TWIII6I";
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
