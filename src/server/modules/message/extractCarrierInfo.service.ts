import { extractAddresses } from "../address/addressExtractor.service";

interface CarrierInfo{
    name:string | null;
    address:string | null;
    hasCarrier:boolean
}
const CARRIER_NAME_PATTERN =[
/\b(?:nhà\s*xe|chành\s*xe)\s+([\p{L}]+(?:\s+[\p{L}]+){0,3})/giu,
    /\b(?:gửi\s*xe|gởi\s*xe)\s+([\p{L}]+(?:\s+[\p{L}]+){0,3})/giu,
    /\bxe\s+([\p{L}]+(?:\s+[\p{L}]+){0,3})/giu,
]
 
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
  "hộ",
  "kinh",
  "doanh",
  "công",
  "ty",
  "tnhh",
  "cccd",
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

  for (const pattern of CARRIER_NAME_PATTERN) {
    for (const match of content.matchAll(pattern)) {
      const words = match[1].trim().split(/\s+/);
      const nameWords: string[] = [];

      for (const word of words) {
        if (CARRIER_END_WORDS.has(word.toLowerCase())) break;
        nameWords.push(word);
      }

      if (nameWords.length === 0) continue;

      const prefix = match[0]
        .slice(0, match[0].length - match[1].length)
        .trim();

      return `${prefix} ${nameWords.join(" ")}`.trim();
    }
  }

  return null;
}