"use client";

import { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { jsonStatToRows } from "@/lib/socio-dashboard/parse-json-stat";
import type { JsonStatDataset, DataRow } from "@/lib/socio-dashboard/types";
import type { ChartConfig } from "@/lib/socio-dashboard/types";

const MALE_COLOR = "#0050C3";
const FEMALE_COLOR = "#0891b2";
const GRID_COLOR = "rgba(0, 80, 195, 0.06)";

const AGE_BANDS: { key: string; label: string; min: number; max: number }[] = [
  { key: "<1",   label: "<1",   min: 0,  max: 0  },
  { key: "1-4",  label: "1-4",  min: 1,  max: 4  },
  { key: "5-9",  label: "5-9",  min: 5,  max: 9  },
  { key: "10-14",label: "10-14",min: 10, max: 14 },
  { key: "15-19",label: "15-19",min: 15, max: 19 },
  { key: "20-24",label: "20-24",min: 20, max: 24 },
  { key: "25-29",label: "25-29",min: 25, max: 29 },
  { key: "30-34",label: "30-34",min: 30, max: 34 },
  { key: "35-39",label: "35-39",min: 35, max: 39 },
  { key: "40-44",label: "40-44",min: 40, max: 44 },
  { key: "45-49",label: "45-49",min: 45, max: 49 },
  { key: "50-54",label: "50-54",min: 50, max: 54 },
  { key: "55-59",label: "55-59",min: 55, max: 59 },
  { key: "60-64",label: "60-64",min: 60, max: 64 },
  { key: "65-69",label: "65-69",min: 65, max: 69 },
  { key: "70+",  label: "70+",  min: 70, max: 999 },
];

function getAgeBand(ageNum: number): string {
  const band = AGE_BANDS.find((b) => ageNum >= b.min && ageNum <= b.max);
  return band?.key ?? "70+";
}

function fetchPxJson(url: string, body: unknown): Promise<JsonStatDataset> {
  const params = new URLSearchParams({ url });
  return fetch(`/api/px?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).then((r) => {
    if (!r.ok) throw new Error("PX fetch failed");
    return r.json() as Promise<JsonStatDataset>;
  });
}

interface PopulationPyramidChartProps {
  config: ChartConfig;
  /** Хоёр баганад гарчиг давхардахгүй байхын тулд гарчиг/тайлбар нууна. */
  hideHeader?: boolean;
}

interface YearOption { code: string; label: string }

export function PopulationPyramidChart({ config, hideHeader = false }: PopulationPyramidChartProps) {
  const [rows, setRows] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearOptions, setYearOptions] = useState<YearOption[]>([]);
  const [selectedYearCode, setSelectedYearCode] = useState<string | null>(null);

  const chartApiUrl = config.chartApiUrl;
  const fixedQuery = config.chartFixedQuery;

  // Metadata татаж жилүүдийн жагсаалт гаргах
  useEffect(() => {
    if (!chartApiUrl || !fixedQuery?.query) { setLoading(false); return; }
    const yearVar = fixedQuery.query.find((q) => q.code === "Он");
    if (!yearVar) { setLoading(false); return; }
    const codes = yearVar.selection.values; // ["0","1",...,"24"]
    // GET metadata-аас label авна
    const params = new URLSearchParams({ url: chartApiUrl });
    fetch(`/api/px?${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((meta: { id?: string[]; dimension?: Record<string, { label?: string; category?: { index?: Record<string, number>; label?: Record<string, string> } }> }) => {
        const dim = meta.dimension?.["Он"];
        const catLabel = dim?.category?.label ?? {};
        const opts: YearOption[] = codes.map((c) => ({ code: c, label: catLabel[c] ?? c }));
        setYearOptions(opts);
        // code "0" = хамгийн сүүлийн он (API-д descending)
        setSelectedYearCode(codes[0] ?? null);
      })
      .catch(() => {
        const opts = codes.map((c) => ({ code: c, label: c }));
        setYearOptions(opts);
        setSelectedYearCode(codes[0] ?? null);
      });
  }, [chartApiUrl, fixedQuery]);

  // Сонгосон жилийн өгөгдөл татах
  useEffect(() => {
    if (!chartApiUrl || !fixedQuery?.query || selectedYearCode === null) return;
    setLoading(true);
    setError(null);
    const oneYearQuery = fixedQuery.query.map((q) =>
      q.code === "Он"
        ? { ...q, selection: { ...q.selection, values: [selectedYearCode] } }
        : q
    );
    fetchPxJson(chartApiUrl, { ...fixedQuery, query: oneYearQuery })
      .then((dataset) => setRows(jsonStatToRows(dataset)))
      .catch(() => setError("Уучлаарай алдаа гарлаа."))
      .finally(() => setLoading(false));
  }, [chartApiUrl, fixedQuery, selectedYearCode]);

  const byBandData = useMemo(() => {
    const byBand = new Map<string, { male: number; female: number }>();
    for (const b of AGE_BANDS) byBand.set(b.key, { male: 0, female: 0 });
    for (const r of rows) {
      const sexCode = String(r["Хүйс_code"] ?? r["Хүйс"] ?? "");
      const ageLabel = r["Нас"] ?? r["Нас_code"];
      const ageNum = typeof ageLabel === "number" ? ageLabel : parseInt(String(ageLabel ?? "0"), 10);
      const band = getAgeBand(Number.isNaN(ageNum) ? 0 : ageNum);
      const val = Number(r.value) || 0;
      const cur = byBand.get(band);
      if (!cur) continue;
      if (sexCode === "1") cur.male += val;
      else if (sexCode === "2") cur.female += val;
    }
    return byBand;
  }, [rows]);

  const peakBand = useMemo(() => {
    let best: { label: string; total: number } | null = null;
    for (const b of AGE_BANDS) {
      const d = byBandData.get(b.key);
      if (!d) continue;
      const total = d.male + d.female;
      if (!best || total > best.total) best = { label: b.label, total };
    }
    return best;
  }, [byBandData]);

  const genderStats = useMemo(() => {
    let totalMale = 0;
    let totalFemale = 0;
    for (const b of AGE_BANDS) {
      const d = byBandData.get(b.key);
      if (!d) continue;
      totalMale += d.male;
      totalFemale += d.female;
    }
    const total = totalMale + totalFemale;
    const femalePct = total > 0 ? (totalFemale / total) * 100 : 0;
    return { totalMale, totalFemale, total, femalePct };
  }, [byBandData]);

  const selectedYearLabel = useMemo(() => {
    const found = yearOptions.find(y => y.code === selectedYearCode);
    if (found?.label && found.label !== found.code) {
      return found.label;
    }
    // Fallback: хэрэв label нь code-тэй адил бол тооцоолох (2024 - index)
    const codeNum = parseInt(selectedYearCode ?? "0", 10);
    if (!Number.isNaN(codeNum)) {
      return String(2024 - codeNum);
    }
    return selectedYearCode ?? "";
  }, [yearOptions, selectedYearCode]);

  const option: EChartsOption = useMemo(() => {
    if (!rows.length) return {};

    const byBand = byBandData;

    const labels = AGE_BANDS.map((b) => b.label);
    const maleData = AGE_BANDS.map((b) => -(byBand.get(b.key)?.male ?? 0));
    const femaleData = AGE_BANDS.map((b) => byBand.get(b.key)?.female ?? 0);

    const maxVal = Math.max(
      ...maleData.map(Math.abs),
      ...femaleData
    );
    const xMax = Math.ceil(maxVal * 1.08 / 10000) * 10000;

    return {
      grid: { top: 0, bottom: 0, left: 0, right: 0 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        borderColor: "#0d9488",
        borderWidth: 1,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        confine: true,
        padding: [12, 16],
        extraCssText: "border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
        textStyle: { color: "#f1f5f9", fontSize: 12 },
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params : [];
          const idx = p[0]?.dataIndex;
          if (idx == null) return "";
          const male = Math.abs(maleData[idx] ?? 0);
          const female = femaleData[idx] ?? 0;
          return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.15);">
              <span style="color:#2dd4bf;font-size:14px;">◉</span>
              <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${labels[idx]} нас</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;">
              <span style="color:#94a3b8;font-size:12px;">Эрэгтэй</span>
              <span style="color:#f1f5f9;font-weight:600;">${male.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;">
              <span style="color:#94a3b8;font-size:12px;">Эмэгтэй</span>
              <span style="color:#f1f5f9;font-weight:600;">${female.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:8px 0 0;margin-top:8px;border-top:1px solid rgba(255,255,255,0.15);">
              <span style="color:#94a3b8;font-size:12px;">Нийт</span>
              <span style="color:#2dd4bf;font-weight:600;">${(male + female).toLocaleString()}</span>
            </div>`;
        },
      },
      xAxis: {
        type: "value",
        min: -xMax,
        max: xMax,
        axisLine: { show: false, lineStyle: { width: 0, opacity: 0 } },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 11,
          color: "#64748b",
          formatter: (v: number) => Math.abs(Number(v)).toLocaleString(),
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "category",
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: "#64748b" },
        splitLine: { show: false },
        inverse: false,
        boundaryGap: true,
      },
      legend: { show: false },
      series: [
        {
          name: "Эрэгтэй",
          type: "bar",
          data: maleData,
          itemStyle: { 
            color: "rgba(148, 163, 184, 0.3)", 
            borderColor: MALE_COLOR, 
            borderWidth: 0.25,
          },
          barWidth: "90%",
          barGap: "-100%",
          barCategoryGap: "4%",
          barBorderRadius: [2, 0, 0, 2],
        },
        {
          name: "Эмэгтэй",
          type: "bar",
          data: femaleData,
          itemStyle: { 
            color: "rgba(148, 163, 184, 0.3)", 
            borderColor: FEMALE_COLOR, 
            borderWidth: 0.25,
          },
          barWidth: "90%",
          barGap: "-100%",
          barCategoryGap: "4%",
          barBorderRadius: [0, 2, 2, 0],
        },
      ],
    };
  }, [rows, byBandData]);

  const height = config.chartHeight ?? 360;

  if (error) {
    return (
      <div className="py-3">
        <h3 className="chart-section-title">{config.title}</h3>
        {config.description && (
          <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{config.description}</p>
        )}
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {!hideHeader && (
        <div className="mb-2 min-w-0">
          <h3 className="chart-section-title">{config.title}</h3>
          {config.description && (
            <p className="mt-0.5 text-sm font-normal leading-relaxed text-[var(--muted-foreground)]">
              {config.description}
            </p>
          )}
        </div>
      )}
      {/* Women percentage KPI */}
      {genderStats.total > 0 && (
        <div className="mb-3">
          <p className="chart-section-label text-[var(--muted-foreground)]">Эмэгтэйчүүдийн эзлэх хувь</p>
          <div className="flex items-baseline gap-2">
            <span className="chart-section-value tabular-nums">{genderStats.femalePct.toFixed(1)}%</span>
            <span className="chart-section-label text-[var(--muted-foreground)]">({selectedYearLabel})</span>
          </div>
        </div>
      )}
      {/* Custom legend - centered with text beside icons */}
      <div className="mt-2 mb-3 flex items-center justify-center gap-8 pl-8">
        <div className="flex items-center gap-2">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden>
            <circle cx="10" cy="6" r="5" fill={MALE_COLOR} />
            <path d="M2 22c0-4.5 3.5-7.5 8-7.5s8 3 8 7.5" stroke={MALE_COLOR} strokeWidth="2" strokeLinecap="round" fill={MALE_COLOR} fillOpacity="0.2" />
          </svg>
          <span className="chart-section-label font-medium" style={{ color: MALE_COLOR }}>Эрэгтэй</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden>
            <circle cx="10" cy="6" r="5" fill={FEMALE_COLOR} />
            <path d="M2 22c0-4.5 3.5-7.5 8-7.5s8 3 8 7.5" stroke={FEMALE_COLOR} strokeWidth="2" strokeLinecap="round" fill={FEMALE_COLOR} fillOpacity="0.2" />
          </svg>
          <span className="chart-section-label font-medium" style={{ color: FEMALE_COLOR }}>Эмэгтэй</span>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[var(--muted-foreground)]">
          Ачааллаж байна...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8 text-sm text-red-600">{error}</div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-[var(--muted-foreground)]">Өгөгдөл байхгүй</div>
      ) : (
        <ReactECharts option={option} style={{ height: `${height}px`, marginTop: -4 }} notMerge />
      )}
    </div>
  );
}
