import { AddressConversionResult, convertOldAddress } from "./addressConvert.service";


export interface ResolvedAddressOption {
  wardCode: string;
  wardName: string;
  fullAddress: string;
  scope: "full" | "partial";
}

export interface AddressResolution {
  status: "matched" | "review" | "not_found";
  originalAddress: string;
  options: ResolvedAddressOption[];
  reason: string | null;
}

function formatWard(name: string): string {
  return /^(phường|xã|đặc khu)\s/i.test(name)
    ? name
    : `Phường ${name}`;
}

function extractStreetAddress(
  fullAddress: string,
  ward: string,
): string {
  const escaped = ward.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Tách phần trước phường cũ, ví dụ:
  // "187 Điện Biên Phủ, P Đa Kao, Quận 1"
  const pattern = new RegExp(
    `\\s*,?\\s*(?:phường|p\\.)?\\s*${escaped}\\b.*$`,
    "iu",
  );

  return fullAddress.replace(pattern, "").replace(/,\s*$/, "").trim();
}

export function resolveDeliveryAddress(
  originalAddress: string,
  streetAddress: string | null,
): AddressResolution {
  const result: AddressConversionResult =
    convertOldAddress(originalAddress);

  if (result.status === "not_found") {
    return {
      status: "not_found",
      originalAddress,
      options: [],
      reason: result.reason,
    };
  }

  const candidates =
    result.status === "exact"
      ? [result.candidate]
      : result.candidates;

  const options = candidates.map((candidate) => {
    const street = streetAddress?.trim() || "";

    const wardName = formatWard(candidate.newWard);

    const province = /^(thành phố|tỉnh)\s/i.test(
      candidate.newProvince,
    )
      ? candidate.newProvince
      : candidate.newProvince === "Hồ Chí Minh"
        ? "Thành phố Hồ Chí Minh"
        : candidate.newProvince;

    return {
      wardCode: candidate.newWardCode,
      wardName,
      scope: candidate.scope,
      fullAddress: [
        street,
        wardName,
        province,
      ]
        .filter(Boolean)
        .join(", "),
    };
  });

  return {
    status:
      result.status === "exact" ? "matched" : "review",
    originalAddress,
    options,
    reason: result.status === "check" ? result.reason : null,
  };
}