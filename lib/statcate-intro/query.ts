import { DEFAULT_TOTAL_LABELS, DEFAULT_NATIONAL_CODE, DEFAULT_GEO_GROUP_CODES, INTRO_COLORS } from "@/lib/statcate-intro/constants";
import { num, trimLabel } from "@/lib/statcate-intro/format";
import type { IntroDashboardConfig, IntroTableData, PxRow } from "@/lib/statcate-intro/types";

export type QueryScope = {
  year?: string;
  category?: string | "total" | "parts";
  geo?: "national" | "aimags" | "all";
};

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

export function yearOrLatest(rows: PxRow[], config: IntroDashboardConfig, year: string) {
  const years = listYears(rows, config.dimensions.time);
  if (!years.length) return year;
  if (years.includes(year)) return year;
  const n = Number(year);
  return years.find((item) => Number(item) <= n) ?? years[0];
}

export function queryRows(
  rows: PxRow[],
  config: IntroDashboardConfig,
  scope: QueryScope,
  table?: Pick<IntroTableData, "geo">,
) {
  const { time, category } = config.dimensions;
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

export function listYears(rows: PxRow[], timeDim: string) {
  return [...new Set(rows.map((row) => dimLabel(row, timeDim)).filter(Boolean))].sort(
    (a, b) => Number(b) - Number(a),
  );
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
  table?: Pick<IntroTableData, "geo" | "nationalMode">,
  fallbackYear = false,
) {
  const resolvedYear = fallbackYear ? yearOrLatest(rows, config, year) : year;
  const scope: QueryScope = { year: resolvedYear };
  const geo = geoDimOf(config, table);
  if (geo) scope.geo = "national";
  if (config.dimensions.category) scope.category = category ?? "total";

  const matched = queryRows(rows, config, scope, table);
  if (matched.length) {
    return table?.nationalMode === "average" || config.dimensions.category ? sumOrMean(matched, table) : sumRows(matched);
  }

  if (table?.nationalMode === "average" && geo) {
    const parts = queryRows(rows, config, { ...scope, geo: "all" }, table);
    return meanRows(parts);
  }

  if (config.dimensions.category && !category) {
    return sumRows(queryRows(rows, config, { ...scope, category: "parts" }, table));
  }

  return 0;
}

function sumOrMean(rows: PxRow[], table?: Pick<IntroTableData, "nationalMode">) {
  if (table?.nationalMode === "average") return meanRows(rows);
  return sumRows(rows);
}

function meanRows(rows: PxRow[]) {
  const values = rows.map((row) => num(row.value)).filter((value) => Number.isFinite(value));
  if (!values.length) return 0;
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
