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

export function colorScaleBounds(values: number[]) {
  const nums = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!nums.length) return { min: 0, max: 1 };

  const at = (p: number) =>
    nums[Math.min(nums.length - 1, Math.max(0, Math.round(p * (nums.length - 1))))];

  const min = at(0.1);
  const max = at(0.72);
  if (max <= min) {
    const lo = nums[0];
    const hi = nums[nums.length - 1];
    return { min: lo, max: hi > lo ? hi : lo + 1 };
  }
  return { min, max };
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
