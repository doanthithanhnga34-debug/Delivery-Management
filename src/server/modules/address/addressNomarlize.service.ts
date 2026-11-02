export interface NormalizedAddress {
  originalText: string;
  normalizedText: string;
  district: string | null;
  ward: string | null;
  addressSystem: "old" | "new" | "unknown";
}

export interface ResolvedAddress {
  originalAddress: string;
  oldDistrict: string | null;
  oldWard: string | null;
  newWard: string;
  newAddress: string;
}
function removeAccents(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d");
}
function normalizeText(value: string): string {
  return removeAccents(value).toLowerCase().replace(/\s+/g, " ").trim();
}
function normalizeNumber(value: string): string {
  return String(Number(value));
}

function capitalizeWords(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (char) => char.toUpperCase());
}

function extractDistrict(address: string): string | null {
  const text = normalizeText(address);

  const districtMatch = text.match(/(?:^|[\s,;,])(?:quan|q)\.?\s*(\d{1,2})\b/);

  if (districtMatch) {
    return `Quận ${normalizeNumber(districtMatch[1])}`;
  }
  const segments = text.split(/[,;\n]/);

  for (const segment of segments) {
    const match = segment
      .trim()
      .match(/^(quan|huyen|thi xa|thanh pho)\s+(.+)$/);

    if (!match) continue;

    const type = match[1];
    const name = match[2].trim();

    if (type === "quan") return `Quận ${name}`;
    if (type === "huyen") return `Huyện ${name}`;
    if (type === "thi xa") return `Thị xã ${name}`;
    return `Thành phố ${name}`;
  }

  return null;
}

function extractWard(address: string): string | null {
  const text = normalizeText(address);

  // Nhận diện P6, P.6, P 6, Phường 6
  const numberedMatch = text.match(
    /(?:^|[\s,;,])(?:phuong\s*|p\.?\s*|f\s*)(\d{1,3})\b/i,
  );

  if (numberedMatch) {
    return `Phường ${Number(numberedMatch[1])}`;
  }
  const startPattern =
  /(?:^|[\s,;,])(phuong\s+|p(?:\.\s*|\s+)|xa\s+|x(?:\.\s*|\s+)|thi tran\s+|tt(?:\.\s*|\s+))/g;

  for (const match of text.matchAll(startPattern)) {
    // const rawType = match.groups?.type?.trim();
  const rawType = match[1]?.trim();


    if (!rawType) continue;

    const start = (match.index ?? 0) + match[0].length;
    const remainder = text.slice(start);

    const boundary =
      /[,;\n]|\s+(?:(?:q|quan)\.?\s*\d+|huyen\s+|tp\.?\s*|thanh pho\s+|tinh\s+)/;

    const boundaryMatch = boundary.exec(remainder);

    const name = (
      boundaryMatch ? remainder.slice(0, boundaryMatch.index) : remainder
    ).trim();

    if (!name) continue;

    const normalizedName = /^\d+$/.test(name) ? String(Number(name)) : name;

    if (/^(xa|x)(?:\.|\s|$)/.test(rawType)) {
      return `Xã ${normalizedName}`;
    }

    if (/^(thi tran|tt)(?:\.|\s|$)/.test(rawType)) {
      return `Thị trấn ${normalizedName}`;
    }

    return `Phường ${normalizedName}`;
  }

  return null;
}

export function normalizeAddress(address: string): NormalizedAddress {
  const originalText = address.trim();
  const normalizedText = normalizeText(originalText);

  const district = extractDistrict(originalText);
  const ward = extractWard(originalText);

  const isNumberedWard = ward !== null && /^Phường \d+$/i.test(ward);

  return {
    originalText,
    normalizedText,
    district,
    ward,
    addressSystem:
      district && ward
        ? "old"
        : !district && ward && !isNumberedWard
          ? "new"
          : "unknown",
  };
}
