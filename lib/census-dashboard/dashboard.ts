import type { FeatureCollection, Geometry } from "geojson";
import type {
  AimagCollection,
  BagCollection,
  MapLayer,
  SoumCollection,
} from "@/lib/census-dashboard/geo";

export const LAYER_OPTIONS: { value: MapLayer; label: string }[] = [
  { value: "aimag", label: "Аймаг, нийслэл" },
  { value: "soum", label: "Сум, дүүрэг" },
  { value: "bag", label: "Баг, хороо" },
];

export const YEAR_OPTIONS = [{ value: "2025", label: "2025 он" }];

export const MAP_COLORS = [
  "#D7E9A8",
  "#9FD8B1",
  "#3CBFC6",
  "#2D99B7",
  "#1E73A8",
  "#2B0A7A",
];

export function mapColorScaleCss(colors: string[] = MAP_COLORS) {
  const stops = colors.flatMap((color, i) => {
    const start = (i / colors.length) * 100;
    const end = ((i + 1) / colors.length) * 100;
    return [`${color} ${start}%`, `${color} ${end}%`];
  });
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

export type UnitRow = {
  key: string;
  name: string;
  value: number;
  aimagId?: number;
  asCode?: number;
  asb?: number;
};

export type GeoData = {
  aimags: AimagCollection;
  soums: SoumCollection;
  bags: BagCollection;
};

export type EchartsGeo = FeatureCollection<
  Geometry,
  Record<string, string | number>
>;

export function formatNumber(value: number) {
  const digits = Number.isInteger(value) ? 0 : 1;
  return value.toLocaleString("mn-MN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 1,
  });
}

export function formatPercent(value: number) {
  return `${value.toLocaleString("mn-MN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`;
}

export type ColorScale = {
  min: number;
  max: number;
  sorted: number[];
};

/** Equal-count (quantile) class so every color is used even with a large outlier. */
export function mapColorIndex(value: number, sorted: number[]): number {
  const n = sorted.length;
  const k = MAP_COLORS.length;
  if (!n) return 0;
  if (sorted[0] === sorted[n - 1]) return 0;

  let lo = 0;
  let hi = n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return Math.min(k - 1, Math.floor((lo / n) * k));
}

export function mapColor(value: number, sorted: number[]): string {
  return MAP_COLORS[mapColorIndex(value, sorted)] ?? MAP_COLORS[0];
}

export function legendMarkerPercent(value: number, sorted: number[]): number {
  return ((mapColorIndex(value, sorted) + 0.5) / MAP_COLORS.length) * 100;
}

export function colorScaleBounds(
  values: number[],
  mode: "auto" | "percent" = "auto",
): ColorScale {
  const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!sorted.length) {
    return mode === "percent"
      ? { min: 0, max: 100, sorted: [0, 100] }
      : { min: 0, max: 1, sorted: [0, 1] };
  }

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  return { min, max: max > min ? max : min, sorted };
}

export function unitKey(layer: MapLayer, id: number) {
  return `${layer}:${id}`;
}

export function parseUnitKey(key: string) {
  const [layer, rawId] = key.split(":");
  return { layer: layer as MapLayer, id: Number(rawId) };
}

export function toMapGeo<P extends object>(
  features: { type: "Feature"; geometry: Geometry; properties: P }[],
  getKey: (properties: P) => string,
): EchartsGeo {
  return {
    type: "FeatureCollection",
    features: features.map((feature) => ({
      type: "Feature",
      geometry: feature.geometry,
      properties: {
        ...(feature.properties as Record<string, string | number>),
        mapName: getKey(feature.properties),
      },
    })),
  };
}
