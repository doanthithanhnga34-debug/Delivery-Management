import { readFile } from "node:fs/promises";
import path from "node:path";

import booleanPointInPolygon from
  "@turf/boolean-point-in-polygon";

import { point } from "@turf/helpers";

type GeoFeature = {
  type: "Feature";
  id?: string | number;
  properties: {
    code?: string | number;
    name?: string;
    fullName?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: unknown;
  };
};

type GeoCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

export type BoundaryMatch = {
  status: "matched" | "review" | "not_found";
  wardCode: string | null;
  wardName: string | null;
  candidates: string[];
};

let cachedGeoJSON: GeoCollection | null = null;

async function loadGeoJSON(): Promise<GeoCollection> {
  if (cachedGeoJSON) return cachedGeoJSON;

  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "addresses",
    "geojson",
    "wards-79.geojson",
  );

  const content = await readFile(filePath, "utf8");

  const parsed: unknown = JSON.parse(content);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("type" in parsed) ||
    parsed.type !== "FeatureCollection" ||
    !("features" in parsed) ||
    !Array.isArray(parsed.features)
  ) {
    throw new Error("GeoJSON không đúng FeatureCollection.");
  }

  cachedGeoJSON = parsed as GeoCollection;

  return cachedGeoJSON;
}

export async function findWardByCoordinates(
  latitude: number,
  longitude: number,
): Promise<BoundaryMatch> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    throw new Error("Tọa độ không hợp lệ.");
  }

  const geoJSON = await loadGeoJSON();

  // Turf sử dụng thứ tự [longitude, latitude].
  const location = point([longitude, latitude]);

  const matches: Array<{
    code: string;
    name: string;
  }> = [];

  for (const feature of geoJSON.features) {
    if (
      feature.geometry?.type !== "Polygon" &&
      feature.geometry?.type !== "MultiPolygon"
    ) {
      continue;
    }

    const matched = booleanPointInPolygon(
      location,
      feature as Parameters<
        typeof booleanPointInPolygon
      >[1],
      { ignoreBoundary: true },
    );

    if (!matched) continue;

    const code = feature.properties.code ?? feature.id;
    const name =
      feature.properties.fullName ??
      feature.properties.name;

    if (code == null || !name) continue;

    matches.push({
      code: String(code),
      name,
    });
  }

  const unique = [
    ...new Map(
      matches.map((item) => [item.code, item]),
    ).values(),
  ];

  if (unique.length === 1) {
    return {
      status: "matched",
      wardCode: unique[0].code,
      wardName: unique[0].name,
      candidates: [],
    };
  }

  if (unique.length > 1) {
    return {
      status: "review",
      wardCode: null,
      wardName: null,
      candidates: unique.map((item) => item.name),
    };
  }

  return {
    status: "not_found",
    wardCode: null,
    wardName: null,
    candidates: [],
  };
}