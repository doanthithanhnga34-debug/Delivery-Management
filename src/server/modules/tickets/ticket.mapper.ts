import { Ticket } from "@/types/ticket.types";
import { time } from "console";

export interface TicketColumnConfig{
    timestampColumn:number;
    contentColumn:number;
    shippingFeeColumn:number;
    otherFeeColumn:number;
}

export interface MapTicketInput{
    row: string[];
    rowNumber: number;
    shipperCode:string;
    config: TicketColumnConfig
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
}: MapTicketInput): Ticket | null {
  const rawDate = String(
    row[config.timestampColumn] ?? "",
  ).trim();

  const content = String(
    row[config.contentColumn] ?? "",
  ).trim();

  const rawFee = String(
    row[config.shippingFeeColumn] ?? "",
  ).trim();

  if (!rawDate || !content) return null;

  const createdAt = sheetDateToISO(rawDate);
  const shippingFee = parseShippingFee(rawFee);

  // Bỏ qua dòng tiêu đề, tổng kết,
  // hoặc dòng không có dữ liệu phiếu hợp lệ.
  if (!createdAt || shippingFee === null) {
    return null;
  }

  return {
    // ID tạm cho danh sách, chưa dùng để xóa phiếu.
    id: `${shipperCode}-${rowNumber}`,
    shipperId: shipperCode,
    shipperName: shipperCode,
    content,
    createdAt:rawDate,
    shippingFee,

    // Những trường này chưa lưu trong Sheet.
    codAmount: "",
    transportFee: 0,
    otherFee: 0,
  };
}