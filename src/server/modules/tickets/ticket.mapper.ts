import { shipperSheetConfigs } from "@/server/config/shipperSheet.config";
import { Ticket } from "@/types/ticket.types";
import { time } from "console";

export interface TicketColumnConfig{
    timestampColumn:number;
    contentColumn:number;
    shippingFeeColumn:number;
    otherFeeColumn:number;
}
type ShipperSheetConfig =
  (typeof shipperSheetConfigs)[string];
interface MapSheetRowInput {
  row: string[];
  rowNumber: number;
  shipperCode: string;
  config: ShipperSheetConfig;
}
function parseSheetMoney(
  value: string | undefined,
): number {
  if (!value?.trim()) return 0;

  const normalized = value
    .replace(/[^\d-]/g, "");

  if (!normalized) return 0;

  const amount = Number(normalized);

  return Number.isSafeInteger(amount) && amount >= 0
    ? amount
    : 0;
}
function parseSheetTimestamp(
  value: string | undefined,
): string {
  const raw = value?.trim() ?? "";

  if (!raw) return "";

  const match = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    // Nếu đã là ISO hợp lệ thì giữ lại.
    const timestamp = Date.parse(raw);

    return Number.isFinite(timestamp)
      ? new Date(timestamp).toISOString()
      : "";
  }

  const [, day, month, year, hour, minute, second = "0"] =
    match;

  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const h = Number(hour);
  const min = Number(minute);
  const sec = Number(second);

  if (
    m < 1 || m > 12 ||
    d < 1 || d > 31 ||
    h < 0 || h > 23 ||
    min < 0 || min > 59 ||
    sec < 0 || sec > 59
  ) {
    return "";
  }

  const timestamp = Date.UTC(
    y,
    m - 1,
    d,
    h - 7,
    min,
    sec,
  );

  const date = new Date(timestamp);

  // Kiểm tra ngày thực sự hợp lệ.
  const local = new Date(timestamp + 7 * 60 * 60 * 1000);

  if (
    local.getUTCFullYear() !== y ||
    local.getUTCMonth() !== m - 1 ||
    local.getUTCDate() !== d ||
    local.getUTCHours() !== h ||
    local.getUTCMinutes() !== min ||
    local.getUTCSeconds() !== sec
  ) {
    return "";
  }

  return date.toISOString();
}

export function sheetDateToISO(value:string) :string | null{
     const match = value.trim().match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
  );
  if(!match) return null;
  const [day, month, year, hour, minute, second] = match;
  const timestamp = Date.UTC(
    Number(year),
    Number(month) -1,
    Number(day),
    Number(hour) -7,
    Number(minute),
    Number(second)
  )
const date = new Date(timestamp);
const local = new Date(timestamp + 7 * 60 * 60 * 1000);

  if (
    local.getUTCFullYear() !== Number(year) ||
    local.getUTCMonth() !== Number(month) - 1 ||
    local.getUTCDate() !== Number(day) ||
    local.getUTCHours() !== Number(hour) ||
    local.getUTCMinutes() !== Number(minute) ||
    local.getUTCSeconds() !== Number(second)
  ) {
    return null;
  }
    return date.toISOString();
}

function parseShippingFee(value: string): number | null {
  const cleaned = value
    .trim()
    .replace(/[^\d,.-]/g, "");

  if (!cleaned) return null;
  const normalized = cleaned
    .replace(/([.,])00$/, "")
    .replace(/[.,]/g, "");

  const fee = Number(normalized);

  if (!Number.isSafeInteger(fee) || fee < 0) {
    return null;
  }

  return fee;
}

export function mapSheetRowToTicket({
  row,
  rowNumber,
  shipperCode,
  config,
}: MapSheetRowInput): Ticket {
  const getCell = (index: number): string => {
    return String(row[index] ?? "").trim();
  };

  const content = getCell(config.contentColumn);

  const timestamp = getCell(config.timestampColumn);

  const shippingFee = parseSheetMoney(
    getCell(config.shippingFeeColumn),
  );

  const otherFee = parseSheetMoney(
    getCell(config.otherFeeColumn),
  );

  return {
    id: `${shipperCode}-${rowNumber}`,
    shipperId: shipperCode,
    shipperName: shipperCode,

    content,
    createdAt: parseSheetTimestamp(timestamp),

    shippingFee,
    otherFee,
    transportFee: 0,
    codAmount: null,
  };
}