import { AddressType } from "@/types/address.types";

interface ExtractedAddress {
  text: string;
  type: AddressType;
  confidence: number;
}

type SectionType = AddressType;

const INVOICE_START =
  /(?:thông tin xuất hóa đơn|thông tin hóa đơn|xuất hóa đơn|hóa đơn đỏ|mã số thuế|(?:^|\s)mst\s*:)/iu;

const CARRIER_START =
  /(?:nhà xe|chành xe|gửi xe|gởi xe|gửi ra chành|gởi ra chành|bến xe|xe phúc an|xe minh huy|xe giang)/iu;

const DELIVERY_START =
  /(?:địa chỉ giao hàng|địa chỉ giao|giao về|giao tại|giao đến|người nhận\s*:|giao tận nơi)/iu;

const ADMIN_PATTERN =
  /(?:\b(?:phường|xã|quận|huyện|thành phố|tỉnh|thị xã|thị trấn|khu đô thị|kđt)\b|\b[pq]\.?\s*\d{1,2}\b|\btp\.?\s*[\p{L}]+)/iu;

const STREET_PATTERN =
  /(?:\b\d{1,4}(?:\/\d{1,4}){0,4}[a-z]?\s+(?:đường|hẻm|ngõ|đ\.|quốc lộ|ql)\s*[\p{L}\d]+|\b\d{1,4}(?:\/\d{1,4}){0,4}[a-z]?\s+[\p{L}]+(?:\s+[\p{L}]+){1,4})/iu;

const SHORT_ADDRESS_PATTERN =
  /(?:kios|kiốt|ki-ốt|đường|hẻm|ngõ|quốc lộ|khu phố|ấp|chợ)\s+[\p{L}\d/]+/iu;

const PRODUCT_PATTERN =
  /(?:\b\d+\s*(?:kg|thùng|gói|chai|bịch|hũ|hộp)\b|bánh gạo|chả cá|mì udon|kim chi|bột phô mai)/iu;

const MONEY_PATTERN =
  /(?:\bship\s*\d+|thu khách\s*\d+|công nợ\s*\d+|\bck\s*\d+)/iu;

const CONTACT_PATTERN =
  /(?:sđt|số điện thoại|điện thoại|email|gmail|hotline)/iu;

function cleanText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:：\-–]+/, "")
    .replace(/[\s,;:：\-–]+$/, "")
    .trim();
}

function prepareContent(content: string): string {
  return content
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/-{5,}/g, "\n")
    .replace(
      /(\S)\s+(?=(?:thông tin xuất hóa đơn|thông tin hóa đơn|nhà xe|gửi xe|gởi xe|bến xe)\b)/giu,
      "$1\n",
    )
    .trim();
}

function isAddressCandidate(text: string): boolean {
  if (text.length < 7) return false;
  const hasAdmin = ADMIN_PATTERN.test(text);
  const hasStreet = STREET_PATTERN.test(text);
  const hasShortAddress = SHORT_ADDRESS_PATTERN.test(text);

  if (!hasAdmin && !hasStreet && !hasShortAddress) {
    return false;
  }

  if (PRODUCT_PATTERN.test(text) && !hasAdmin && !hasShortAddress) {
    return false;
  }
  return true;
}

function detectionSection(line: string, current: SectionType): SectionType {
  if (INVOICE_START.test(line)) return "invoice";
  if (CARRIER_START.test(line)) return "carrier";
  if (DELIVERY_START.test(line)) return "delivery";
  return current;
}

function calculateConfidence(text: string, type: AddressType): number {
  let score = 0.3;

  if (ADMIN_PATTERN.test(text)) score += 0.2;
  if (STREET_PATTERN.test(text)) score += 0.2;
  if (SHORT_ADDRESS_PATTERN.test(text)) score += 0.1;

  if (type === "delivery") score += 0.15;
  if (type === "carrier") score += 0.1;
  if (type === "invoice") score += 0.1;

  if (CONTACT_PATTERN.test(text)) score -= 0.05;
  if (MONEY_PATTERN.test(text)) score -= 0.05;

  return Math.max(0, Math.min(0.95, Number(score.toFixed(2))));
}

function trimAddress(text: string): string {
  return cleanText(
    text
      .replace(
        /^(?:địa chỉ giao hàng|địa chỉ giao|địa chỉ|giao về|giao tại|giao đến)\s*[:：]?\s*/iu,
        "",
      )
      .split(
        /(?=\b(?:thu khách|công nợ|ship\s*\d+|ck\s*\d+|mst\s*:|email\s*:))/iu,
      )[0],
  );
}
export function extractAddresses(content: string): ExtractedAddress[] {
  if (!content?.trim()) return [];
  const prepared = prepareContent(content);
  const lines = prepared.split("\n").map(cleanText).filter(Boolean);

  const results: ExtractedAddress[] = [];
  let currentSection: SectionType = "unknown";
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    currentSection = detectionSection(line, currentSection);
    if (!isAddressCandidate(line)) continue;
    let addressText = trimAddress(line);
    if (index + 1 < lines.length) {
      const nextLine = lines[index + 1];
      const nextSection = detectionSection(nextLine, currentSection);
      const canJoin =
        nextSection === currentSection &&
        ADMIN_PATTERN.test(nextLine) &&
        !PRODUCT_PATTERN.test(nextLine) &&
        !INVOICE_START.test(nextLine) &&
        !CARRIER_START.test(nextLine);
      if (canJoin) {
        addressText = cleanText(`${addressText}, ${trimAddress(nextLine)}`);
        index++;
      }
    }
    if(!isAddressCandidate(addressText)) continue;
    const type = currentSection;
     results.push({
      text: addressText,
      type,
      confidence: calculateConfidence(addressText, type),
    });
  }

  const unique = new Map<string, ExtractedAddress>();
  for(const address of results){
    const key= `${address.type}:${address.text.toLowerCase()}`;
    const previous = unique.get(key);
    if(!previous || previous.confidence < address.confidence){
        unique.set(key, address)
    }
  }
  return [...unique.values()]
}

export function getDeliveryAddress(content:string,) : ExtractedAddress |  null{
   const candidates = extractAddresses(content)
    .filter((item) => item.type === "delivery")
    .sort((a, b) => b.confidence - a.confidence);
  if (candidates.length !== 1) return null;

  return candidates[0].confidence >= 0.7
    ? candidates[0]
    : null;
}
