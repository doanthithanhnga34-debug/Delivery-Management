export interface ParsedTicket {
  shippingFee: number | null;
  codAmount: number | null;
  transportFee: number | null;
  otherFee: number | null;
}

function parseMoney(value: string): number | null {
  const raw = value.trim().toLowerCase();
  const match = raw.match(/^(\d[\d.,\s]*)(k|nghìn|ngàn|triệu|tr)?$/i);
  if (!match) return null;

  const amount = match[1].replace(/\s/g, "");
  const unit = match[2]?.toLowerCase();
  let number: number;

  if (unit === "k" || unit === "nghìn" || unit === "ngàn") {
    number = Number(amount.replace(",", ".")) * 1000;
  } else if (unit === "triệu" || unit === "tr" || unit === "trịu") {
    number = Number(amount.replace(",", ".")) * 1_000_000;
  } else if (/^\d{1,3}([.,]\d{3})+$/.test(amount)) {
    number = Number(amount.replace(/[.,]/g, ""));
  } else {
    number = Number(amount);
    if (number < 1000) number *= 1000;
  }

  return Number.isFinite(number) ? Math.round(number) : null;
}

function exactAmount(content: string, regex: RegExp): number | null {
  const match = content.match(regex);
  if (!match) return null;
  return parseMoney(match[1]);
}

const MONEY = String.raw`(\d[\d.,]*(?:\s*(?:k|nghìn|ngàn|triệu|tr|trịu))?)`;

export function parsedTicketContent(content: string): ParsedTicket {
  const normalized = content.normalize("NFC").replace(/\s+/g, " ").trim();

  return {
    shippingFee: exactAmount(
      normalized,
      new RegExp(String.raw`\bship\s*:?\s*` + MONEY, "i"),

    ),
    codAmount:exactAmount(
        normalized,
        new RegExp(
        String.raw`(?:thu\s+khách|tiền\s+cod|\bcod)\s*:?\s*` +
          MONEY,
        "i",
      ),
    ),
    transportFee:exactAmount(
        normalized,
       new RegExp(
        String.raw`(?:phí\s+chành|tiền\s+chành|phí\s+nhà\s+xe)\s*:?\s*` +
          MONEY,
        "i",
      ),
    ),
    otherFee:exactAmount(
        normalized,
         new RegExp(
        String.raw`(?:phí\s+khác|chi\s+phí\s+khác)\s*:?\s*` +
          MONEY,
        "i",
      ),
    )
  };
}
