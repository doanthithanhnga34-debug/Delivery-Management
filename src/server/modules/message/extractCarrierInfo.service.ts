import { extractAddresses } from "../address/addressExtractor.service";

interface CarrierInfo{
    name:string | null;
    address:string | null;
    hasCarrier:boolean
}
const CARRIER_NAME_PATTERN =
  /(?:nhà\s*xe|chành\s*xe|gửi\s*xe|gởi\s*xe|xe)[ \t]+([\p{L}]+(?:-[\p{L}]+)*(?:[ \t]+[\p{L}]+(?:-[\p{L}]+)*){0,3})/giu;

const CARRIER_STOP_WORDS = new Set([
  "check",
  "chạy",
  "giao",
  "đi",
  "đến",
  "về",
  "trước",
  "chưa",
  "kiểm",
]);

const CARRIER_END_WORDS = new Set([
  "thông",
  "tin",
  "xuất",
  "hóa",
  "hoá",
  "đơn",
  "mst",
  "địa",
  "chỉ",
  "sđt",
]);


export function extractCarrierInfo(content: string): CarrierInfo {
  const addresses = extractAddresses(content);

  const carrierAddress =
    addresses.find((item) => item.type === "carrier")?.text ?? null;

  const name = extractCarrierName(content);

  return {
    name,
    address: carrierAddress,
    hasCarrier: name !== null || carrierAddress !== null,
  };
}

function extractCarrierName(content: string): string | null {
  const normalized = content.replace(/-{3,}/g, "\n");

  for (const match of normalized.matchAll(CARRIER_NAME_PATTERN)) {
    const words = match[1].trim().split(/\s+/);

    if (CARRIER_STOP_WORDS.has(words[0].toLowerCase())) {
      continue;
    }

    const nameWords: string[] = [];

    for (const word of words) {
      if (CARRIER_END_WORDS.has(word.toLowerCase())) {
        break;
      }

      nameWords.push(word);
    }

    if (nameWords.length === 0) continue;

    const prefix = match[0]
      .slice(0, match[0].length - match[1].length)
      .trim();

    return `${prefix} ${nameWords.join(" ")}`;
  }

  return null;
}