import type { Feature, FeatureCollection, Geometry } from "geojson";

export type MapLayer = "aimag" | "soum" | "bag";

export type AimagProperties = {
  id: number;
  name: string;
};

export type SoumProperties = {
  aimagId: number;
  aimagName: string;
  asCode: number;
  soumId: number;
  name: string;
  nameEn: string;
};

export type BagProperties = {
  aimagId: number;
  aimagName: string;
  asCode: number;
  asb: number;
  code: string;
  soumName: string;
  name: string;
};

export type AimagFeature = Feature<Geometry, AimagProperties>;
export type SoumFeature = Feature<Geometry, SoumProperties>;
export type BagFeature = Feature<Geometry, BagProperties>;

export type AimagCollection = FeatureCollection<Geometry, AimagProperties>;
export type SoumCollection = FeatureCollection<Geometry, SoumProperties>;
export type BagCollection = FeatureCollection<Geometry, BagProperties>;

export function collection<P>(
  features: Feature<Geometry, P>[],
): FeatureCollection<Geometry, P> {
  return { type: "FeatureCollection", features };
}

export function borderLines(features: { geometry: Geometry | null }[]) {
  const lines: number[][][] = [];
  for (const feature of features) {
    collectRings(feature.geometry, lines);
  }
  return lines;
}

function collectRings(geometry: Geometry | null, lines: number[][][]) {
  if (!geometry) return;
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates) pushRing(ring, lines);
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) pushRing(ring, lines);
    }
  } else if (geometry.type === "GeometryCollection") {
    for (const child of geometry.geometries) collectRings(child, lines);
  }
}

function pushRing(ring: number[][], lines: number[][][]) {
  if (ring.length < 2) return;
  lines.push(ring.map((point) => [point[0], point[1]]));
}
