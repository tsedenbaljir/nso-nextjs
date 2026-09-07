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

// ONS Census Maps sequential palette (5 classes)
// https://www.ons.gov.uk/census/maps
export const MAP_COLORS = [
  "#CDE594",
  "#80C6A3",
  "#1F9EB7",
  "#186290",
  "#080C54",
];

export const PERCENT_MAP_COLORS = MAP_COLORS;

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
export type ColorScaleScheme = "jenks" | "sex-ratio";

export type ColorClass = { min: number; max: number };

export type ColorScale = {
  min: number;
  max: number;
  sorted: number[];
  mode: ColorScaleMode;
  scheme: ColorScaleScheme;
  classes: ColorClass[];
  colors: string[];
};

/** Хүйсийн харьцаа: ONS 5 өнгө + #080C54-ээс бараан онцгой ангилал. */
export const SEX_RATIO_COLORS = [...MAP_COLORS, "#060442"];

export const SEX_RATIO_LABELS = [
  "< 90",
  "90–97",
  "97–103",
  "103–110",
  "110–200",
  "> 200",
];

export const SEX_RATIO_OUTLIER = 200;

export function sexRatioClasses(sorted: number[]): ColorClass[] {
  const max = sorted.length ? sorted[sorted.length - 1] : SEX_RATIO_OUTLIER;
  return [
    { min: 0, max: 90 },
    { min: 90, max: 97 },
    { min: 97, max: 103 },
    { min: 103, max: 110 },
    { min: 110, max: SEX_RATIO_OUTLIER },
    { min: SEX_RATIO_OUTLIER, max: Math.max(max, SEX_RATIO_OUTLIER) },
  ];
}

export function paletteFor(scale: Pick<ColorScale, "colors" | "scheme"> | { colors?: string[] }) {
  return scale.colors?.length ? scale.colors : MAP_COLORS;
}

export function legendLabels(scale: Pick<ColorScale, "classes" | "mode" | "scheme">) {
  if (scale.scheme === "sex-ratio") return SEX_RATIO_LABELS;
  return scale.mode === "percent"
    ? percentClassLabels(scale.classes)
    : countClassLabels(scale.classes);
}

const EMPTY_CLASSES: ColorClass[] = MAP_COLORS.map(() => ({ min: 0, max: 0 }));

function uniqueCountSorted(sorted: number[]) {
  if (!sorted.length) return 0;
  let count = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]) count += 1;
  }
  return count;
}

function rangeVariance(
  prefixSum: number[],
  prefixSq: number[],
  lo: number,
  hi: number,
) {
  const count = hi - lo + 1;
  const sum = prefixSum[hi + 1] - prefixSum[lo];
  const sumSq = prefixSq[hi + 1] - prefixSq[lo];
  return sumSq - (sum * sum) / count;
}

/**
 * Fisher–Jenks / 1D ckmeans. Same objective as ArcGIS Natural Breaks:
 * similar values share a colour; outliers get their own class.
 */
function jenksClassStarts(sorted: number[], k: number): number[] {
  const n = sorted.length;
  const prefixSum = new Array(n + 1).fill(0);
  const prefixSq = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    prefixSum[i + 1] = prefixSum[i] + sorted[i];
    prefixSq[i + 1] = prefixSq[i] + sorted[i] * sorted[i];
  }

  const cost: number[][] = Array.from({ length: k }, () =>
    Array<number>(n).fill(Infinity),
  );
  const startAt: number[][] = Array.from({ length: k }, () =>
    Array<number>(n).fill(0),
  );

  for (let i = 0; i < n; i++) {
    cost[0][i] = rangeVariance(prefixSum, prefixSq, 0, i);
  }

  for (let c = 1; c < k; c++) {
    for (let i = c; i < n; i++) {
      for (let t = c; t <= i; t++) {
        const split =
          cost[c - 1][t - 1] + rangeVariance(prefixSum, prefixSq, t, i);
        if (split < cost[c][i]) {
          cost[c][i] = split;
          startAt[c][i] = t;
        }
      }
    }
  }

  const starts = Array<number>(k);
  let end = n - 1;
  for (let c = k - 1; c >= 1; c--) {
    starts[c] = startAt[c][end];
    end = starts[c] - 1;
  }
  starts[0] = 0;
  return starts;
}

/** log1p when the range is huge (national bag/soum counts); linear Jenks otherwise. */
function jenksWorkingValues(sorted: number[]): number[] {
  if (sorted[0] < 0) return sorted;
  const minPositive = sorted.find((value) => value > 0);
  const max = sorted[sorted.length - 1];
  if (
    minPositive != null &&
    sorted.length >= 30 &&
    max / minPositive >= 20
  ) {
    return sorted.map((value) => Math.log1p(value));
  }
  return sorted;
}

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

export function jenksClasses(
  sorted: number[],
  k = MAP_COLORS.length,
): ColorClass[] {
  const n = sorted.length;
  if (!n) return EMPTY_CLASSES;
  const classCount = Math.min(k, uniqueCountSorted(sorted));
  if (classCount <= 1) {
    return [{ min: sorted[0], max: sorted[n - 1] }];
  }

  const starts = jenksClassStarts(jenksWorkingValues(sorted), classCount);
  return starts.map((start, i) => {
    const end = i === starts.length - 1 ? n - 1 : starts[i + 1] - 1;
    return { min: sorted[start], max: sorted[end] };
  });
}

export function formatClassRange(min: number, max: number) {
  if (min === max) return formatNumber(min);
  return `${formatNumber(min)}–${formatNumber(max)}`;
}

export function countClassLabels(classes: ColorClass[]): string[] {
  return classes.map((item) => formatClassRange(item.min, item.max));
}

function formatPercentBound(value: number) {
  return value.toLocaleString("mn-MN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatPercentClassRange(min: number, max: number) {
  if (min === max) return formatPercentBound(min);
  return `${formatPercentBound(min)}–${formatPercentBound(max)}`;
}

export function percentClassLabels(classes: ColorClass[]): string[] {
  return classes.map((item) => formatPercentClassRange(item.min, item.max));
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
  scale: Pick<ColorScale, "classes" | "mode" | "colors">,
): string {
  const palette = paletteFor(scale);
  const index = mapColorIndex(value, scale.classes);
  return palette[index] ?? palette[0];
}

export function legendMarkerPercent(
  value: number,
  scale: Pick<ColorScale, "classes" | "mode">,
): number {
  const { classes } = scale;
  const bins = Math.max(1, classes.length);
  const index = mapColorIndex(value, classes);
  const cls = classes[index];
  if (!cls) return ((index + 0.5) / bins) * 100;
  const span = cls.max - cls.min;
  const t = span > 0 ? Math.min(1, Math.max(0, (value - cls.min) / span)) : 0.5;
  return ((index + t) / bins) * 100;
}

export function colorScaleBounds(
  values: number[],
  mode: ColorScaleMode = "auto",
  scheme: ColorScaleScheme = "jenks",
): ColorScale {
  const sorted = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!sorted.length) {
    return mode === "percent"
      ? { min: 0, max: 100, sorted: [0, 100], mode, scheme: "jenks", classes: EMPTY_CLASSES, colors: MAP_COLORS }
      : { min: 0, max: 1, sorted: [0, 1], mode, scheme: "jenks", classes: EMPTY_CLASSES, colors: MAP_COLORS };
  }

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (scheme === "sex-ratio") {
    return {
      min,
      max: max > min ? max : min,
      sorted,
      mode,
      scheme,
      classes: sexRatioClasses(sorted),
      colors: SEX_RATIO_COLORS,
    };
  }
  return {
    min,
    max: max > min ? max : min,
    sorted,
    mode,
    scheme: "jenks",
    classes: jenksClasses(sorted),
    colors: MAP_COLORS,
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
