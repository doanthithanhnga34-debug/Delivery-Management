import "server-only";
import { NormalizedAddress } from "./addressNomarlize.service";
import { ShippingRate } from "../shipping/shipping.repository";
import { AddressMatchResult, MatchedAddress, OldWardMapping } from "@/types/address.types";

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[.,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWard(value: string): string {
  return normalizeKey(value)
    .replace(/^(phuong|xa|thi tran)\s+/, "")
    .replace(/^0+(\d+)$/, "$1");
}

function normalizeDistrict(value: string): string {
  return normalizeKey(value)
    .replace(/^q\s*(\d+)$/, "quan $1")
    .replace(/^quan\s+0+(\d+)$/, "quan $1");
}
function containsPhrase(text: string, phrase: string): boolean {
  const source = ` ${normalizeKey(text)} `;
  const target = ` ${normalizeKey(phrase)} `;

  return source.includes(target);
}

function uniqueAddresses(addresses: MatchedAddress[]): MatchedAddress[] {
  const seen = new Set<string>();

  return addresses.filter((item) => {
    const key = [
      normalizeDistrict(item.oldDistrict),
      normalizeWard(item.newWard),
    ].join("|");

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function resolveCandidates(
  candidates: MatchedAddress[],
  reason: string,
): AddressMatchResult {
  const unique = uniqueAddresses(candidates);

  if (unique.length === 0) {
    return {
      status: "not_found",
      reason,
      candidates: [],
    };
  }

  if (unique.length > 1) {
    return {
      status: "ambiguous",
      reason: "Có nhiều phường mới phù hợp",
      candidates: unique,
    };
  }

  return {
    status: "matched",
    data: unique[0],
  };
}

export function matchAddress(
  address: NormalizedAddress,
  rates: ShippingRate[],
  mappings: OldWardMapping[] = [],
): AddressMatchResult {
  if (!address.originalText.trim()) {
    return {
      status: "not_found",
      reason: "Địa chỉ trống",
      candidates: [],
    };
  }

  const district = address.district
    ? normalizeDistrict(address.district)
    : null;

  const ward = address.ward
    ? normalizeWard(address.ward)
    : null;

  // 1. Địa chỉ có phường cũ đánh số
  if (address.addressSystem === "old") {
    if (!district || !ward) {
      return {
        status: "not_found",
        reason: "Thiếu quận hoặc phường cũ",
        candidates: [],
      };
    }

    const oldMatches = mappings.filter(
      (item) =>
        normalizeDistrict(item.oldDistrict) === district &&
        normalizeWard(item.oldWard) === ward,
    );

    const candidates: MatchedAddress[] = [];

    for (const mapping of oldMatches) {
      const matchingRates = rates.filter(
        (rate) =>
          normalizeDistrict(rate.district) === district &&
          normalizeWard(rate.ward) ===
            normalizeWard(mapping.newWard),
      );

      for (const rate of matchingRates) {
        candidates.push({
          oldDistrict: rate.district,
          newWard: rate.ward,
          source: "old_address",
        });
      }
    }

    // Chuyển đổi partial không đủ căn cứ
    // để tự xác nhận địa chỉ.
    if (
      oldMatches.some(
        (item) => item.mappingType === "partial",
      )
    ) {
      return {
        status: "ambiguous",
        reason:
          "Phường cũ có thay đổi địa giới, cần xác nhận phường mới",
        candidates: uniqueAddresses(candidates),
      };
    }

    return resolveCandidates(
      candidates,
      "Không tìm thấy bảng chuyển đổi địa chỉ cũ",
    );
  }

  // 2. Tìm trực tiếp theo tên phường mới.
  const matchedRates = rates.filter((rate) => {
    if (
      district &&
      normalizeDistrict(rate.district) !== district
    ) {
      return false;
    }

    // Có nhãn phường / xã rõ ràng
    if (ward) {
      return normalizeWard(rate.ward) === ward;
    }

    // Không có nhãn: tìm tên phường trong chuỗi.
    // Chỉ dùng tên phường, không dùng quận để suy ra.
    const wardName = normalizeWard(rate.ward);

    if (/^\d+$/.test(wardName)) return false;

    return containsPhrase(
      address.originalText,
      rate.ward,
    );
  });

  const candidates: MatchedAddress[] =
    matchedRates.map((rate) => ({
      oldDistrict: rate.district,
      newWard: rate.ward,
      source: "new_address",
    }));

  return resolveCandidates(
    candidates,
    "Không tìm thấy phường mới trong bảng phí ship",
  );
}
