
import "server-only";

import mergeData from "@/data/addresses/ward-merge-history.json";
import legacyWardsData from "@/data/addresses/wards-legacy.json";
import legacyDistrictsData from "@/data/addresses/districts-legacy.json";
import newWardsData from "@/data/addresses/wards.json";

interface LegacyWard {
  code: string;
  name: string;
  type: string;
  district_code: string;
  province_code: string;
}

interface LegacyDistrict {
  code: string;
  name: string;
  type: string;
  province_code: string;
}

interface MergeHistory {
  old_ward_code: string;
  old_ward_name: string;
  old_district_code: string;
  old_district_name: string;
  old_province_code: string;
  new_ward_code: string;
  new_ward_name: string;
  new_province_code: string;
  scope: string;
  is_unchanged: number;
  legal_ref: string | null;
}

interface NewWard {
  code: string;
  name: string;
  type: string;
  province_code: string;
  province_name: string;
}

export interface AddressCandidate {
  oldDistrict: string;
  oldWard: string;
  newWard: string;
  newProvince: string;
  scope: "full" | "partial";
  newWardCode: string;
}

export interface OldAddressCandidate {
  oldWard: string;
  oldDistrict: string;
  oldWardCode: string;
  oldDistrictCode: string;
  scope: "full" | "partial";
}

export type AddressConversionResult =
  | {
      status: "exact";
      source: "old_address" | "new_address";
      originalAddress: string;
      candidate: AddressCandidate;
      oldAddresses: OldAddressCandidate[];
    }
  | {
      status: "check";
      source: "old_address" | "new_address" | "unknown";
      originalAddress: string;
      reason: string;
      suggestedCandidate: null;
      candidates: AddressCandidate[];
    }
  | {
      status: "not_found";
      source: "unknown";
      originalAddress: string;
      reason: string;
      candidates: [];
    };

const legacyWards = legacyWardsData.data as LegacyWard[];
const legacyDistricts =
  legacyDistrictsData.data as LegacyDistrict[];
const mergeHistory = mergeData.data as MergeHistory[];
const newWards = newWardsData.data as NewWard[];



function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[.,;:()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(text: string, phrase: string): boolean {
  const key = normalizeKey(phrase);
  if (!key) return false;

  return new RegExp(
    `(?:^|\\s)${escapeRegex(key)}(?=$|\\s)`,
  ).test(normalizeKey(text));
}

function fullName(item: {
  type: string;
  name: string;
}): string {
  return `${item.type} ${item.name}`;
}

function districtNameKey(district: LegacyDistrict): string {
  return normalizeKey(fullName(district));
}

function wardNameKey(ward: LegacyWard | NewWard): string {
  return normalizeKey(ward.name);
}

function getScope(value: string): "full" | "partial" {
  return value === "full" ? "full" : "partial";
}



const legacyWardsByCode = new Map(
  legacyWards.map((ward) => [ward.code, ward]),
);

const districtsByCode = new Map(
  legacyDistricts.map((district) => [
    district.code,
    district,
  ]),
);

const newWardsByCode = new Map(
  newWards.map((ward) => [ward.code, ward]),
);

const historyByOldWard = new Map<string, MergeHistory[]>();
const historyByNewWard = new Map<string, MergeHistory[]>();

for (const record of mergeHistory) {
  const oldRecords =
    historyByOldWard.get(record.old_ward_code) ?? [];

  oldRecords.push(record);

  historyByOldWard.set(record.old_ward_code, oldRecords);

  const newRecords =
    historyByNewWard.get(record.new_ward_code) ?? [];

  newRecords.push(record);

  historyByNewWard.set(record.new_ward_code, newRecords);
}

const wardsByDistrict = new Map<string, LegacyWard[]>();

for (const ward of legacyWards) {
  const key = `${ward.province_code}:${ward.district_code}`;
  const items = wardsByDistrict.get(key) ?? [];

  items.push(ward);
  wardsByDistrict.set(key, items);
}


function detectProvinceHint(address: string): string | null {
  const text = normalizeKey(address);

  if (
    /\b(?:tphcm|tp hcm|hcm|tp ho chi minh|thanh pho ho chi minh|ho chi minh)\b/.test(
      text,
    )
  ) {
    return "79";
  }

  return null;
}


interface DistrictMatch {
  district: LegacyDistrict;
  score: number;
}


function findLegacyDistricts(
  address: string,
): LegacyDistrict[] {
  const text = normalizeKey(address);
  const provinceHint = detectProvinceHint(address);

  const matches: {
    district: LegacyDistrict;
    score: number;
  }[] = [];

  for (const district of legacyDistricts) {
    if (
      provinceHint &&
      district.province_code !== provinceHint
    ) {
      continue;
    }

    const name = normalizeKey(district.name);
    const type = normalizeKey(district.type);
    const full = normalizeKey(`${district.type} ${district.name}`);

    let score = 0;

    // Quận Bình Tân, Huyện Bình Chánh...
    if (containsPhrase(text, full)) {
      score = 1000;
    }

    // Q1, Q.1, Q10
    if (type === "quan" && /^\d+$/.test(name)) {
      const number = Number(name);

      const shortPattern = new RegExp(
        `(?:^|\\s)q\\s*0*${number}(?=$|\\s)`,
      );

      if (shortPattern.test(text)) {
        score = Math.max(score, 1000);
      }
    }

    // Quận/huyện không có tiền tố:
    // "... Phường Bình Hưng Hòa B, Bình Tân"
    if (score === 0 && containsPhrase(text, name)) {
      const escapedName = escapeRegex(name);

      // Tên quận nằm ở cuối hoặc ngay trước TP.HCM
      const trailingPattern = new RegExp(
        `(?:^|[\\s,])${escapedName}` +
        `(?:\\s+(?:tp\\s*hcm|tphcm|tp\\s*ho\\s*chi\\s*minh|thanh\\s*pho\\s*ho\\s*chi\\s*minh))?$`,
      );

      score = trailingPattern.test(text) ? 500 : 50;
    }

    if (score > 0) {
      matches.push({ district, score });
    }
  }

  if (matches.length === 0) return [];

  const highestScore = Math.max(
    ...matches.map((item) => item.score),
  );

  return matches
    .filter((item) => item.score === highestScore)
    .map((item) => item.district);
}


function hasExplicitWardName(
  address: string,
  ward: LegacyWard,
): boolean {
  const text = normalizeKey(address);
  const name = wardNameKey(ward);

  const prefix =
    normalizeKey(ward.type) === "xa"
      ? "(?:xa|x)"
      : normalizeKey(ward.type) === "thi tran"
        ? "(?:thi tran|tt)"
        : "(?:phuong|p)";

  const pattern = new RegExp(
    `(?:^|\\s)${prefix}\\s*${escapeRegex(name)}(?=$|\\s)`,
  );

  return pattern.test(text);
}

function hasWardNameWithoutPrefix(
  address: string,
  ward: LegacyWard,
): boolean {
  const text = normalizeKey(address);
  const name = wardNameKey(ward);

  return containsPhrase(text, name);
}


function findLegacyWards(
  address: string,
  district: LegacyDistrict,
): LegacyWard[] {
  const districtKey =
    `${district.province_code}:${district.code}`;

  const districtWards =
    wardsByDistrict.get(districtKey) ?? [];

  // Ưu tiên phường/xã có tiền tố:
  // Phường, P, P., Xã, X...
  const explicit = districtWards.filter((ward) =>
    hasExplicitWardName(address, ward),
  );

  if (explicit.length > 0) {
    const longest = Math.max(
      ...explicit.map(
        (ward) => normalizeKey(ward.name).length,
      ),
    );

    return deduplicateLegacyWards(
      explicit.filter(
        (ward) =>
          normalizeKey(ward.name).length === longest,
      ),
    );
  }

  const implicit = districtWards.filter((ward) =>
    hasWardNameWithoutPrefix(address, ward),
  );

  if (implicit.length === 0) return [];

  const longest = Math.max(
    ...implicit.map(
      (ward) => normalizeKey(ward.name).length,
    ),
  );

  return deduplicateLegacyWards(
    implicit.filter(
      (ward) =>
        normalizeKey(ward.name).length === longest,
    ),
  );
}


function deduplicateLegacyWards(
  wards: LegacyWard[],
): LegacyWard[] {
  return [
    ...new Map(
      wards.map((ward) => [ward.code, ward]),
    ).values(),
  ];
}

function createCandidate(
  history: MergeHistory,
): AddressCandidate | null {
  const oldWard =
    legacyWardsByCode.get(history.old_ward_code);

  const oldDistrict =
    districtsByCode.get(history.old_district_code);

  const newWard =
    newWardsByCode.get(history.new_ward_code);

  if (!oldWard || !oldDistrict || !newWard) {
    return null;
  }

  if (
    oldWard.district_code !== oldDistrict.code ||
    oldWard.province_code !== oldDistrict.province_code ||
    oldWard.province_code !== history.old_province_code ||
    newWard.province_code !== history.new_province_code
  ) {
    return null;
  }

  return {
    oldDistrict: fullName(oldDistrict),
    oldWard: fullName(oldWard),
    newWard: newWard.name,
    newProvince: newWard.province_name,
    scope: getScope(history.scope),
    newWardCode: newWard.code,
  };
}

function uniqueCandidates(
  candidates: AddressCandidate[],
): AddressCandidate[] {
  const unique = new Map<string, AddressCandidate>();

  for (const candidate of candidates) {
    const key = [
      normalizeKey(candidate.oldDistrict),
      normalizeKey(candidate.oldWard),
      candidate.newProvince,
      candidate.newWardCode,
    ].join(":");

    const previous = unique.get(key);

    if (
      !previous ||
      (previous.scope === "full" &&
        candidate.scope === "partial")
    ) {
      unique.set(key, candidate);
    }
  }

  return [...unique.values()];
}

export function findOldAddresses(
  newWardCode: string,
): OldAddressCandidate[] {
  const histories =
    historyByNewWard.get(newWardCode) ?? [];

  const results: OldAddressCandidate[] = [];

  for (const history of histories) {
    const candidate = createCandidate(history);
    if (!candidate) continue;

    const oldWard =
      legacyWardsByCode.get(history.old_ward_code)!;

    const district =
      districtsByCode.get(history.old_district_code)!;

    results.push({
      oldWard: candidate.oldWard,
      oldDistrict: candidate.oldDistrict,
      oldWardCode: oldWard.code,
      oldDistrictCode: district.code,
      scope: candidate.scope,
    });
  }

  const unique = new Map<string, OldAddressCandidate>();

  for (const item of results) {
    const key = `${item.oldDistrictCode}:${item.oldWardCode}`;
    const previous = unique.get(key);

    if (
      !previous ||
      (previous.scope === "full" &&
        item.scope === "partial")
    ) {
      unique.set(key, item);
    }
  }

  return [...unique.values()];
}

function convertLegacyAddress(
  address: string,
  districts: LegacyDistrict[],
): AddressConversionResult {
  const candidates: AddressCandidate[] = [];

  let foundOldWard = false;

  for (const district of districts) {
    const wards = findLegacyWards(address, district);

    if (wards.length === 0) continue;

    foundOldWard = true;

    for (const ward of wards) {
      const histories =
        historyByOldWard.get(ward.code) ?? [];

      for (const history of histories) {
        if (
          history.old_district_code !== district.code ||
          history.old_province_code !== district.province_code
        ) {
          continue;
        }

        const candidate = createCandidate(history);

        if (candidate) {
          candidates.push(candidate);
        }
      }
    }
  }

  const results = uniqueCandidates(candidates);

  if (results.length === 0) {
    return {
      status: "not_found",
      source: "unknown",
      originalAddress: address,
      reason: foundOldWard
        ? "Không tìm thấy lịch sử sáp nhập phù hợp"
        : "Không tìm thấy phường/xã cũ trong quận/huyện",
      candidates: [],
    };
  }

  if (
    results.length === 1 &&
    results[0].scope === "full"
  ) {
    return {
      status: "exact",
      source: "old_address",
      originalAddress: address,
      candidate: results[0],
      oldAddresses: findOldAddresses(results[0].newWardCode),
    };
  }

  return {
    status: "check",
    source: "old_address",
    originalAddress: address,
    reason:
      "Địa chỉ cũ có nhiều kết quả hoặc địa giới bị chia tách",
    suggestedCandidate: null,
    candidates: results,
  };
}

function findNewWardCandidates(
  address: string,
): AddressCandidate[] {
  const text = normalizeKey(address);
  const provinceHint = detectProvinceHint(address);

  const matches = newWards.filter((ward) => {
    if (
      provinceHint &&
      ward.province_code !== provinceHint
    ) {
      return false;
    }

    const type = normalizeKey(ward.type);
    const name = normalizeKey(ward.name);

    const prefix =
      type === "xa"
        ? "(?:xa|x)"
        : type === "thi tran"
          ? "(?:thi tran|tt)"
          : "(?:phuong|p)";

    const pattern = new RegExp(
      `(?:^|\\s)${prefix}\\s*${escapeRegex(name)}(?=$|\\s)`,
    );

    return pattern.test(text);
  });

  return matches.map((ward) => ({
    oldDistrict: "",
    oldWard: "",
    newWard: ward.name,
    newProvince: ward.province_name,
    newWardCode: ward.code,
    scope: "full",
  }));
}

function resolveNewAddress(
  address: string,
): AddressConversionResult {
  const candidates =
    uniqueCandidates(findNewWardCandidates(address));

  if (candidates.length === 0) {
    return {
      status: "not_found",
      source: "unknown",
      originalAddress: address,
      reason: "Không tìm thấy phường/xã mới",
      candidates: [],
    };
  }

  if (candidates.length === 1) {
    return {
      status: "exact",
      source: "new_address",
      originalAddress: address,
      candidate: candidates[0],
      oldAddresses: findOldAddresses(candidates[0].newWardCode),
    };
  }

  return {
    status: "check",
    source: "new_address",
    originalAddress: address,
    reason: "Có nhiều phường/xã mới trùng tên",
    suggestedCandidate: null,
    candidates,
  };
}

export function convertOldAddress(
  address: string,
): AddressConversionResult {
  const originalAddress = address.trim();

  if (!originalAddress) {
    return {
      status: "not_found",
      source: "unknown",
      originalAddress,
      reason: "Địa chỉ trống",
      candidates: [],
    };
  }

  const districts = findLegacyDistricts(originalAddress);

  // Ưu tiên địa chỉ cũ nếu có quận/huyện cũ.
  if (districts.length > 0) {
    const hasExplicitDistrict = districts.some((district) => {
      const text = normalizeKey(originalAddress);
      const full = districtNameKey(district);
      const name = normalizeKey(district.name);

      if (containsPhrase(text, full)) return true;

      return (
        normalizeKey(district.type) === "quan" &&
        /^\d+$/.test(name) &&
        new RegExp(
          `(?:^|\\s)q\\s*0*${Number(name)}(?=$|\\s)`,
        ).test(text)
      );
    });

    // Nếu nhận diện quận/huyện rõ ràng,
    // không được nhận nhầm phường mới trùng tên.
    if (hasExplicitDistrict) {
      return convertLegacyAddress(
        originalAddress,
        districts,
      );
    }

    // Nếu chỉ đoán huyện từ tên không có tiền tố,
    // kiểm tra có phường cũ thuộc huyện ấy không.
    const legacyResult = convertLegacyAddress(
      originalAddress,
      districts,
    );

    if (legacyResult.status !== "not_found") {
      return legacyResult;
    }
  }

  // Không nhận diện được tổ hợp địa chỉ cũ.
  // Tiếp tục thử nhận diện địa chỉ mới.
  return resolveNewAddress(originalAddress);
}
