import type { MapLayer } from "@/lib/census-dashboard/geo";

export const TOTAL_CATEGORY = "_all";
export const CHILD_CATEGORY = "child";
export const ELDERLY_CATEGORY = "elderly";

export type IndicatorCategory = {
  id: string;
  label: string;
};

export type CodeValues = Record<string, number>;

export type AgeCounts = [number, number, number];
export type CategoryAgeCounts = Record<string, AgeCounts>;
export type AgeCell = AgeCounts | CategoryAgeCounts;

export type Indicator = {
  id: string;
  label: string;
  unit?: "count" | "ratio" | "dependency" | "rate" | "share";
  categories: IndicatorCategory[];
  sexes?: IndicatorCategory[];
  ages?: IndicatorCategory[];
  layers?: MapLayer[];
  defaultLayer?: MapLayer;
  values: Record<string, Record<MapLayer, CodeValues>>;
  weights?: Record<MapLayer, CodeValues> | Record<string, Record<MapLayer, CodeValues>>;
  ageTable?: Record<MapLayer, Record<string, Record<string, AgeCell>>>;
};

export type IndicatorsFile = {
  indicators: Indicator[];
};

const SEX_INDEX: Record<string, number> = {
  [TOTAL_CATEGORY]: 0,
  Эрэгтэй: 1,
  Эмэгтэй: 2,
};

function ageBand(ageId: string): "child" | "work" | "old" {
  if (ageId === TOTAL_CATEGORY) return "work";
  if (ageId.startsWith("65")) return "old";
  const match = /^(\d+)/.exec(ageId);
  if (match && Number(match[1]) <= 14) return "child";
  return "work";
}

function bandSum(
  byAge: Record<string, AgeCounts> | undefined,
  band: "child" | "work" | "old",
  sexIndex: number,
) {
  if (!byAge) return 0;
  let sum = 0;
  for (const [ageId, counts] of Object.entries(byAge)) {
    if (ageBand(ageId) === band) sum += counts[sexIndex] ?? 0;
  }
  return sum;
}

function dependencyRatio(dependents: number, working: number) {
  if (working <= 0) return 0;
  return Math.round((dependents / working) * 1000) / 10;
}

function layerWeights(
  indicator: Indicator,
  categoryId: string,
  layer: MapLayer,
): CodeValues {
  const weights = indicator.weights;
  if (!weights) return {};
  if ("aimag" in weights || "soum" in weights || "bag" in weights) {
    return (weights as Record<MapLayer, CodeValues>)[layer] ?? {};
  }
  return (weights as Record<string, Record<MapLayer, CodeValues>>)[categoryId]?.[layer] ?? {};
}

function weightedRate(
  indicator: Indicator,
  categoryId: string,
  layer: MapLayer,
  codes: number[],
) {
  let num = 0;
  let den = 0;
  const weights = layerWeights(indicator, categoryId, layer);
  for (const code of codes) {
    const key = String(code);
    const rate = indicator.values[categoryId]?.[layer]?.[key] ?? 0;
    const weight = weights[key] ?? 0;
    if (weight > 0) {
      num += rate * weight;
      den += weight;
    }
  }
  if (den <= 0) return 0;
  return Math.round((num / den) * 10) / 10;
}

function cellValue(
  cell: AgeCell | undefined,
  categoryId: string,
  sexId: string,
) {
  if (!cell) return 0;
  if (Array.isArray(cell)) {
    return cell[SEX_INDEX[categoryId] ?? 0] ?? 0;
  }
  const triple = cell[categoryId];
  if (!triple) return 0;
  return triple[SEX_INDEX[sexId] ?? 0] ?? 0;
}

function sharePercent(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function countValue(
  indicator: Indicator,
  categoryId: string,
  layer: MapLayer,
  key: string,
  ageId: string,
  sexId: string,
) {
  const byAge = indicator.ageTable?.[layer]?.[key];
  if (!byAge) {
    return indicator.values[categoryId]?.[layer]?.[key] ?? 0;
  }

  const sample = Object.values(byAge)[0];
  const categoryAge = sample != null && !Array.isArray(sample);

  if (!categoryAge) {
    const triple = byAge[ageId];
    if (Array.isArray(triple)) {
      return triple[SEX_INDEX[categoryId] ?? 0] ?? 0;
    }
    return indicator.values[categoryId]?.[layer]?.[key] ?? 0;
  }

  if (ageId !== TOTAL_CATEGORY) {
    return cellValue(byAge[ageId], categoryId, sexId);
  }
  if (sexId === TOTAL_CATEGORY) {
    return indicator.values[categoryId]?.[layer]?.[key] ?? 0;
  }
  let sum = 0;
  for (const cell of Object.values(byAge)) {
    sum += cellValue(cell, categoryId, sexId);
  }
  return sum;
}

export function lookupValue(
  indicator: Indicator | undefined,
  categoryId: string,
  layer: MapLayer,
  code: number | null | undefined,
  ageId: string = TOTAL_CATEGORY,
  sexId: string = TOTAL_CATEGORY,
) {
  if (!indicator || code == null) return 0;
  const key = String(code);

  if (indicator.unit === "dependency") {
    const byAge = indicator.ageTable?.[layer]?.[key] as
      | Record<string, AgeCounts>
      | undefined;
    if (byAge) {
      const child = bandSum(byAge, "child", 0);
      const old = bandSum(byAge, "old", 0);
      const work = bandSum(byAge, "work", 0);
      const dependents =
        categoryId === CHILD_CATEGORY
          ? child
          : categoryId === ELDERLY_CATEGORY
            ? old
            : child + old;
      return dependencyRatio(dependents, work);
    }
    return indicator.values[categoryId]?.[layer]?.[key] ?? 0;
  }

  if (indicator.unit === "share") {
    return sharePercent(
      countValue(indicator, categoryId, layer, key, ageId, sexId),
      countValue(indicator, TOTAL_CATEGORY, layer, key, ageId, sexId),
    );
  }

  return countValue(indicator, categoryId, layer, key, ageId, sexId);
}

export function aggregateValue(
  indicator: Indicator,
  layer: MapLayer,
  codes: number[],
  categoryId: string = TOTAL_CATEGORY,
  ageId: string = TOTAL_CATEGORY,
  sexId: string = TOTAL_CATEGORY,
) {
  if (indicator.unit === "dependency") {
    let child = 0;
    let old = 0;
    let work = 0;
    let hasCounts = false;
    for (const code of codes) {
      const byAge = indicator.ageTable?.[layer]?.[String(code)] as
        | Record<string, AgeCounts>
        | undefined;
      if (!byAge) continue;
      hasCounts = true;
      child += bandSum(byAge, "child", 0);
      old += bandSum(byAge, "old", 0);
      work += bandSum(byAge, "work", 0);
    }
    if (hasCounts) {
      const dependents =
        categoryId === CHILD_CATEGORY
          ? child
          : categoryId === ELDERLY_CATEGORY
            ? old
            : child + old;
      return dependencyRatio(dependents, work);
    }
    return weightedRate(indicator, categoryId, layer, codes);
  }

  if (indicator.unit === "rate") {
    return weightedRate(indicator, categoryId, layer, codes);
  }

  if (indicator.unit === "share") {
    let part = 0;
    let whole = 0;
    for (const code of codes) {
      const key = String(code);
      part += countValue(indicator, categoryId, layer, key, ageId, sexId);
      whole += countValue(indicator, TOTAL_CATEGORY, layer, key, ageId, sexId);
    }
    return sharePercent(part, whole);
  }

  if (indicator.unit === "ratio") {
    let male = 0;
    let female = 0;
    for (const code of codes) {
      const key = String(code);
      const cell =
        ageId !== TOTAL_CATEGORY
          ? indicator.ageTable?.[layer]?.[key]?.[ageId]
          : undefined;
      if (Array.isArray(cell)) {
        male += cell[1] ?? 0;
        female += cell[2] ?? 0;
      } else {
        male += indicator.values.Эрэгтэй?.[layer]?.[key] ?? 0;
        female += indicator.values.Эмэгтэй?.[layer]?.[key] ?? 0;
      }
    }
    if (female <= 0) return 0;
    return Math.round((male / female) * 1000) / 10;
  }

  return codes.reduce(
    (sum, code) =>
      sum + lookupValue(indicator, categoryId, layer, code, ageId, sexId),
    0,
  );
}
