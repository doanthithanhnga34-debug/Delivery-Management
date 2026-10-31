export interface ParsedTicket {
  shippingFee: number | null;
  codAmount: string | null;
  transportFee: number | null;
  otherFee: number | null;
}

const MONEY = String.raw`(\d[\d.,]*(?:\s*(?:k|nghìn|ngàn|triệu|tr|trịu|đ|vnd))?)`;

function parseMoney(value: string): number | null {
  const raw = value.trim().toLowerCase();

  const match = raw.match(
    /^(\d[\d.,]*)(?:\s*(k|nghìn|ngàn|triệu|tr|trịu|đ|vnd))?$/i,
  );

  if (!match) return null;

  const amount = match[1];
  const unit = match[2]?.toLowerCase();

  let number: number;

  if (["k", "nghìn", "ngàn"].includes(unit ?? "")) {
    number = Number(amount.replace(",", ".")) * 1000;
  } else if (["triệu", "tr", "trịu"].includes(unit ?? "")) {
    number = Number(amount.replace(",", ".")) * 1_000_000;
  } else if (/^\d{1,3}([.,]\d{3})+$/.test(amount)) {
    number = Number(amount.replace(/[.,]/g, ""));
  } else {
    number = Number(amount.replace(",", "."));

    if (!["đ", "vnd"].includes(unit ?? "") && number < 1000) {
      number *= 1000;
    }
  }

  return Number.isFinite(number) ? Math.round(number) : null;
}

function extractAmount(
  content: string,
  regex: RegExp,
): number | null {
  const match = content.match(regex);

  if (!match) return null;

  return parseMoney(match[1]);
}


export function extractCodAmount(content: string): string | null {
  const regex =
    /(?<![\p{L}\p{N}])(thu\s+khách|ck|công\s+nợ|tiền\s+cod|cod)\s*[:：]?\s*(\d+(?:[.,]\d+)*(?:\s*(?:k|nghìn|ngàn|triệu|tr|đ|vnd))?)(?![\p{L}\p{N}])/iu;

  const match = content.match(regex);

  if (!match) return null;

  const paymentType = match[1].replace(/\s+/g, " ").trim();
  const amount = match[2].trim();

  return `${paymentType} ${amount}`;
}

export function parsedTicketContent(content: string): ParsedTicket {
  const normalized = content
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

  return {
    shippingFee: extractAmount(
      normalized,
      new RegExp(String.raw`\bship\s*:?\s*` + MONEY, "i"),
    ),

    codAmount: extractCodAmount(normalized),

    transportFee: extractAmount(
      normalized,
      new RegExp(
        String.raw`(?:phí\s+chành|tiền\s+chành|cước\s+chành)\s*[:：]?\s*` +
          MONEY,
        "i",
      ),
    ),

    otherFee: extractAmount(
      normalized,
      new RegExp(
        String.raw`(?:phí\s+khác|chi\s+phí\s+khác)\s*[:：]?\s*` +
          MONEY,
        "i",
      ),
    ),
  };
}