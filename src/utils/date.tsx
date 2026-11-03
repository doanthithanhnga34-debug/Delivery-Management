
const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

// Google Sheets: dd/MM/yyyy HH:mm:ss
const SHEET_DATE_PATTERN =
  /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;

export function parseTicketDate(value: string): Date {
  const match = value.trim().match(SHEET_DATE_PATTERN);

  if (match) {
    const [, day, month, year, hour, minute, second] = match;

    // Sheet timestamp được hiểu là giờ Việt Nam (UTC+7).
    const utcMilliseconds = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - 7,
      Number(minute),
      Number(second),
    );

    const date = new Date(utcMilliseconds);

    // Kiểm tra tránh các ngày không hợp lệ như 31/02.
    const vnParts = getVietnamDateParts(date);

    if (
      vnParts.year !== year ||
      vnParts.month !== month ||
      vnParts.day !== day ||
      vnParts.hour !== hour ||
      vnParts.minute !== minute ||
      vnParts.second !== second
    ) {
      return new Date(NaN);
    }

    return date;
  }

  // ISO có timezone, ví dụ 2026-11-03T08:23:47.395Z
  // hoặc 2026-11-03T15:23:47+07:00.
  const hasTimezone =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(
      value,
    );

  if (!hasTimezone) return new Date(NaN);

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? new Date(NaN)
    : parsed;
}

function getVietnamDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: VIETNAM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

export function formatTicketTime(value: string): string {
  const date = parseTicketDate(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VIETNAM_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function getTicketDateKey(value: string): string {
  const date = parseTicketDate(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const { year, month, day } = getVietnamDateParts(date);

  return `${year}-${month}-${day}`;
}
