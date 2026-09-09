import { DEFAULT_TOTAL_LABELS, DEFAULT_NATIONAL_CODE, DEFAULT_GEO_GROUP_CODES, INTRO_COLORS } from "@/lib/statcate-intro/constants";
import { finiteNum, num, trimLabel } from "@/lib/statcate-intro/format";
import type { IntroDashboardConfig, IntroTableData, PxRow } from "@/lib/statcate-intro/types";

export type QueryScope = {
  year?: string;
  category?: string | "total" | "parts";
  geo?: "national" | "aimags" | "all";
};

type TableDims = Pick<IntroTableData, "geo" | "nationalMode" | "time">;

export function dimLabel(row: PxRow, dim: string) {
  return trimLabel(row[dim]);
}

export function dimCode(row: PxRow, dim: string) {
  return String(row[`${dim}_code`] ?? "");
}

export function isTotalLabel(label: string, totals: string[]) {
  const t = trimLabel(label).toLowerCase();
  return totals.some((item) => item.toLowerCase() === t);
}

function totalsOf(config: IntroDashboardConfig) {
  return config.totals ?? DEFAULT_TOTAL_LABELS;
}

export function geoDimOf(config: IntroDashboardConfig, table?: Pick<IntroTableData, "geo">) {
  return table?.geo ?? config.dimensions.geo;
}

function tableHasGeo(rows: PxRow[], geo?: string) {
  if (!geo) return false;
  return rows.some((row) => {
    const code = row[`${geo}_code`];
    const label = row[geo];
    return (code != null && String(code) !== "") || (label != null && String(label).trim() !== "");
  });
}

export function timeDimOf(config: IntroDashboardConfig, table?: Pick<IntroTableData, "time">) {
  return table?.time ?? config.dimensions.time;
}

/** "2026-07", "2026-1", "2025" → calendar year used by the intro year picker. */
export function periodYear(label: string) {
  const match = String(label).match(/^(\d{4})/);
  return match ? match[1] : String(label);
}

function periodSortKey(label: string) {
  const match = String(label).match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!match) return Number.NaN;
  return Number(match[1]) * 100 + Number(match[2] || 12);
}

function timeLabels(rows: PxRow[], timeDim: string, onlyFinite = false) {
  return [
    ...new Set(
      rows
        .filter((row) => !onlyFinite || finiteNum(row.value) != null)
        .map((row) => dimLabel(row, timeDim))
        .filter(Boolean),
    ),
  ];
}

export function yearOrLatest(
  rows: PxRow[],
  config: IntroDashboardConfig,
  year: string,
  table?: TableDims,
  fallbackYear = true,
) {
  const time = timeDimOf(config, table);
  const labelsWithData = timeLabels(rows, time, true);
  const labels = labelsWithData.length ? labelsWithData : timeLabels(rows, time);
  if (!labels.length) return year;
  if (labels.includes(year)) return year;

  const inYear = labels
    .filter((label) => periodYear(label) === year)
    .sort((a, b) => periodSortKey(a) - periodSortKey(b));
  if (inYear.length) return inYear[inYear.length - 1];

  if (!fallbackYear) return year;

  const years = listYears(rows, time);
  const n = Number(year);
  const fallback = years.find((item) => Number(item) <= n) ?? years[0];
  const inFallback = labels
    .filter((label) => periodYear(label) === fallback)
    .sort((a, b) => periodSortKey(a) - periodSortKey(b));
  return inFallback[inFallback.length - 1] ?? fallback ?? year;
}

export function queryRows(
  rows: PxRow[],
  config: IntroDashboardConfig,
  scope: QueryScope,
  table?: TableDims,
) {
  const time = timeDimOf(config, table);
  const category = config.dimensions.category;
  const geo = geoDimOf(config, table);
  const totals = totalsOf(config);
  const nationalCode = config.geo?.nationalCode ?? DEFAULT_NATIONAL_CODE;
  const groupCodes = new Set(config.geo?.groupCodes ?? DEFAULT_GEO_GROUP_CODES);

  return rows.filter((row) => {
    if (scope.year && time && dimLabel(row, time) !== scope.year) return false;

    if (category && scope.category) {
      const label = dimLabel(row, category);
      if (scope.category === "total" && !isTotalLabel(label, totals)) return false;
      if (scope.category === "parts" && isTotalLabel(label, totals)) return false;
      if (scope.category !== "total" && scope.category !== "parts" && label !== scope.category) {
        return false;
      }
    }

    if (geo && scope.geo) {
      const code = dimCode(row, geo);
      if (scope.geo === "national" && code !== nationalCode) return false;
      if (scope.geo === "aimags" && groupCodes.has(code)) return false;
      if (scope.geo === "all") return true;
    }

    return true;
  });
}

export function sumRows(rows: PxRow[]) {
  return rows.reduce((acc, row) => acc + num(row.value), 0);
}

function finiteValues(rows: PxRow[]) {
  return rows.map((row) => finiteNum(row.value)).filter((value): value is number => value != null);
}

export function listYears(rows: PxRow[], timeDim: string) {
  const years = new Set<string>();
  for (const row of rows) {
    if (finiteNum(row.value) == null) continue;
    const year = periodYear(dimLabel(row, timeDim));
    if (year) years.add(year);
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function hasYear(
  rows: PxRow[],
  config: IntroDashboardConfig,
  year: string,
  table?: Pick<IntroTableData, "time">,
) {
  const time = timeDimOf(config, table);
  return rows.some((row) => {
    if (finiteNum(row.value) == null) return false;
    const label = dimLabel(row, time);
    return label === year || periodYear(label) === periodYear(year);
  });
}

export function rowsForYear(
  rows: PxRow[],
  config: IntroDashboardConfig,
  year: string,
  table?: TableDims,
  fallbackYear = true,
) {
  const usedYear = yearOrLatest(rows, config, year, table, fallbackYear);
  const time = timeDimOf(config, table);
  return {
    year: usedYear,
    rows: rows.filter((row) => dimLabel(row, time) === usedYear),
  };
}

export function listCategories(rows: PxRow[], config: IntroDashboardConfig) {
  const category = config.dimensions.category;
  if (!category) return [];
  const totals = totalsOf(config);
  return [
    ...new Set(
      rows
        .map((row) => dimLabel(row, category))
        .filter((label) => label && !isTotalLabel(label, totals)),
    ),
  ];
}

export function nationalValue(
  rows: PxRow[],
  config: IntroDashboardConfig,
  year: string,
  category?: string,
  table?: TableDims,
  fallbackYear = false,
): number | null {
  const resolvedYear = yearOrLatest(rows, config, year, table, fallbackYear);
  const scope: QueryScope = { year: resolvedYear };
  const geo = geoDimOf(config, table);
  if (geo && tableHasGeo(rows, geo)) scope.geo = "national";
  if (config.dimensions.category) scope.category = category ?? "total";

  const matched = queryRows(rows, config, scope, table);
  if (matched.length) {
    return table?.nationalMode === "average" || config.dimensions.category
      ? sumOrMean(matched, table)
      : sumFinite(matched);
  }

  if (table?.nationalMode === "average" && geo && tableHasGeo(rows, geo)) {
    const parts = queryRows(rows, config, { ...scope, geo: "all" }, table);
    return meanRows(parts);
  }

  if (config.dimensions.category && !category) {
    return sumFinite(queryRows(rows, config, { ...scope, category: "parts" }, table));
  }

  return null;
}

function sumFinite(rows: PxRow[]) {
  const values = finiteValues(rows);
  if (!values.length) return null;
  return values.reduce((acc, value) => acc + value, 0);
}

function sumOrMean(rows: PxRow[], table?: Pick<IntroTableData, "nationalMode">) {
  if (table?.nationalMode === "average") return meanRows(rows);
  return sumFinite(rows);
}

function meanRows(rows: PxRow[]) {
  const values = finiteValues(rows);
  if (!values.length) return null;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

export function colorFor(label: string, index: number, map?: Record<string, string>) {
  const t = trimLabel(label);
  if (map?.[t]) return map[t];
  if (map) {
    const key = Object.keys(map).find((name) => t.toLowerCase().includes(name.toLowerCase()));
    if (key) return map[key];
  }
  return INTRO_COLORS[index % INTRO_COLORS.length];
}
