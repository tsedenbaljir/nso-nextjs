import { NextResponse } from "next/server";
import { dashboards } from "@/config/socio-dashboards";
import { getTrendFromPx, getTrendFromPxLastN, getBopCumulativeTrend, getForeignTradeCardTrend, getStateBudgetCardTrend } from "@/lib/socio-dashboard/kpi-from-px";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TREND_POINTS_DEFAULT = 12;

function getKpiApiUrl(d: (typeof dashboards)[number]): string | null {
  const url = d.kpiApiUrl ?? d.apiUrl ?? (d.apiUrlByLevel && d.apiUrlByLevel["улс"]);
  return url && typeof url === "string" ? url : null;
}

function getFirstChartApiUrl(d: (typeof dashboards)[number]): string | null {
  const first = d.charts?.[0];
  if (!first) return null;
  if (first.chartApiUrl && typeof first.chartApiUrl === "string")
    return first.chartApiUrl;
  if (first.chartApiUrlByCpiMode && d.id === "cpi")
    return first.chartApiUrlByCpiMode.yearly ?? null;
  return null;
}

function getFirstChartTimeDimension(d: (typeof dashboards)[number]): string {
  const first = d.charts?.[0];
  return first?.xDimension ?? d.primaryDimension ?? "Он";
}

function getFirstChartSelections(d: (typeof dashboards)[number]): Record<string, string[]> | undefined {
  const base = d.kpiSelections ?? {};
  const first = d.charts?.[0];
  if (!first) return Object.keys(base).length ? base : undefined;
  const out = { ...base };
  if (first.filterToSingleValue && typeof first.filterToSingleValue === "object") {
    for (const [dim, code] of Object.entries(first.filterToSingleValue)) {
      out[dim] = [String(code)];
    }
  }
  if (first.defaultSeriesCodes && typeof first.defaultSeriesCodes === "object") {
    for (const [dim, codes] of Object.entries(first.defaultSeriesCodes)) {
      if (Array.isArray(codes) && codes.length) out[dim] = codes.map(String);
    }
  }
  return Object.keys(out).length ? out : undefined;
}

function getTrendApiUrl(d: (typeof dashboards)[number]): string | null {
  const url =
    d.trendApiUrl ?? getFirstChartApiUrl(d) ?? getKpiApiUrl(d);
  return url && typeof url === "string" ? url : null;
}

export async function GET() {
  const result: Record<string, { periods: string[]; values: number[] }> = {};

  for (const d of dashboards) {
    const apiUrl = getTrendApiUrl(d);
    const hasKpi = d.kpiFromApi === true || d.kpiApiUrl != null;
    if (!apiUrl && !hasKpi) continue;
    if (!apiUrl) continue;
    const timeDim =
      d.trendTimeDimension ??
      getFirstChartTimeDimension(d) ??
      d.kpiTimeDimension ??
      d.primaryDimension ??
      "Он";
    const selections = d.trendSelections ?? getFirstChartSelections(d) ?? d.kpiSelections;
    const trendPoints = d.trendPoints ?? TREND_POINTS_DEFAULT;

    const useFirst =
      d.kpiFormat === "percent" || d.kpiFormat === "index-to-percent";

    try {
      if (d.id === "balance-of-payments" && apiUrl) {
        const bopSelections = d.trendSelections ?? d.kpiSelections;
        const indCode = bopSelections?.Үзүүлэлт?.[0] ?? "66";
        // Жил бүр тухайн жилийн өнөөгийн сарын хүртэлх өссөн дүн
        const trend = await getBopCumulativeTrend(apiUrl, indCode);
        if (trend.values.length > 0) {
          result[d.id] = trend;
        }
        continue;
      }
      if (d.id === "foreign-trade" && apiUrl) {
        const trend = await getForeignTradeCardTrend(apiUrl);
        if (trend.values.length > 0) {
          result[d.id] = trend;
        }
        continue;
      }
      if (d.id === "state-budget" && apiUrl) {
        const trend = await getStateBudgetCardTrend(apiUrl);
        if (trend.values.length > 0) {
          result[d.id] = trend;
        }
        continue;
      }
      if (d.id === "cpi-commodity-prices" && apiUrl) {
        const twoYearsMonths = 24;
        const trend = await getTrendFromPxLastN(
          apiUrl,
          timeDim,
          twoYearsMonths,
          useFirst,
          selections
        );
        if (trend.values.length > 0) {
          const periods = trend.periods.slice(-twoYearsMonths);
          const values = trend.values.slice(-twoYearsMonths);
          result[d.id] = { periods, values };
        }
        continue;
      }
      const trend = await getTrendFromPx(
        apiUrl,
        timeDim,
        trendPoints,
        useFirst,
        selections
      );
      if (trend.values.length > 0) {
        const maxPoints = 100;
        let periods = trend.periods.length > maxPoints ? trend.periods.slice(-maxPoints) : trend.periods;
        let values = trend.values.length > maxPoints ? trend.values.slice(-maxPoints) : trend.values;

        // Боловсролын card-ын chart – зөвхөн 2020 оноос хойш
        if (d.id === "society-education") {
          const filtered: { p: string; v: number }[] = [];
          for (let i = 0; i < periods.length; i++) {
            const p = periods[i] ?? "";
            const yearMatch = /(\d{4})/.exec(String(p));
            const year = yearMatch ? parseInt(yearMatch[1]!, 10) : NaN;
            if (!Number.isNaN(year) && year >= 2020) {
              filtered.push({ p, v: values[i] ?? 0 });
            }
          }
          if (filtered.length) {
            periods = filtered.map((x) => x.p);
            values = filtered.map((x) => x.v);
          }
        }

        result[d.id] = { periods, values };
      }
    } catch {
      // skip failed dashboards
    }
  }

  return NextResponse.json(result);
}
