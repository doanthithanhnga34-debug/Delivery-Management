import type { AddressType } from "@/types/address.types";

export interface ExtractedAddress {
  text: string;
  type: AddressType;
  confidence: number;
}

type SectionType = AddressType;
interface AddressSection {
  type: SectionType;
  text: string;
}

const INVOICE_MARKER = /(?:th[oô]ng\s*tin\s*(?:xu[aấ]t\s*)?(?:h[oó]a|ho[aá])\s*đ[oơ]n|xu[aấ]t\s*(?:h[oó]a|ho[aá])\s*đ[oơ]n|t[eê]n\s*người\s*mua\s*:|t[eê]n\s*đơn\s*vị\s*:|hộ\s*kinh\s*doanh|công\s*ty\s*tnhh|mã\s*số\s*thuế\s*:|mst\s*:)/giu;
const CARRIER_MARKER = /(?:nhà\s*xe\s+(?!check\b|trước\b|chưa\b)|chành\s*xe|gửi\s*xe|gởi\s*xe|xe\s+buýt\s+số\s*\d+|(?<![\p{L}])xe\s+(?=[\p{Lu}])\p{Lu}[\p{L}]*(?:\s+\p{Lu}[\p{L}]*){0,2})/giu;
const DELIVERY_MARKER = /(?:địa\s*chỉ\s*(?:giao\s*hàng|giao|nhận)\s*:|giao\s*(?:về|tại|đến)\s+|gửi\s*về\s+|nhận\s*hàng\s+)/giu;

const PHONE = /(?:\+84[\s.-]?(?:\d[\s.-]?){9}|(?<!\d)0\d(?:[\s.]?\d){8,9}(?!\d))/u;
const MONEY = /(?:\b(?:thu\s*khách|công\s*nợ|chuyển\s*khoản|ck|ship|phí\s*ship)\s*[:：=\-]?\s*\d+)/iu;
const PRODUCT_START = /(?:^|[\s,;])[-–]?\s*\d+\s*(?:(?:kg|gói|thùng|chai|bịch|hộp|hũ|set)\b|(?:chả|bánh|súp|sốt|nước|bột|gạo|mì|tương|phô\s*mai|kim\s*chi|rong\s*biển|ớt)\b)/iu;
const CONTACT_END = /(?:\b(?:sđt|sdt|email|mail\s*nhận|liên\s*hệ|mst|mã\s*số\s*thuế|cccd|chủ\s*hộ|người\s*đại\s*diện)\s*[:：]|[\w.+-]+@[\w.-]+\.[a-z]{2,})/iu;
const ADDRESS_LABEL = /(?:địa\s*chỉ|đ\/?c)\s*[:：]\s*/giu;
const DELIVERY_NOTE_START =
  /(?:chị\s*gửi\s*đơn\s*nhé|giao\s*giúp\s*chị\s*nha|giao\s*giúp\s*em|nhờ\s*giao\s*giúp|giao\s*giùm\s*chị|giao\s*giùm\s*em)/iu;

const ADDRESS_START_PATTERNS: RegExp[] = [
  /(?:cổng\s+[A-Z]\d+\s*[-–,]?\s*(?=đường|đ\.)|(?:kios|kiốt|ki-ốt)\s+số\s+\d+|số\s*nhà\s+\d+|bãi\s*xe\s+[^,]{0,45}?\bđối\s*diện\s+số\s+\d+)/iu,
  /(?<![\p{L}\d])(?!(?:\d{1,2}h(?:\d{1,2})?|(?:\d{1,2}:\d{2}))\b)(?:[A-Z]{1,3}\d{1,5}(?:\/\d+[A-Z]?)?|\d{1,5}(?:\/\d+[A-Z]?)*)[a-z]?\s+[\p{L}]/iu,
  /(?:chợ|khu\s*dân\s*cư|kdc|kđt|chung\s*cư|ấp|phố|đường|hẻm|ngõ)\s+[\p{L}\d]/iu,
];
const AREA_HINT = /(?:\b(?:phường|phuong|quận|quan|huyện|xã|tỉnh|thành\s*phố|kdc|kđt|chợ|ấp|đường|phố|hẻm|khu\s*dân\s*cư)\b|\b[pq]\.?\s*\d{1,2}\b|\b(?:q|p)\.?\s*[\p{Lu}][\p{L}]+|\b(?:bình\s*thạnh|gò\s*vấp|phú\s*nhuận|thủ\s*đức|hóc\s*môn|cam\s*ranh|gia\s*lai|đồng\s*nai|củ\s*chi)\b)/iu;

function cleanText(text: string): string {
  return text.normalize("NFC")
    .replace(/\s+/g, " ")
    .replace(/^[\s,;:：\-–]+|[\s,;:：\-–]+$/g, "")
    .trim();
}

function prepareContent(content: string): string {
  return content.normalize("NFC")
    .replace(/(?:^|\s)#\d+(?=\s)/gu, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/-{5,}/g, "\n")
    .trim();
}

function splitSections(content: string): AddressSection[] {
  const markers: { index: number; type: SectionType }[] = [];
  for (const [type, pattern] of [
    ["invoice", INVOICE_MARKER],
    ["carrier", CARRIER_MARKER],
    ["delivery", DELIVERY_MARKER],
  ] as const) {
    for (const match of content.matchAll(pattern)) {
      markers.push({ index: match.index, type });
    }
  }
  markers.sort((a, b) => a.index - b.index);
  const sections: AddressSection[] = [];
  let position = 0;
  let type: SectionType = "delivery";
  for (const marker of markers) {
    if (marker.index < position) continue;
    const preceding = cleanText(content.slice(position, marker.index));
    if (preceding) sections.push({ type, text: preceding });
    type = marker.type;
    position = marker.index;
  }
  const rest = cleanText(content.slice(position));
  if (rest) sections.push({ type, text: rest });
  return sections;
}

function firstMatchIndex(text: string, patterns: RegExp[]): number {
  let earliest = text.length;
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match.index < earliest) earliest = match.index;
  }
  return earliest;
}

function trimAtEndMarkers(text: string): string {
  const cut = firstMatchIndex(text, [
    DELIVERY_NOTE_START,
    PRODUCT_START,
    MONEY,
    CONTACT_END,
  ]);

  const prefix = text.slice(0, cut);

  const start = findAddressStart(prefix);

  if (start < 0) {
    return cleanText(
      prefix.replace(new RegExp(PHONE.source, "gu"), " "),
    );
  }

  const phones = [
    ...prefix.matchAll(new RegExp(PHONE.source, "gu")),
  ];

  const phoneAfterAddress = phones.find(
    (phone) => phone.index >= start,
  );

  if (phoneAfterAddress) {
    return cleanText(
      prefix.slice(0, phoneAfterAddress.index),
    );
  }

  return cleanText(
    prefix.replace(new RegExp(PHONE.source, "gu"), " "),
  );
}

function looksLikeAddress(text: string): boolean {
  if (text.length < 8 || text.length > 220) return false;
  if (MONEY.test(text) || PRODUCT_START.test(text)) return false;
  if (!AREA_HINT.test(text)) return false;
  if (/^\d+(?:[.,]\d+)*\s*(?:ck|thu\s*khách|ship)\b/iu.test(text)) return false;
  return true;
}

function findAddressStart(text: string): number {
  const label = [...text.matchAll(ADDRESS_LABEL)].at(-1);
  if (label) return label.index + label[0].length;
  const starts = ADDRESS_START_PATTERNS.map((pattern) => pattern.exec(text))
    .filter((match): match is RegExpExecArray => match !== null);
  if (starts.length === 0) return -1;
  return Math.min(...starts.map((match) => match.index));
}

function extractDelivery(section: string): string | null {
  const prepared = cleanText(section);

  const relevant = trimAtEndMarkers(prepared);
  if (!relevant) return null;
  const startIndex = findAddressStart(relevant);
  if (startIndex < 0) {

    const destination = /(?:gửi\s*về|giao\s*về)\s+(.+)$/iu.exec(relevant);
    if (destination && AREA_HINT.test(destination[1])) return cleanText(destination[1]);
    return null;
  }
  let address = cleanText(relevant.slice(startIndex));
 
  address = address.replace(/\s+(?:tên\s+(?:khách|người\s*nhận)|người\s*nhận)\s*[:：]?\s*.+$/iu, "");
  return looksLikeAddress(address) ? address : null;
}

function extractInvoice(section: string): string | null {
  const label = [...section.matchAll(ADDRESS_LABEL)].at(-1);
  let candidate = label
    ? section.slice(label.index + label[0].length)
    : section;
  if (!label) {
    const addressNumber = /(?<!\d)\d{1,5}(?:\/\d+)*\s+[\p{L}]/iu.exec(candidate);
    if (!addressNumber) return null;
    candidate = candidate.slice(addressNumber.index);
  }
  candidate = cleanText(candidate.split(/(?:\b(?:chủ\s*hộ|cccd|mst|mã\s*số\s*thuế|mail|email|thông\s*tin\s*nhận\s*hóa\s*đơn|người\s*đại\s*diện|liên\s*hệ)\s*[:：]?)/iu)[0]);
  return looksLikeAddress(candidate) ? candidate : null;
}

function extractCarrierAddress(section: string): string | null {
  const relevant = cleanText(section);
  const start = findAddressStart(relevant);
  if (start < 0) return null;
  const candidate = trimAtEndMarkers(relevant.slice(start));
  return looksLikeAddress(candidate) ? candidate : null;
}

function calculateConfidence(text: string, type: AddressType): number {
  let score = type === "delivery" ? 0.55 : 0.5;
  if (/(?:đường|phường|quận|huyện|xã|tỉnh|thành\s*phố|p\.?\s*\d+|q\.?\s*\d+)/iu.test(text)) score += 0.2;
  if (/\d+[A-Za-z]?(?:\/\d+[A-Za-z]?)?\s+[\p{L}]/iu.test(text)) score += 0.15;
  if (text.length >= 20) score += 0.05;
  return Math.min(0.95, Number(score.toFixed(2)));
}

export function extractAddresses(content: string): ExtractedAddress[] {
  if (!content?.trim()) return [];
  const sections = splitSections(prepareContent(content));
  const results: ExtractedAddress[] = [];
  for (const section of sections) {
    for (const line of section.text.split("\n").map(cleanText).filter(Boolean)) {
      const address = section.type === "invoice"
        ? extractInvoice(line)
        : section.type === "carrier"
          ? extractCarrierAddress(line)
          : extractDelivery(line);
      if (!address) continue;
      results.push({
        text: address,
        type: section.type,
        confidence: calculateConfidence(address, section.type),
      });
    }
  }
  const unique = new Map<string, ExtractedAddress>();
  for (const item of results) {
    const key = `${item.type}:${item.text.toLocaleLowerCase("vi-VN")}`;
    if (!unique.has(key)) unique.set(key, item);
  }
  return [...unique.values()];
}

export function getDeliveryAddress(content: string): ExtractedAddress | null {
  const matches = extractAddresses(content).filter((item) => item.type === "delivery");
  return matches.length === 1 && matches[0].confidence >= 0.7 ? matches[0] : null;
}
