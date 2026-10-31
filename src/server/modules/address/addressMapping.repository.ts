import { googleConfig } from "@/server/config/google.config";
import { createGoogleSheetsClient } from "@/server/integrations/googleSheet/googleSheet.client";
import { OldWardMapping } from "@/types/address.types";
import "server-only";

const MAPPING_SHEET_NAME = "Địa chỉ cũ mới";
type MappingType = "exact" | "partial";

function isMappingType(value: string): value is MappingType {
  return value === "exact" || value === "partial";
}

export async function getOldWardMapping(): Promise<OldWardMapping[]> {
  const spreadsheetId = '1hqEg879-W7XGKqIZe1u6e9sdSDAaL1P8rv_9TWIII6I'
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID");
  }
  const sheets = createGoogleSheetsClient();
  const escapedName = MAPPING_SHEET_NAME.replace(/'/g, "''");
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${escapedName}'!A2:D`,
    valueRenderOption: "FORMATTED_VALUE",
  });
  const rows = response.data.values ?? [];
  const mappings: OldWardMapping[] = [];
  for (const [index, row] of rows.entries()) {
    const oldDistrict = String(row[0] ?? "").trim();
    const oldWard = String(row[1] ?? "").trim();
    const newWard = String(row[2] ?? "").trim();

    const mappingType = String(row[3] ?? "".trim().toLowerCase());
    if (row.every((cell) => !String(cell ?? "").trim())) {
      continue;
    }

    if (!oldDistrict || !oldWard || !newWard || !isMappingType(mappingType)) {
      throw new Error(`Invalid address mapping at row ${index + 2}`);
    }

    mappings.push({
      oldDistrict,
      oldWard,
      newWard,
      mappingType,
    });
  }
  return mappings;
}
