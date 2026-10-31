import "server-only";
import { getShippingRates, ShippingRate } from "./shipping.repository";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\b(phường|xã|thị trấn)\s+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface ShippingQuote {
  district: string;
  ward: string;
  shippingFee: number | null;
  status: "matched" | "not_found" | "ambiguous";
}

export async function getShippingQuote(
  district: string,
  ward: string,
): Promise<ShippingQuote> {
  const rates: ShippingRate[] = await getShippingRates();
  const normalizeDistrict = normalize(district);
  const normalizeWard = normalize(ward);
  const matches = rates.filter(
    (rate) =>
      normalize(rate.district) === normalizeDistrict &&
      normalize(rate.ward) === normalizeWard,
  );

  if (matches.length === 0) {
    return {
      district,
      ward,
      shippingFee: null,
      status: "not_found",
    };
  }
  const uniqueFees = [...new Set(matches.map((rate) => rate.fee))];
  if (uniqueFees.length > 1) {
    return {
      district,
      ward,
      shippingFee: null,
      status: "ambiguous",
    };
  }
  return {
    district: matches[0].district,
    ward: matches[0].ward,
    shippingFee: uniqueFees[0],
    status: "matched",
  };
}
export function calculateShippingFee(
  district: string,
  ward: string,
  rates: ShippingRate[],
): number | null {
  const normalizeDistrict = normalize(district);
  const normalizeWard = normalize(ward);
  const matches = rates.filter(
    (rate) =>
      normalize(rate.district) === normalizeDistrict &&
      normalize(rate.ward) === normalizeWard,
  );
  if (matches.length === 0) return null;

  const uniqueFees = [...new Set(matches.map((r) => r.fee))];
  return uniqueFees.length === 1 ? uniqueFees[0] : null;
}
