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
  "#6CCBBB",
  "#3CBFC6",
  "#2D99B7",
  "#1E73A8",
  "#115191",
  "#2B0A7A",
];

export const PERCENT_MAP_COLORS = MAP_COLORS;

export const PERCENT_CLASS_LABELS = [
  "0.0",
  "0.1–0.5",
  "0.6–5.0",
  "5.1–20.0",
  "20.1–40.0",
  "40.1–60.0",
  "60.1–80.0",
  "80.1–100.0",
];

export function mapColorsFor(mode: "auto" | "percent" = "auto") {
  return mode === "percent" ? PERCENT_MAP_COLORS : MAP_COLORS;
}

export function mapColorScaleCss(mode: "auto" | "percent" = "auto") {
  const colors = mapColorsFor(mode);
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

export type ColorScaleMode = "auto" | "percent";

export type ColorClass = { min: number; max: number };

export type ColorScale = {
  min: number;
  max: number;
  sorted: number[];
  mode: ColorScaleMode;
  classes: ColorClass[];
};

const EMPTY_CLASSES: ColorClass[] = MAP_COLORS.map(() => ({ min: 0, max: 0 }));

/** 8 equal-count (quantile) bins so every color is used even with a large outlier. */
export function quantileClasses(
  sorted: number[],
  k = MAP_COLORS.length,
): ColorClass[] {
  const n = sorted.length;
  if (!n) return EMPTY_CLASSES;
  return Array.from({ length: k }, (_, i) => {
    const start = Math.floor((i * n) / k);
    const end = Math.max(start, Math.floor(((i + 1) * n) / k) - 1);
    return { min: sorted[start], max: sorted[end] };
  });
}

export function formatClassRange(min: number, max: number) {
  if (min === max) return formatNumber(min);
  return `${formatNumber(min)}–${formatNumber(max)}`;
}

export function countClassLabels(sorted: number[]): string[] {
  return quantileClasses(sorted).map((item) => formatClassRange(item.min, item.max));
}

/** 0.0 | 0.1–0.5 | 0.6–5.0 | 5.1–20 | 20.1–40 | 40.1–60 | 60.1–80 | 80.1–100 */
export function percentColorIndex(value: number): number {
  const v = Number.isFinite(value) ? value : 0;
  if (v < 0.1) return 0;
  if (v < 0.6) return 1;
  if (v < 5.1) return 2;
  if (v < 20.1) return 3;
  if (v < 40.1) return 4;
  if (v < 60.1) return 5;
  if (v < 80.1) return 6;
  return 7;
}

export function mapColorIndex(value: number, classes: ColorClass[]): number {
  if (!classes.length) return 0;
  if (classes[0].min === classes[classes.length - 1].max) return 0;
  let index = 0;
  for (let i = 1; i < classes.length; i++) {
    if (value >= classes[i].min) index = i;
  }
  return index;
}

export function mapColor(
  value: number,
  scale: Pick<ColorScale, "classes" | "mode">,
): string {
  const index =
    scale.mode === "percent"
      ? percentColorIndex(value)
      : mapColorIndex(value, scale.classes);
  return MAP_COLORS[index] ?? MAP_COLORS[0];
}

export function legendMarkerPercent(
  value: number,
  scale: Pick<ColorScale, "classes" | "mode">,
): number {
  const index =
    scale.mode === "percent"
      ? percentColorIndex(value)
      : mapColorIndex(value, scale.classes);
  return ((index + 0.5) / MAP_COLORS.length) * 100;
}

export function colorScaleBounds(
  values: number[],
  mode: ColorScaleMode = "auto",
): ColorScale {
  const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!sorted.length) {
    return mode === "percent"
      ? { min: 0, max: 100, sorted: [0, 100], mode, classes: EMPTY_CLASSES }
      : { min: 0, max: 1, sorted: [0, 1], mode, classes: EMPTY_CLASSES };
  }

  if (mode === "percent") {
    return { min: 0, max: 100, sorted, mode, classes: EMPTY_CLASSES };
  }

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  return {
    min,
    max: max > min ? max : min,
    sorted,
    mode,
    classes: quantileClasses(sorted),
  };
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
