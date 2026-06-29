import { NextResponse } from "next/server";
import { dashboards } from "@/config/socio-dashboards";
import { getLatestKpiFromPx, getLatestKpiWithGrowthFromPx, getLatestBopKpi, getLatestMoneySupplyKpi, formatKpiValue } from "@/lib/socio-dashboard/kpi-from-px";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getKpiApiUrl(d: (typeof dashboards)[number]): string | null {
  const url = d.kpiApiUrl ?? d.apiUrl ?? (d.apiUrlByLevel && d.apiUrlByLevel["улс"]);
  return url && typeof url === "string" ? url : null;
}

export async function GET() {
  const result: Record<string, { value: string; period: string; growthPercent?: number }> = {};

  for (const d of dashboards) {
    const useApi = d.kpiFromApi === true || d.kpiApiUrl != null;
    if (!useApi) continue;

    const apiUrl = getKpiApiUrl(d);
    const timeDim = d.kpiTimeDimension ?? d.primaryDimension ?? "Он";
    if (!apiUrl) continue;

    try {
      const useFirst = d.kpiFormat === "percent" || d.kpiFormat === "index-to-percent";
      
      // Мөнгө санхүү: M2 тухайн сар + 12 сар өмнөхтэй харьцуулсан өсөлт %
      if (d.id === "money-finance") {
        const { value, period, growthPercent } = await getLatestMoneySupplyKpi(apiUrl);
        result[d.id] = {
          value: value != null && Number.isFinite(value)
            ? `${(Number(value)/1000).toFixed(1)} тэрбум ₮`
            : "—",
          period: period ?? "",
          growthPercent,
        };
        continue;
      }
      // BOP: тухайн жилийн өнөөгийн сарын хүртэлх өссөн дүн (жил бүр ижил сар хүртэл)
      if (d.id === "balance-of-payments") {
        const indCode = d.kpiSelections?.Үзүүлэлт?.[0] ?? "66";
        const { value, period } = await getLatestBopKpi(apiUrl, indCode);
        result[d.id] = {
          value: value != null && Number.isFinite(value)
            ? `${Math.round(value).toLocaleString(undefined, { useGrouping: false })} сая $`
            : "—",
          // period нь жилээр (жишээ: 2026) — картад зөвхөн жилийг харуулна
          period: period ?? "",
        };
        continue;
      }
      // Growth percent-г API-с авах
      if (d.kpiGrowthFromApi) {
        const { value, period, growthPercent } = await getLatestKpiWithGrowthFromPx(
          apiUrl,
          timeDim,
          d.kpiSelections,
          d.kpiGrowthFromApi
        );
        const periodStr = period ?? "";
        if (d.id === "gdp" && value != null && Number.isFinite(value)) {
          result[d.id] = {
            value: `${(value / 1e6).toFixed(1)} их наяд`,
            period: periodStr,
            growthPercent,
          };
        } else {
          result[d.id] = {
            value: formatKpiValue(value, d.kpiFormat),
            period: periodStr,
            growthPercent,
          };
        }
        continue;
      }
      
      const { value, period } = await getLatestKpiFromPx(
        apiUrl,
        timeDim,
        useFirst,
        d.kpiSelections
      );
      const periodStr = period ?? "";
      if (d.id === "cpi-commodity-prices" && value != null && Number.isFinite(value)) {
        result[d.id] = {
          value: Math.round(value).toLocaleString("en-US"),
          period: periodStr,
        };
      } else if (d.id === "gdp" && value != null && Number.isFinite(value)) {
        result[d.id] = {
          value: `${(value / 1e6).toFixed(1)} их наяд`,
          period: periodStr,
        };
      } else if (d.id === "household-survey" && value != null && Number.isFinite(value)) {
        result[d.id] = {
          value: `${(value / 1e6).toFixed(1)} сая`,
          period: periodStr,
        };
      } else if (d.id === "average-salary" && value != null && Number.isFinite(value)) {
        result[d.id] = {
          value: `${(value / 1000).toFixed(1)} сая`,
          period: periodStr,
        };
      } else if (d.id === "state-budget" && value != null && Number.isFinite(value)) {
        result[d.id] = {
          value: `${(value / 1000000).toFixed(2)} их наяд`,
          period: periodStr,
        };
      } else if (d.id === "livestock" && value != null && Number.isFinite(value)) {
        result[d.id] = {
          value: (value / 1000).toFixed(1),
          period: periodStr,
        };
      } else if (d.id === "foreign-trade" && value != null && Number.isFinite(value)) {
        result[d.id] = {
          value: `${(value).toFixed(0)} сая $`,
          period: periodStr,
        };
      } else if (d.id === "balance-of-payments" && value != null && Number.isFinite(value)) {
        result[d.id] = {
          value: `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} сая $`,
          period: periodStr,
        };
      } else {
        result[d.id] = {
          value: formatKpiValue(value, d.kpiFormat),
          period: periodStr,
        };
      }
    } catch {
      result[d.id] = { value: "—", period: "" };
    }
  }

  return NextResponse.json(result);
}
