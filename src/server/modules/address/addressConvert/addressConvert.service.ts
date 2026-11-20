
import "server-only";

import mergeData from "@/data/addresses/ward-merge-history.json";
import legacyWardsData from "@/data/addresses/wards-legacy.json";
import legacyDistrictsData from "@/data/addresses/districts-legacy.json";
import newWardsData from "@/data/addresses/wards.json";
import boundariesData from "@/data/addresses/geojson/ward-boundaries.json"
import { Feature, MultiPolygon, Polygon } from "geojson";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import aliasData from "@/data/addresses/ward-alias-history.json";
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

    interface WardAlias {
  provinceCode: string;
  districtCode: string;
  inputWard: string;
  targetWardCode: string;
  targetWardName: string;
  reason: string;
}

const wardAliases = aliasData.data as WardAlias[];

const HCM_PROVINCE_CODE = "79";

// 1. Phường mới thuộc TP.HCM hiện hành
const newWards = (
  newWardsData.data as NewWard[]
).filter(
  (ward) => ward.province_code === HCM_PROVINCE_CODE
);

// 2. Lịch sử sáp nhập dẫn đến TP.HCM hiện hành
const mergeHistory = (
  mergeData.data as MergeHistory[]
).filter(
  (history) =>
    history.new_province_code === HCM_PROVINCE_CODE
);

// 3. Tập hợp mã phường cũ cần thiết
const legacyWardCodes = new Set(
  mergeHistory.map((history) => history.old_ward_code)
);

// 4. Tập hợp mã tỉnh + quận cũ
const legacyDistrictKeys = new Set(
  mergeHistory.map(
    (history) =>
      `${history.old_province_code}:${history.old_district_code}`
  )
);

// 5. Chỉ giữ phường cũ có lịch sử chuyển sang TP.HCM
const legacyWards = (
  legacyWardsData.data as LegacyWard[]
).filter((ward) =>
  legacyWardCodes.has(ward.code)
);

// 6. Chỉ giữ quận cũ liên quan đến TP.HCM
const legacyDistricts = (
  legacyDistrictsData.data as LegacyDistrict[]
).filter((district) =>
  legacyDistrictKeys.has(
    `${district.province_code}:${district.code}`
  )
);


const boundaryByWardCode = new Map<string, Feature<Polygon | MultiPolygon>>(
  (boundariesData as any).features.map((f: any) => [
    String(f.properties.code),
    f,
  ]),
);




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


function resolveHistoricalWardAlias(address: string): string {
  const districts = findLegacyDistricts(address);

  if (districts.length !== 1) {
    return address;
  }

  const district = districts[0];

  for (const alias of wardAliases) {
    if (
      district.code !== alias.districtCode ||
      district.province_code !== alias.provinceCode
    ) {
      continue;
    }

    // Chỉ hỗ trợ phường đánh số trong bước này.
    // Không được nhận nhầm số nhà thành số phường.
    if (!/^\d+$/.test(alias.inputWard)) {
      continue;
    }

    // Xác nhận mã phường đích thực sự thuộc quận.
    const targetWard = legacyWardsByCode.get(
      alias.targetWardCode
    );

    if (
      !targetWard ||
      targetWard.district_code !== district.code ||
      targetWard.province_code !== district.province_code ||
      normalizeKey(targetWard.name) !==
        normalizeKey(alias.targetWardName)
    ) {
      continue;
    }

    const wardNumber = Number(alias.inputWard);

    const pattern = new RegExp(
      `(\\b(?:phường|phuong|p)\\.?\\s*)0*${wardNumber}(?=$|[\\s,;])`,
      "iu"
    );

    if (!pattern.test(address)) {
      continue;
    }

    const converted = address.replace(
      pattern,
      (_match, prefix: string) =>
        `${prefix}${alias.targetWardName}`
    );

    console.log("[WARD_ALIAS]", {
      original: address,
      converted,
      reason: alias.reason,
    });

    return converted;
  }

  return address;
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
  const name = wardNameKey(ward);

  // Không nhận diện phường số chỉ qua một số
  // xuất hiện tự do trong chuỗi địa chỉ.
  if (/^\d+$/.test(name)) {
    return false;
  }

  return containsPhrase(address, name);
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
  const normalizedAddress =
    resolveHistoricalWardAlias(originalAddress);
    const districts = findLegacyDistricts(normalizedAddress);


  // Ưu tiên địa chỉ cũ nếu có quận/huyện cũ.
  if (districts.length > 0) {
    const hasExplicitDistrict = districts.some((district) => {
      const text = normalizeKey(normalizedAddress);
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
       normalizedAddress,
        districts,
      );
    }

    // Nếu chỉ đoán huyện từ tên không có tiền tố,
    // kiểm tra có phường cũ thuộc huyện ấy không.
    const legacyResult = convertLegacyAddress(
      normalizedAddress,
      districts,
    );

    if (legacyResult.status !== "not_found") {
      return legacyResult;
    }
  }

  // Không nhận diện được tổ hợp địa chỉ cũ.
  // Tiếp tục thử nhận diện địa chỉ mới.
  return resolveNewAddress(normalizedAddress);
}


type GeoResult = {
  lat: number;
  lng: number;
  type: string;
  name: string;
  osmClass: string;
  houseNumber: string | null;
  road: string | null;
};
type Box = { minLng: number; minLat: number; maxLng: number; maxLat: number };

const geocodeCache = new Map<string, GeoResult | null>();

function candidateBox(codes: string[]): Box | null {
  let minLng = Infinity, minLat = Infinity;
  let maxLng = -Infinity, maxLat = -Infinity;

  const walk = (c: any): void => {
    if (typeof c[0] === "number") {
      minLng = Math.min(minLng, c[0]);
      maxLng = Math.max(maxLng, c[0]);
      minLat = Math.min(minLat, c[1]);
      maxLat = Math.max(maxLat, c[1]);
    } else {
      c.forEach(walk);
    }
  };

  for (const code of codes) {
    const feature = boundaryByWardCode.get(code);
    if (feature) walk((feature.geometry as any).coordinates);
  }

  return Number.isFinite(minLng)
    ? { minLng, minLat, maxLng, maxLat }
    : null;
}

async function geocode(query: string, box: Box | null): Promise<GeoResult | null> {
  const cacheKey = `${query}|${JSON.stringify(box)}`;
  if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey)!;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "vn");
  url.searchParams.set("addressdetails", "1");

  if (box) {
    // viewbox = trái,trên,phải,dưới = minLng,maxLat,maxLng,minLat
    url.searchParams.set(
      "viewbox",
      `${box.minLng},${box.maxLat},${box.maxLng},${box.minLat}`,
    );
    url.searchParams.set("bounded", "1");
  }

  try {
    const res = await fetch(url, {
      headers: {
        // Đổi thành tên app + email thật của bạn
        "User-Agent": "MyAddressApp/1.0 (thanhnga@tteokbokki.vn)",
      },
    });

    if (!res.ok) {
      console.error("[GEOCODE] HTTP", res.status, url.toString());
      return null; // không cache lỗi
    }

    const json = (await res.json()) as any[];
    const first = json[0];

    const result: GeoResult | null = first
  ? {
      lat: Number(first.lat),
      lng: Number(first.lon),
      type: String(first.type ?? ""),
      name: String(first.display_name ?? ""),
      osmClass: String(first.class ?? ""),
      houseNumber: first.address?.house_number ?? null,
      road: first.address?.road ?? null,
    }
  : null;

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("[GEOCODE] lỗi mạng", error);
    return null;
  }
}

const HOUSE_LEVEL_TYPES = new Set([
  "house", "building", "apartments", "yes",
  "commercial", "retail", "office", "residential",
]);

export async function convertOldAddressPrecise(
  address: string,
): Promise<AddressConversionResult> {
  const result = convertOldAddress(address);

  if (result.status !== "check" || result.candidates.length < 2) {
    return result;
  }

  const codes = result.candidates.map((c) => c.newWardCode);
  const box = candidateBox(codes);
  const streetPart = address.split(",")[0].trim();

  console.log("[PRECISE] candidates:", codes, "box:", box);

  // Thử lần lượt từ cụ thể đến rộng
  const queries = [
    `${streetPart}, Hồ Chí Minh`,
    streetPart,
  ];

  let coords: GeoResult | null = null;

for (const q of queries) {
  const found = await geocode(q, box);

  if (!found) continue;

  // Phải có số nhà chính xác
  if (
    !found.houseNumber ||
    normalizeKey(found.houseNumber) !== "187"
  ) {
    console.log(
      "[PRECISE] Bỏ qua kết quả không đúng số nhà:",
      found,
    );
    continue;
  }

  // Phải có tên đường phù hợp
  if (
    !found.road ||
    normalizeKey(found.road) !==
      normalizeKey("Điện Biên Phủ")
  ) {
    continue;
  }

  coords = found;
  break;
}

  if (!coords) {
    return { ...result, reason: "Không geocode được địa chỉ trong khu vực" };
  }

  const pt = point([coords.lng, coords.lat]);

  const matched = result.candidates.filter((c) => {
    const feature = boundaryByWardCode.get(c.newWardCode);
    return feature ? booleanPointInPolygon(pt, feature) : false;
  });

  console.log(
    "[PRECISE] matched:",
    matched.map((m) => m.newWard),
    "type:",
    coords.type,
  );

  if (matched.length !== 1) {
    return {
      ...result,
      reason: `Điểm geocode (${coords.lat}, ${coords.lng}) không nằm trong đúng 1 phường`,
    };
  }

  // Chỉ có tên đường thì điểm chỉ là đại diện cho cả con đường, chưa đủ tin cậy
  if (!HOUSE_LEVEL_TYPES.has(coords.type)) {
    return {
      ...result,
      reason: `Geocode chỉ ở mức "${coords.type}" (không có số nhà), cần kiểm tra thêm`,
    };
  }

  return {
    status: "exact",
    source: "old_address",
    originalAddress: address,
    candidate: matched[0],
    oldAddresses: findOldAddresses(matched[0].newWardCode),
  };
}



// ===================== PHÍ SHIP =====================

export interface ShippingFeeRow {
  district: string; // "Quận 1", "Q.Tân Bình", "Tân Bình"
  ward: string;     // "Phường Đa Kao", "Đa Kao", "12", "04"
  fee: number;
}

export type AmbiguousPolicy = "max" | "min" | "manual";

export type ShippingFeeResult =
  | {
      status: "exact";
      fee: number;
      matchedBy: "old_address" | "old_ward_name" | "new_address";
      oldWards: string[];
    }
  | {
      status: "ambiguous";
      suggestedFee: number | null;
      fees: number[];
      options: { oldDistrict: string; oldWard: string; fee: number }[];
      reason: string;
    }
  | { status: "not_found"; reason: string };

const feeByOldWardCode = new Map<string, number>();
let feeWards: LegacyWard[] = [];

function resolveFeeWard(
  wardRaw: string,
  district: LegacyDistrict,
): LegacyWard | null {
  // "Phường 04" / "P.4" / "04" / "Đa Kao" → "4" / "da kao"
  const key = normalizeKey(wardRaw).replace(
    /^(?:phuong|thi tran|xa|p|x|tt)\s+/,
    "",
  );
  const bare = /^\d+$/.test(key) ? String(Number(key)) : key;

  for (const text of [
    `Phường ${bare}`,
    `Xã ${bare}`,
    `Thị trấn ${bare}`,
  ]) {
    const found = findLegacyWards(text, district);
    if (found.length === 1) return found[0];
  }
  return null;
}

export function loadShippingFees(rows: ShippingFeeRow[]) {
  feeByOldWardCode.clear();

  const wards = new Map<string, LegacyWard>();
  const problems: { row: ShippingFeeRow; reason: string }[] = [];

  for (const row of rows) {
    const districts = findLegacyDistricts(`${row.district} TPHCM`);

    if (districts.length !== 1) {
      problems.push({
        row,
        reason: districts.length
          ? "Nhiều quận trùng tên"
          : "Không tìm thấy quận",
      });
      continue;
    }

    const ward = resolveFeeWard(row.ward, districts[0]);

    if (!ward) {
      problems.push({ row, reason: "Không tìm thấy phường trong quận" });
      continue;
    }

    const existing = feeByOldWardCode.get(ward.code);
    if (existing !== undefined && existing !== row.fee) {
      problems.push({ row, reason: `Trùng phường, phí khác nhau (${existing})` });
      continue;
    }

    feeByOldWardCode.set(ward.code, row.fee);
    wards.set(ward.code, ward);
  }

  feeWards = [...wards.values()];
  return { loaded: feeByOldWardCode.size, problems };
}