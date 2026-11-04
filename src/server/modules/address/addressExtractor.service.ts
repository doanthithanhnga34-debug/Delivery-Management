import { AddressType } from "@/types/address.types";

interface ExtractedAddress {
  text: string;
  type: AddressType;
  confidence: number;
}

interface AddressSection {
  type: SectionType;
  text: string;
}

const SECTION_MARKERS: {
  type: SectionType;
  pattern: RegExp;
}[] = [
  {
    type: "invoice",
    pattern:
      /(?:thông\s*tin\s*(?:xuất\s*hóa\s*đơn|hóa\s*đơn|xhđ)|xuất\s*(?:hóa\s*đơn|hoá\s*đơn|hđ|hd)|hóa\s*đơn\s*đỏ|tên\s*(?:cty|công\s*ty)\s*:|công\s*ty\s+(?:tnhh|cổ\s*phần)|mã\s*số\s*thuế|mst\s*:)/giu,
  },
 {
  type: "carrier",
  pattern:
    /(?:chành\s*xe|chành\s+số\s*\d+|gửi\s*xe|gởi\s*xe|nhà\s*xe\s+(?!check\b|trước\b|chưa\b)[\p{L}]+|xe\s+(?!chạy\b|giao\b|đến\b|đi\b|về\b)[\p{Lu}][\p{L}]*(?:\s+[\p{Lu}][\p{L}]*){0,3})/giu,
},
  {
    type: "delivery",
    pattern:
      /(?:thông\s*tin\s*giao\s*hàng|địa\s*chỉ\s*giao\s*hàng|địa\s*chỉ\s*giao|địa\s*chỉ\s*nhận|giao\s*về|giao\s*tại|giao\s*đến|giao\s*tận\s*nơi|gửi\s*về|người\s*nhận\s*:|tên\s*ng\s*nhận\s*:)/giu,
  },
];

type SectionType = AddressType;

const INVOICE_START =
  /(?:thông tin xuất hóa đơn|thông tin hóa đơn|xuất hóa đơn|hóa đơn đỏ|mã số thuế|(?:^|\s)mst\s*:)/iu;

const CARRIER_START =
  /(?:nhà xe|chành xe|gửi xe|gởi xe|gửi ra chành|gởi ra chành|bến xe|xe phúc an|xe minh huy|xe giang)/iu;

const DELIVERY_START =
  /(?:địa chỉ giao hàng|địa chỉ giao|giao về|giao tại|giao đến|người nhận\s*:|giao tận nơi)/iu;

const ADMIN_PATTERN =
  /(?:phường|xã|quận|huyện|thành\s*phố|tỉnh|thị\s*xã|thị\s*trấn|kđt|\b[pq]\.?\s*\d{1,2}\b|\btp\.?\s*[\p{L}]+|bình\s*thạnh|thủ\s*đức)/iu;

const STREET_PATTERN =
  /(?:\b(?:số\s*)?\d{1,5}[a-z]?(?:\/\d+[a-z]?)*\s+(?:đường|đ\.|hẻm|ngõ|quốc\s*lộ|ql)\s*[\p{L}\d]+|\b(?:hẻm|ngõ)\s+\d+|\b[A-Z]\d{2,}\s*,?\s*(?:đường|đ\.)|\b\d{1,4}(?:\/\d+)*[a-z]?\s+[\p{L}]+(?:\s+[\p{L}]+){1,5})/iu;

const SHORT_ADDRESS_PATTERN =
  /(?:kios|kiốt|ki-ốt|đường|hẻm|ngõ|quốc lộ|khu phố|ấp|chợ)\s+[\p{L}\d/]+/iu;

const PRODUCT_PATTERN =
  /(?:\b\d+\s*(?:kg|thùng|gói|chai|bịch|hũ|hộp)\b|bánh gạo|chả cá|mì udon|kim chi|bột phô mai)/iu;

const MONEY_PATTERN =
  /(?:\bship\s*\d+|thu khách\s*\d+|công nợ\s*\d+|\bck\s*\d+)/iu;

const CONTACT_PATTERN =
  /(?:sđt|số điện thoại|điện thoại|email|gmail|hotline)/iu;

const RECEIVER_SUFFIX_PATTERN =
  /\s+(?:anh|chị|cô|chú|em|a\.|c\.)\s+[\p{L}]+(?=\s*[-,:]?\s*(?:0\d{9}|\+84))/iu;

const HOUSE_NUMBER_STREET_START =
  /\b\d{1,4}(?:\/\d{1,4}){0,4}[a-z]?\s+[\p{L}]+(?:\s+[\p{L}]+){0,5}/giu;

const BUILDING_STREET_START =
  /\b[A-Z]\d{2,}\s*,?\s*(?:đường|đ\.)\s*[\p{L}\d]+/iu;

const COMMA_HOUSE_ADDRESS_START =
  /\b\d{1,5}[a-z]?(?:\/\d+)*\s*,\s*(?:(?:quốc\s*lộ|ql|đường|đ\.)\s*)?[\p{L}\d]+/iu;

const ADDRESS_LABEL_PATTERN =
  /(?:địa\s*chỉ(?:\s*(?:giao(?:\s*hàng)?|nhận|e))?|đc|đ\/c)\s*[:：]\s*/giu;

const HOUSE_WITH_STREET =
  /\b\d{1,5}[a-z]?(?:\/\d+[a-z]?)*\s*,?\s*(?:đường|đ\.|hẻm|ngõ|quốc\s*lộ|ql)\s*[\p{L}\d]+/iu;

const HOUSE_WITH_NAME =
  /\b\d{1,4}[a-z]?(?:\/\d+[a-z]?)*\s*,?\s+[\p{L}]+(?:\s+[\p{L}]+){0,5}/giu;

const NON_NUMBERED_ADDRESS =
  /(?:chợ|ấp|khu\s*phố|khu\s*dân\s*cư|kdc|kđt|chung\s*cư|bến)\s+[\p{L}\d]+/iu;

const PRODUCT_QUANTITY =
  /\b\d+\s+(?:bánh|mì|sốt|nước|bột|gạo|chả|kim\s*chi|tương|phô\s*mai|súp)\b/iu;

const PAYMENT_START =
  /\b(?:ship\s*\d+|thu\s*khách|công\s*nợ|ck\s*(?:sau\s*)?\d+)\b/iu;

const EXPLICIT_STREET_START =
  /(?:\b(?:hẻm|ngõ)\s+\d+(?:\/\d+)*|\b(?:số\s*)?\d{1,5}[a-z]?(?:\/\d+[a-z]?)*\s+(?:đường|đ\.|hẻm|ngõ|quốc\s*lộ|ql)\s*[\p{L}\d]+)/iu;
const ALPHANUMERIC_HOUSE_START =
  /\b[A-Z]\d{1,5}(?:\/\d+[A-Z]?)+\s+[\p{L}]+(?:\s+[\p{L}]+){0,5}/iu;


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

function splitSections(content: string): AddressSection[] {
  const markers: {
    index: number;
    type: SectionType;
  }[] = [];

  for (const { type, pattern } of SECTION_MARKERS) {
    for (const match of content.matchAll(pattern)) {
      markers.push({
        index: match.index,
        type,
      });
    }
  }

  markers.sort((a, b) => a.index - b.index);

  const sections: AddressSection[] = [];

  if (markers.length === 0) {
    return [
      {
        type: isAddressCandidate(content) ? "delivery" : "unknown",
        text: content,
      },
    ];
  }
  if (markers[0].index > 0) {
    sections.push({
      type: "delivery",
      text: content.slice(0, markers[0].index).trim(),
    });
  }

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const next = markers[i + 1];

    const text = content
      .slice(marker.index, next?.index ?? content.length)
      .trim();

    if (text) {
      sections.push({
        type: marker.type,
        text,
      });
    }
  }

  return sections;
}

function isAddressCandidate(text: string): boolean {
  if (text.length < 7) return false;

  const hasAdmin = ADMIN_PATTERN.test(text);
  const hasStreet = STREET_PATTERN.test(text);
  const hasShortAddress = SHORT_ADDRESS_PATTERN.test(text);
  const hasArea = NON_NUMBERED_ADDRESS.test(text);
  const hasAlphanumericHouse =
  ALPHANUMERIC_HOUSE_START.test(text);

  if (
  !hasAdmin &&
  !hasStreet &&
  !hasShortAddress &&
  !hasArea &&
  !hasAlphanumericHouse
) {
  return false;
}

  if (PRODUCT_QUANTITY.test(text.trim()) && !hasAdmin && !hasArea) {
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

function findAddressStart(text: string): number {
  const labels = [...text.matchAll(ADDRESS_LABEL_PATTERN)];

  if (labels.length > 0) {
    const label = labels[labels.length - 1];
    return (label.index ?? 0) + label[0].length;
  }

  const explicit = [
     ALPHANUMERIC_HOUSE_START,
    EXPLICIT_STREET_START,
    BUILDING_STREET_START,
    HOUSE_WITH_STREET,
    COMMA_HOUSE_ADDRESS_START,
  ];

  const positions: number[] = [];

  for (const pattern of explicit) {
    const match = pattern.exec(text);

    if (match) {
      positions.push(match.index);
    }
  }

  if (positions.length > 0) {
    return Math.min(...positions);
  }

  // Địa chỉ số nhà + tên đường không có chữ "đường"
  for (const match of text.matchAll(HOUSE_WITH_NAME)) {
    const candidate = match[0];

    // Không nhận giờ: 10H, 16H30...
    if (/^\d{1,2}h(?:\d{1,2})?/iu.test(candidate)) {
      continue;
    }

    // Không nhận số lượng sản phẩm
    if (PRODUCT_QUANTITY.test(candidate)) {
      continue;
    }

    // Không nhận số điện thoại
    if (/^0\d{9,10}\b/u.test(candidate)) {
      continue;
    }

    const nearbyText = text.slice(match.index, match.index + 120);

    const product = PRODUCT_QUANTITY.exec(nearbyText);
    const payment = PAYMENT_START.exec(nearbyText);

    let end = nearbyText.length;

    if (product) end = Math.min(end, product.index);
    if (payment) end = Math.min(end, payment.index);

    const addressRegion = nearbyText.slice(0, end);

    if (ADMIN_PATTERN.test(addressRegion)) {
      return match.index;
    }
  }

  const area = NON_NUMBERED_ADDRESS.exec(text);

  if (area) {
    return area.index;
  }

  return -1;
}
function trimAddress(text: string): string {
  const startIndex = findAddressStart(text);

  if (startIndex === -1) return "";

  const addressPart = text.slice(startIndex).trim();

  const endPatterns: RegExp[] = [
    RECEIVER_SUFFIX_PATTERN,

    // Số điện thoại
    /(?:\+84|0)\s*(?:\d[\s.]*){8,10}/u,

    // Sản phẩm có đơn vị
    /\b\d+\s*(?:kg|thùng|gói|chai|bịch|hũ|hộp|set)\b/iu,

    // Sản phẩm bắt đầu bằng số lượng
    /(?:^|\s)[-–]?\s*\d+\s+(?:bánh|mì|sốt|gạo|bột|chả|củ|nước|kim\s*chi|súp|tương)\b/iu,

    // Tiền
    /\b(?:ship\s*\d+|thu\s*khách|công\s*nợ|ck\s*(?:sau\s*)?\d+)/iu,

    // Thông tin liên hệ
    /\b(?:mst|mã\s*số\s*thuế|email|gmail|mail|sđt|sdt)\s*:?/iu,

    // Email không có nhãn
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu,

    // Tên doanh nghiệp
    /\b(?:hộ\s*kinh\s*doanh|tên\s*(?:cty|công\s*ty))\b/iu,

    /-{3,}/u,
  ];

  let endIndex = addressPart.length;

  for (const pattern of endPatterns) {
    const match = pattern.exec(addressPart);

    if (match && match.index < endIndex) {
      endIndex = match.index;
    }
  }

  return cleanText(addressPart.slice(0, endIndex));
}

export function extractAddresses(content: string): ExtractedAddress[] {
  if (!content?.trim()) return [];

  const prepared = prepareContent(content);
  const sections = splitSections(prepared);

  const results: ExtractedAddress[] = [];

  for (const section of sections) {
    const lines = section.text.split("\n").map(cleanText).filter(Boolean);

    for (const line of lines) {
      const addressText = trimAddress(line);

      if (!addressText) continue;
      if (!isAddressCandidate(addressText)) continue;

      results.push({
        text: addressText,
        type: section.type,
        confidence: calculateConfidence(addressText, section.type),
      });
    }
  }

  const unique = new Map<string, ExtractedAddress>();

  for (const address of results) {
    const key = `${address.type}:${address.text.toLowerCase()}`;

    const previous = unique.get(key);

    if (!previous || previous.confidence < address.confidence) {
      unique.set(key, address);
    }
  }

  return [...unique.values()];
}

export function getDeliveryAddress(content: string): ExtractedAddress | null {
  const candidates = extractAddresses(content)
    .filter((item) => item.type === "delivery")
    .sort((a, b) => b.confidence - a.confidence);
  if (candidates.length !== 1) return null;

  return candidates[0].confidence >= 0.7 ? candidates[0] : null;
}
