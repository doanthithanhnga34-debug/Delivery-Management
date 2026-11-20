import { convertOldAddress } from "./addressConvert.service";


type VerifiedGeocode = {
  wardCode: string;
  wardName: string;
  exactHouseNumber: boolean;
  exactStreet: boolean;
  validCoordinates: boolean;
};

export function decideResolvedAddress(
  address: string,
  geocode: VerifiedGeocode | null,
) {
  const matched = convertOldAddress(address);

  // Không có kết quả geocoding đủ tin cậy
  if (
    !geocode ||
    !geocode.exactHouseNumber ||
    !geocode.exactStreet ||
    !geocode.validCoordinates
  ) {
    return {
      status: "review" as const,
      declaredAddress: matched,
      verifiedWard: null,
      reason: "Chưa xác minh được vị trí số nhà",
    };
  }

  const declaredWardCode =
    matched.status === "exact"
      ? matched.candidate.newWardCode
      : null;

  return {
    status: "matched" as const,
    declaredAddress: matched,
    verifiedWard: {
      code: geocode.wardCode,
      name: geocode.wardName,
    },
    hasWardConflict:
      declaredWardCode !== null &&
      declaredWardCode !== geocode.wardCode,
    reason:
      declaredWardCode !== geocode.wardCode
        ? "Phường khai báo khác phường được xác minh"
        : "Địa chỉ phù hợp",
  };
}