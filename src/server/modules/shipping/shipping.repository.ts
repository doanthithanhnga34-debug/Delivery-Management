import "server-only";

import { createGoogleSheetsClient } from "@/server/integrations/googleSheet/googleSheet.client";
import { googleConfig } from "@/server/config/google.config";

export type RawShippingRow = {
  rowNumber: number;
  cells: string[];
};

export interface ShippingRate {
  district: string;
  ward: string;
  fee: number;
}

export async function getRawShippingRules(): Promise<RawShippingRow[]> {
  const { spreadsheetId, sheetName } = googleConfig;

  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID");
  }

  if (!sheetName) {
    throw new Error("Missing GOOGLE_SHEETS_SHEET_NAME");
  }

  // Khởi tạo Google Sheets client
  const sheetsClient = createGoogleSheetsClient();

  // Escape dấu nháy đơn trong tên tab
  const escapedSheetName = sheetName.replace(/'/g, "''");

  const response = await sheetsClient.spreadsheets.values.get({
    spreadsheetId,
    range: `'${escapedSheetName}'!A1:Z300`,
    valueRenderOption: "FORMATTED_VALUE",
  });

  const rows = response.data.values ?? [];

  return rows.map((row, index) => ({
    rowNumber: index + 1,
    cells: row.map((cell) => String(cell ?? "")),
  }));
}
export async function getShippingRates(): Promise<ShippingRate[]> {
  const rawRows = await getRawShippingRules();

  return mapShippingRates(rawRows);
}
export function mapShippingRates(
  rows: RawShippingRow[],
): ShippingRate[] {
  const rates: ShippingRate[] = [];

  for (const row of rows) {
    const district = row.cells[5]?.trim() ?? "";
    const ward = row.cells[6]?.trim() ?? "";
    const feeText = row.cells[7]?.trim() ?? "";

    if (!district || !ward || !feeText) {
      continue;
    }

    const fee = Number(feeText.replace(/[^\d]/g, ""));

    if (!Number.isFinite(fee) || fee <= 0) {
      continue;
    }

    rates.push({
      district,
      ward,
      fee,
    });
  }

  return rates;
}

// export function mapShippingRates(rows: string[][]): ShippingRate[] {
//   const rates :ShippingRate[] =[];
//   return rows.flatMap((row) => {
//     const [district, ward, fee] = row;
//     const parsedFee = Number(String(fee ?? "").replace(/[^\d]/g, ""));
//     if (
//       !district?.trim() ||
//       !ward?.trim() ||
//       !fee?.trim() ||
//       !Number.isFinite(parsedFee)
//     ) {
//       return [];
//     }
//     return [
//       {
//         district: district.trim(),
//         ward: ward.trim(),
//         fee: parsedFee,
//       },
//     ];
//   });
// }
