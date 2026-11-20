import "server-only";

import overrideData from "@/data/addresses/address-overrides.json";
import wardsData from "@/data/addresses/wards.json";

interface AddressOverride {
  id: string;
  street: string;
  declaredWard: string;
  targetWardCode: string;
  targetWardName: string;
  houseNumber?: string;
  enabled: boolean;
  reason: string;
}

const overrides = overrideData.data as AddressOverride[];

const wards = wardsData.data as {
  code: string;
  name: string;
  province_code: string;
}[];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[.,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findAddressOverride(address: string) {
  const text = normalize(address);

  for (const rule of overrides) {
    if (!rule.enabled) continue;

    const street = normalize(rule.street);
    const ward = normalize(rule.declaredWard);

    // Phường phải xuất hiện rõ ràng.
    const wardPattern = new RegExp(
      `(?:^|\\s)(?:phuong|p)\\s+${ward}(?=$|\\s)`
    );

    if (!wardPattern.test(text)) continue;

    // Kiểm tra đúng tên đường.
    if (!text.includes(street)) continue;

    // Kiểm tra số nhà nếu cấu hình yêu cầu.
    if (rule.houseNumber) {
      const housePattern = new RegExp(
        `(?:^|\\s)${normalize(rule.houseNumber)}\\s+${street}(?=$|\\s)`
      );

      if (!housePattern.test(text)) continue;
    }

    // Xác minh phường đích có trong dữ liệu hành chính.
    const target = wards.find(
      (item) =>
        item.code === rule.targetWardCode &&
        normalize(item.name) === normalize(rule.targetWardName) &&
        item.province_code === "79"
    );

    if (!target) continue;

    return {
      status: "overridden" as const,
      wardCode: target.code,
      wardName: target.name,
      ruleId: rule.id,
      reason: rule.reason,
    };
  }

  return null;
}