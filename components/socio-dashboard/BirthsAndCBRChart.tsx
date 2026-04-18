"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { DataRow } from "@/lib/socio-dashboard/types";
import { RangeSlider } from "./RangeSlider";

const BAR_COLOR = "#0050C3";
const LINE_COLOR = "#0891b2";

/** Өгөгдлийн мөрнөөс жил (X) баганы нэрийг олно. JSON-stat-ийн dimension id нь "Он", "Он_code" эсвэл өөр байж болно. */
function detectYearKey(rows: DataRow[], fallback: string): string {
  if (!rows.length) return fallback;
  const first = rows[0] as Record<string, unknown>;
  if (first["Он"] != null && String(first["Он"]).trim() !== "") return "Он";
  if (first["Он_code"] != null && String(first["Он_code"]).trim() !== "") return "Он_code";
  for (const key of Object.keys(first)) {
    if (key === "value" || key.endsWith("_code")) continue;
    const val = first[key];
    const s = String(val ?? "").trim();
    if (/^(19|20)\d{2}$/.test(s)) return key;
  }
  return fallback;
}

interface BirthsAndCBRChartProps {
  /** Баарын өгөгдөл — Он, value */
  birthRows: DataRow[];
  /** Шугамын өгөгдөл — Он, value */
  cbrRows: DataRow[];
  xKey?: string;
  valueKey?: string;
  rangeYears?: [string, string] | null;
  onRangeYearsChange?: (startYear: string, endYear: string) => void;
  showRangeSlider?: boolean;
  rangeSliderPlayFromYear?: string;
  chartHeight?: number;
  hideHeader?: boolean;
  barSeriesName?: string;
  lineSeriesName?: string;
  barColor?: string;
  lineColor?: string;
  /** Сүүлийн оны тоог харуулах */
  showLatestValue?: boolean;
}

export function BirthsAndCBRChart({
  birthRows,
  cbrRows,
  xKey = "Он",
  valueKey = "value",
  rangeYears,
  onRangeYearsChange,
  showRangeSlider = true,
  rangeSliderPlayFromYear,
  chartHeight = 400,
  hideHeader = false,
  barSeriesName = "Төрөлт",
  lineSeriesName = "ТЕК",
  barColor = BAR_COLOR,
  lineColor = LINE_COLOR,
  showLatestValue = true,
}: BirthsAndCBRChartProps) {
  const birthYearKey = useMemo(() => detectYearKey(birthRows, xKey), [birthRows, xKey]);
  const cbrYearKey = useMemo(() => detectYearKey(cbrRows, xKey), [cbrRows, xKey]);

  const byYearBirth = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of birthRows) {
      const x = String(r[birthYearKey] ?? r[xKey] ?? "").trim();
      if (!x) continue;
      const v = Number(r[valueKey]) || 0;
      map.set(x, (map.get(x) ?? 0) + v);
    }
    return map;
  }, [birthRows, birthYearKey, xKey, valueKey]);

  const byYearCbr = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of cbrRows) {
      const x = String(r[cbrYearKey] ?? r[xKey] ?? "").trim();
      if (x === "") continue;
      const v = Number(r[valueKey]);
      if (!Number.isNaN(v)) map.set(x, v);
    }
    return map;
  }, [cbrRows, cbrYearKey, xKey, valueKey]);

  const allYears = useMemo(() => {
    const set = new Set<string>([...byYearBirth.keys(), ...byYearCbr.keys()]);
    return [...set].filter(Boolean).sort((a, b) => {
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) return Number(a) - Number(b);
      return String(a).localeCompare(String(b));
    });
  }, [byYearBirth, byYearCbr]);

  const fullData = useMemo(() => {
    return allYears.map((year) => ({
      [xKey]: year,
      births: byYearBirth.get(year) ?? null,
      cbr: byYearCbr.get(year) ?? null,
    }));
  }, [allYears, byYearBirth, byYearCbr, xKey]);

  const n = fullData.length;

  const latestEntry = n > 0 ? fullData[n - 1] : null;
  const prevEntry = n > 1 ? fullData[n - 2] : null;
  const latestYear = latestEntry ? String(latestEntry[xKey] ?? "") : "";
  const latestBirthValue = latestEntry?.births;
  const latestCbrValue = latestEntry?.cbr;
  const prevBirthValue = prevEntry?.births;
  const prevCbrValue = prevEntry?.cbr;
  const latestBirthChangePct =
    latestBirthValue != null && prevBirthValue != null && prevBirthValue !== 0
      ? ((Number(latestBirthValue) - Number(prevBirthValue)) / Number(prevBirthValue)) * 100
      : null;
  const latestCbrChangePct =
    latestCbrValue != null && prevCbrValue != null && prevCbrValue !== 0
      ? ((Number(latestCbrValue) - Number(prevCbrValue)) / Number(prevCbrValue)) * 100
      : null;
  const isControlledRange = !!rangeYears && !!onRangeYearsChange;
  const [range, setRange] = useState<[number, number]>([0, Math.max(0, n - 1)]);
  const rangeRef = useRef<[number, number]>([0, n - 1]);

  useEffect(() => {
    if (n > 0 && !isControlledRange) setRange([0, n - 1]);
  }, [n, isControlledRange]);

  const rangeFromProps = useMemo(() => {
    if (!rangeYears || n === 0) return null;
    const [startY, endY] = rangeYears;
    let i0 = 0,
      i1 = n - 1;
    for (let i = 0; i < n; i++) {
      if (String(fullData[i]?.[xKey] ?? "") >= startY) {
        i0 = i;
        break;
      }
    }
    for (let i = n - 1; i >= 0; i--) {
      if (String(fullData[i]?.[xKey] ?? "") <= endY) {
        i1 = i;
        break;
      }
    }
    return [i0, i1] as [number, number];
  }, [rangeYears, n, xKey, fullData]);

  const rangeClamped: [number, number] =
    rangeFromProps ??
    (isControlledRange
      ? [0, Math.max(0, n - 1)]
      : [
          Math.max(0, Math.min(range[0], n - 1)),
          Math.max(0, Math.min(range[1], n - 1)),
        ]);
  if (rangeClamped[0] > rangeClamped[1]) rangeClamped[0] = rangeClamped[1];
  rangeRef.current = rangeClamped;

  const filteredData = useMemo(
    () => fullData.slice(rangeClamped[0], rangeClamped[1] + 1),
    [fullData, rangeClamped[0], rangeClamped[1]]
  );

  const windowSize = Math.min(6, Math.max(3, n));

  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!isPlaying || n <= 1) return;
    intervalRef.current = setInterval(() => {
      const [a, b] = rangeRef.current;
      if (b >= n - 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
        return;
      }
      const nextEnd = Math.min(b + 1, n - 1);
      const nextStart = rangeSliderPlayFromYear
        ? (() => {
            const idx = fullData.findIndex((r) => String(r[xKey] ?? "") >= rangeSliderPlayFromYear);
            return idx >= 0 ? idx : a;
          })()
        : a;
      const newRange: [number, number] = [nextStart, nextEnd];
      rangeRef.current = newRange;
      if (isControlledRange && onRangeYearsChange) {
        const startY = String(fullData[newRange[0]]?.[xKey] ?? "");
        const endY = String(fullData[newRange[1]]?.[xKey] ?? "");
        onRangeYearsChange(startY, endY);
      } else {
        setRange(newRange);
      }
      setIsPlaying((p) => p);
    }, 800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isPlaying, n, isControlledRange, onRangeYearsChange, fullData, xKey, rangeSliderPlayFromYear]);

  const option: EChartsOption = useMemo(() => {
    if (!filteredData.length) return {};
    const xData = filteredData.map((r) => String(r[xKey]));
    const birthsData = filteredData.map((r) => (r.births != null ? Number(r.births) : null));
    const cbrData = filteredData.map((r) => (r.cbr != null ? Number(r.cbr) : null));

    return {
      grid: { left: 56, right: 56, top: 16, bottom: 16, containLabel: false },
      tooltip: {
        trigger: "axis",
        borderColor: "#0d9488",
        borderWidth: 1,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        confine: true,
        padding: [12, 16],
        extraCssText: "border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
        textStyle: { color: "#f1f5f9", fontSize: 12 },
        formatter: (params: unknown) => {
          const p = Array.isArray(params) ? params : [];
          const axisValue = p[0]?.axisValue ?? "";
          const rows = p
            .filter((item: { value?: number }) => item.value != null)
            .map((item: { seriesName?: string; value?: number; color?: string }) => {
              const val =
                item.seriesName === lineSeriesName
                  ? Number(item.value).toFixed(1)
                  : Number(item.value).toLocaleString();
              return `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                <span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span>
                <span style="color:#f1f5f9;font-weight:600;">${val}</span>
              </div>`;
            });
          return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
            <span style="color:#2dd4bf;font-size:14px;">◉</span>
            <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${String(axisValue)}</span>
          </div>${rows.join("")}`;
        },
      },
      legend: {
        show: false,
      },
      xAxis: {
        type: "category",
        data: xData,
        boundaryGap: true,
        axisLabel: { fontSize: 11, showMinLabel: true, showMaxLabel: true, color: "#64748b" },
        axisLine: { lineStyle: { color: "rgba(0,80,195,0.06)" } },
      },
      yAxis: [
        {
          type: "value",
          position: "left",
          name: "",
          axisLabel: { formatter: (v: number) => (typeof v === "number" ? v.toLocaleString() : String(v)), color: "#64748b" },
          splitLine: { lineStyle: { type: "dashed", color: "rgba(0,80,195,0.06)" } },
        },
        {
          type: "value",
          position: "right",
          name: "",
          min: 0,
          max: 50,
          axisLabel: { formatter: (v: number) => String(v), color: "#64748b" },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: barSeriesName,
          type: "bar",
          data: birthsData,
          itemStyle: { 
            color: "rgba(148, 163, 184, 0.3)", 
            borderColor: barColor, 
            borderWidth: 0.25,
          },
          yAxisIndex: 0,
          label: { show: false },
        },
        {
          name: lineSeriesName,
          type: "line",
          data: cbrData,
          smooth: false,
          showSymbol: true,
          symbolSize: (value: number | null, params: { dataIndex?: number }) => {
            if (value == null) return 0;
            const idx = params.dataIndex ?? 0;
            const year = xData[idx];
            const yearNum = parseInt(year, 10);
            const isLastYear = idx === xData.length - 1;
            if (isLastYear || (!Number.isNaN(yearNum) && yearNum % 5 === 0)) return 6;
            return 0;
          },
          lineStyle: { width: 1, color: lineColor },
          itemStyle: { color: lineColor },
          yAxisIndex: 1,
          label: {
            show: true,
            position: "top",
            formatter: (params: unknown) => {
              const p = params as { value?: number | string | null; dataIndex?: number };
              if (p.value == null) return "";
              const idx = p.dataIndex ?? 0;
              const year = xData[idx];
              const yearNum = parseInt(year, 10);
              const isLastYear = idx === xData.length - 1;
              if (!isLastYear && (Number.isNaN(yearNum) || yearNum % 5 !== 0)) return "";
              return Number(p.value).toFixed(1);
            },
            fontSize: 12,
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor: lineColor,
            padding: [3, 8],
            borderRadius: 3,
          },
        },
      ],
    };
  }, [filteredData, xKey]);

  const isTimeLikeX = n > 0 && /^\d+$/.test(String(fullData[0]?.[xKey] ?? ""));

  return (
    <div className="py-3">
      {!hideHeader && (
        <div className="mb-3">
          <h3 className="chart-section-title">Төрөлт, ТЕК</h3>
          <p className="mt-0.5 chart-section-label font-normal leading-relaxed text-[var(--muted-foreground)]">
            Төрөлтийн тоо (баар) болон төрөлтийн ерөнхий коэффициент — 1000 хүнд ногдох (шугам)
          </p>
        </div>
      )}
      {/* Legend + KPI нэгтгэсэн */}
      {showLatestValue && latestEntry && (
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-4 rounded-sm" style={{ backgroundColor: "rgba(148, 163, 184, 0.3)", border: `1.5px solid ${barColor}` }} />
              <span className="chart-section-label text-[var(--muted-foreground)]">{barSeriesName}</span>
              <span className="chart-section-value tabular-nums">
                {latestBirthValue != null ? Number(latestBirthValue).toLocaleString() : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: lineColor }} />
              <span className="chart-section-label text-[var(--muted-foreground)]">{lineSeriesName}</span>
              <span className="chart-section-value tabular-nums">
                {latestCbrValue != null ? Number(latestCbrValue).toFixed(1) : "—"}
              </span>
              <span className="ml-1 chart-section-label text-[var(--muted-foreground)]">({latestYear})</span>
            </div>
          </div>
        </div>
      )}
      <div className="w-full" style={{ height: chartHeight }}>
        {filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-md bg-[var(--card-bg-muted)]">
            <p className="text-sm text-[var(--muted-foreground)]">Өгөгдөл байхгүй</p>
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
            notMerge
            className="chart-primary"
          />
        )}
      </div>
      {showRangeSlider && isTimeLikeX && n > 1 && (
        <div className="mt-3 pt-2">
          <div className="flex min-h-9 flex-nowrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                if (!isPlaying) {
                  const atEnd = rangeClamped[1] >= n - 1;
                  const minPlayIndex =
                    rangeSliderPlayFromYear != null
                      ? Math.max(
                          0,
                          fullData.findIndex((r) => String(r[xKey] ?? "") >= rangeSliderPlayFromYear)
                        )
                      : 0;
                  const startIndex = minPlayIndex >= 0 ? minPlayIndex : 0;
                  let newRange: [number, number] | null = null;
                  if (atEnd) {
                    newRange = [startIndex, Math.min(startIndex + windowSize - 1, n - 1)];
                  } else {
                    newRange = [rangeClamped[0], Math.min(rangeClamped[1] + 1, n - 1)];
                  }
                  if (newRange && isControlledRange && onRangeYearsChange) {
                    const startY = String(fullData[newRange[0]]?.[xKey] ?? "");
                    const endY = String(fullData[newRange[1]]?.[xKey] ?? "");
                    onRangeYearsChange(startY, endY);
                  } else if (newRange) {
                    setRange(newRange);
                  }
                  if (newRange) rangeRef.current = newRange;
                }
                setIsPlaying((p) => !p);
              }}
              className="range-slider-play-btn"
              title={isPlaying ? "Зогсоох" : "Тоглуулах"}
              aria-label={isPlaying ? "Зогсоох" : "Тоглуулах"}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap text-left text-xs font-normal tabular-nums text-slate-700 dark:text-slate-200">
              {String(fullData[rangeClamped[0]]?.[xKey] ?? "")}
            </span>
            <div className="min-w-0 flex-1 shrink">
              <RangeSlider
                min={0}
                max={n - 1}
                value={rangeClamped}
                onChange={(v) => {
                  if (isControlledRange && onRangeYearsChange) {
                    const startY = String(fullData[v[0]]?.[xKey] ?? "");
                    const endY = String(fullData[v[1]]?.[xKey] ?? "");
                    onRangeYearsChange(startY, endY);
                  } else {
                    setRange(v);
                  }
                  setIsPlaying(false);
                }}
                labels={fullData.map((r) => String(r[xKey]))}
                showLabels={false}
              />
            </div>
            <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap text-right text-xs font-normal tabular-nums text-slate-700 dark:text-slate-200">
              {String(fullData[rangeClamped[1]]?.[xKey] ?? "")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
