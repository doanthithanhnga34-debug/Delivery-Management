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

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[.,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function capitalizeWords(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (char) => char.toUpperCase());
}

function extractDistrict(text: string): string | null {
  const numeric = text.match(
    /\b(?:quận|q\.?)\s*0*(\d{1,2})\b/iu,
  );

  if (numeric) {
    return `Quận ${Number(numeric[1])}`;
  }

  // Các quận có tên
  const namedDistricts = [
    "Bình Thạnh",
    "Bình Tân",
    "Tân Bình",
    "Tân Phú",
    "Phú Nhuận",
    "Gò Vấp",
    "Thủ Đức",
  ];

  const normalized = normalizeText(text);

  for (const district of namedDistricts) {
    const key = normalizeText(district);

    const withPrefix = new RegExp(
      `\\b(?:quan|q)\\s+${key}\\b`,
      "i",
    );

    if (withPrefix.test(normalized)) {
      return district;
    }
  }

  return null;
}
function extractWard(text: string): {
  ward: string | null;
  isNumbered: boolean;
} {
  const numeric = text.match(
    /\b(?:phường|p\.?)\s*0*(\d{1,2})\b/iu,
  );

  if (numeric) {
    return {
      ward: `Phường ${Number(numeric[1])}`,
      isNumbered: true,
    };
  }

  const named = text.match(
    /\b(?:phường|xã)\s+([\p{L}][\p{L}\s-]{1,45}?)(?=\s*[,;.]|\s+(?:quận|huyện|thành phố|tỉnh|tp\.?)\b|$)/iu,
  );

  if (named) {
    return {
      ward: capitalizeWords(named[1].trim()),
      isNumbered: false,
    };
  }

  return {
    ward: null,
    isNumbered: false,
  };
}

export function normalizeAddress(
  address: string,
): NormalizedAddress {
  const originalText = address.normalize("NFC").trim();

  const district = extractDistrict(originalText);
  const wardResult = extractWard(originalText);

  const addressSystem =
    wardResult.isNumbered && district
      ? "old"
      : "unknown";

  return {
    originalText,
    normalizedText: normalizeText(originalText),
    district,
    ward: wardResult.ward,
    addressSystem,
  };
}
