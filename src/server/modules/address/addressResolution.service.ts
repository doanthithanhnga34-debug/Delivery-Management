
import "server-only";
import { normalizeAddress } from "./addressNomarlize.service";
import { getShippingRates } from "../shipping/shipping.repository";
import { getOldWardMapping } from "./addressMapping.repository";
import { matchAddress } from "./addressMatcher.service";


function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/^(phuong|xa)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function resolveShippingAddress(address: string) {
  const normalized = normalizeAddress(address);

  const rates = await getShippingRates();

  const mappings = await getOldWardMapping();

  const matched = matchAddress(
    normalized,
    rates,
    mappings,
  );

  if (matched.status !== "matched") {
    return {
      status: "needs_review" as const,
      shippingFee: null,
      normalized,
      matched,
    };
  }

  const candidates = rates.filter(
    (rate) =>
      normalizeKey(rate.district) ===
        normalizeKey(matched.data.oldDistrict) &&
      normalizeKey(rate.ward) ===
        normalizeKey(matched.data.newWard),
  );

  const uniqueFees = [
    ...new Set(candidates.map((item) => item.fee)),
  ];

  if (uniqueFees.length !== 1) {
    return {
      status: "needs_review" as const,
      shippingFee: null,
      normalized,
      matched,
      reason: "Không xác định được một mức phí duy nhất",
    };
  }

  return {
    status: "matched" as const,
    shippingFee: uniqueFees[0],
    normalized,
    matched,
  };
}
