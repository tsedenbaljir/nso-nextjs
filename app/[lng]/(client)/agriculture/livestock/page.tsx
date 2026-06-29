"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { Spin } from "antd";
import { getPxMetadata, getPxData } from "@/lib/socio-dashboard/px-api";
import { jsonStatToRows } from "@/lib/socio-dashboard/parse-json-stat";
import type { PxMetadata, PxVariable, DataRow } from "@/lib/socio-dashboard/types";
import { MongoliaChoroplethMap } from "@/components/socio-dashboard/MongoliaChoroplethMap";
import { SocioDashboardBackNav } from "@/components/socio-dashboard/SocioDashboardBackNav";
import { ChartTrend } from "@/components/socio-dashboard/ChartTrend";
import { RangeSlider } from "@/components/socio-dashboard/RangeSlider";
import { AIMAG_NAME_TO_ACODE } from "@/lib/toirog";
import type { MapDataItem } from "@/components/socio-dashboard/MongoliaChoroplethMap";
import "@/components/socio-dashboard/socio-dashboard-shell.scss";

/** Газар тариалан / мал — card chromeгүй, dashboard1212 гарчигийн хэв маяг */
const LIVESTOCK_CHART_SHELL =
  "w-full min-w-0 max-w-none [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:font-semibold [&_h3.chart-section-title]:tracking-wide [&_h3.chart-section-title]:text-[#001C44] dark:[&_h3.chart-section-title]:text-slate-100 [&_.chart-section-value]:text-xl [&_.chart-section-value]:font-semibold sm:[&_.chart-section-value]:text-2xl [&_.chart-section-value]:tabular-nums [&_.chart-section-value]:text-slate-900 dark:[&_.chart-section-value]:text-slate-50 [&_.chart-section-label]:text-[var(--muted-foreground)] [&_.chart-primary]:w-full";

const LIVESTOCK_API_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Industry%2C%20service/Livestock/DT_NSO_1001_021V1.px";

const CROPS_API_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Industry%2C%20service/Agriculture/DT_NSO_1001_036V2.px";

const CROPS_INDICATOR_CODES = ["1", "5", "6", "7", "8", "9", "16", "22"];

const CROPS_CHART_ORDER = [
  "Буудай",
  "Төмс",
  "Тэжээлийн ургамал",
  "Рапс",
  "Хүнсний ногоо",
  "Байцаа",
  "Лууван",
  "Шар манжин",
];

const LIVESTOCK_CHART_ORDER = ["Тэмээ", "Адуу", "Үхэр", "Хонь", "Ямаа"];

const MAP_BUS_CODES = [
  "0","1","2","3","4","5","181","182","183","184","185","261","262","263","264","265","267","341","342","343","344","345","346","348","421","422","423","511",
  "18101","18104","18107","18110","18113","18116","18119","18122","18125","18128","18131","18134","18137","18140","18143","18146","18149","18152","18155","18158","18161","18164","18167","18170",
  "18201","18204","18207","18210","18213","18216","18219","18222","18225","18228","18231","18234","18237","18240","18243","18246","18249","18252",
  "18301","18304","18307","18310","18313","18316","18319","18322","18325","18328","18331","18334","18337",
  "18401","18404","18407","18410","18413","18416","18419","18422","18425","18428","18431","18434","18437","18440","18443","18446","18449",
  "18501","18504","18507","18510","18513","18516","18519","18522","18525","18528","18531","18534","18537","18540","18543","18546","18549","18552","18555",
  "26101","26104","26201","26204","26207","26210","26213","26216","26219","26222","26225","26228","26231","26234","26237","26240","26243","26246","26249","26252","26255",
  "26301","26304","26307","26310","26313","26316","26319","26322","26325","26328","26331","26334","26337","26340","26343","26346",
  "26401","26404","26407","26410","26413","26416","26419","26422","26425","26428","26431","26434","26437","26440","26443","26446","26449","26452","26455","26458",
  "26501","26504","26507","26510","26513","26516","26519","26522","26525","26528","26531","26534","26537","26540","26543","26546","26549","26552","26555",
  "26701","26704","26707","26710","26713","26716","26719","26722","26725","26728","26731","26734","26737","26740","26743","26746","26749","26752","26755","26758","26761","26764","26767",
  "34101","34104","34107","34110","34113","34116","34119","34122","34125","34128","34131","34134","34137","34140","34143","34146","34149","34152","34155","34158","34161","34164","34167","34170","34173","34176","34179",
  "34201","34204","34207","34301","34304","34307","34310","34313","34316","34319","34322","34325","34328","34331","34334","34337","34340","34343","34346","34349",
  "34401","34404","34407","34410","34413","34416","34419","34422","34425","34428","34431","34434","34437","34440",
  "34501","34504","34507","34510","34601","34604","34607","34610","34613","34616","34619","34622","34625","34628","34631","34634","34637","34640","34643",
  "34801","34804","34807","34810","34813","34816","34819","34822","34825","34828","34831","34834","34837","34840","34843",
  "42101","42104","42107","42110","42113","42116","42119","42122","42125","42128","42131","42134","42137","42140",
  "42201","42204","42207","42210","42213","42216","42219","42222","42225","42228","42231","42234","42237",
  "42301","42304","42307","42310","42313","42316","42319","42322","42325","42328","42331","42334","42337","42340","42343","42346","42349","42352",
  "51101","51104","51107","51110","51113","51116","51119","51122","51125"
];

function findVar(meta: PxMetadata, codes: string[]): PxVariable | undefined {
  return meta.variables.find((v) => codes.some((c) => v.code === c || v.text?.includes(c)));
}

function isBusRegionTotal(label: string): boolean {
  const s = String(label ?? "").trim();
  return s === "Улсын дүн" || /бүс\s*$/i.test(s);
}

function isBusSumLevel(label: string): boolean {
  return /\s+[-–]\s+/.test(String(label ?? "").trim());
}

function isAimagOrSumCode(code: string): boolean {
  const c = String(code ?? "").trim();
  return c.length === 3 || c.length === 5;
}

export default function AgricultureLivestockPage() {
  const routeParams = useParams();
  const lng = typeof routeParams?.lng === "string" ? routeParams.lng : "mn";
  const [metadata, setMetadata] = useState<PxMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedAimag, setSelectedAimag] = useState<string>("all");
  const [yearSliderValue, setYearSliderValue] = useState<[number, number]>([45, 55]);
  const [cropsData, setCropsData] = useState<DataRow[]>([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [livestockChartData, setLivestockChartData] = useState<DataRow[]>([]);
  const [livestockChartLoading, setLivestockChartLoading] = useState(false);
  const [mapRows, setMapRows] = useState<DataRow[]>([]);
  const [mapRowsLoading, setMapRowsLoading] = useState(false);
  const [totalLivestockData, setTotalLivestockData] = useState<DataRow[]>([]);
  const [totalLivestockLoading, setTotalLivestockLoading] = useState(false);
  const [mapHeight, setMapHeight] = useState(720);
  const [chartHeight, setChartHeight] = useState(220);
  const [largeChartHeight, setLargeChartHeight] = useState(340);
  const [slicerPlaying, setSlicerPlaying] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fn = () => {
      const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
      setMapHeight(isSmall ? 320 : 720);
      setChartHeight(isSmall ? 160 : 220);
      setLargeChartHeight(isSmall ? 240 : 340);
    };
    fn();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", fn);
      return () => window.removeEventListener("resize", fn);
    }
  }, []);

  const busVar = metadata ? findVar(metadata, ["Бүс", "Бүс"]) : undefined;
  const yearVar = metadata ? findVar(metadata, ["Он", "ОН"]) : undefined;

  const aimagCodes = useMemo(() => {
    if (!busVar?.values?.length) return [];
    const acodes = new Set(Object.values(AIMAG_NAME_TO_ACODE));
    return busVar.values.filter((rawCode) => {
      const code = String(rawCode ?? "").trim();
      if (code.length !== 3) return false;
      const acode = parseInt(code.slice(1), 10);
      if (Number.isNaN(acode) || !acodes.has(acode)) return false;
      return true;
    });
  }, [busVar]);

  const aimagToSumCodes = useMemo(() => {
    if (!busVar?.values?.length) return new Map<string, string[]>();
    const acodeToName = new Map<number, string>();
    Object.entries(AIMAG_NAME_TO_ACODE).forEach(([name, acode]) => {
      acodeToName.set(acode, name);
    });
    const map = new Map<string, string[]>();
    busVar.values.forEach((rawCode) => {
      const code = String(rawCode ?? "").trim();
      if (!code || code.length !== 5) return;
      const rest = code.slice(1);
      const aimagAcode = Number.parseInt(rest.slice(0, 2), 10);
      if (Number.isNaN(aimagAcode)) return;
      const aimagName = acodeToName.get(aimagAcode);
      if (!aimagName) return;
      if (!map.has(aimagName)) map.set(aimagName, []);
      map.get(aimagName)!.push(code);
    });
    return map;
  }, [busVar]);

  const aimagNameToBusCode = useMemo(() => {
    if (!busVar?.values?.length || !busVar.valueTexts?.length) return new Map<string, string>();
    const map = new Map<string, string>();
    busVar.values.forEach((code, i) => {
      const c = String(code ?? "").trim();
      if (c.length !== 3 || c === "0") return;
      const label = String(busVar.valueTexts?.[i] ?? code ?? "").trim();
      const name = label.replace(/\s+аймаг\s*$/i, "").replace(/\s+хот\s*$/i, "").trim();
      if (name) map.set(name, c);
    });
    return map;
  }, [busVar]);

  const aimagOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: "all", label: "Бүгд" }];
    Object.keys(AIMAG_NAME_TO_ACODE).forEach((n) => opts.push({ value: n, label: n }));
    return opts;
  }, []);

  const yearOptions = useMemo(() => {
    return Array.from({ length: 56 }, (_, i) => ({
      value: String(i),
      label: String(1970 + i),
    }));
  }, []);


  useEffect(() => {
    if (!slicerPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      return;
    }
    const n = yearOptions.length;
    if (n <= 1) {
      setSlicerPlaying(false);
      return;
    }
    playIntervalRef.current = setInterval(() => {
      setYearSliderValue(([low, high]) => {
        if (high >= n - 1) {
          setSlicerPlaying(false);
          if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
          }
          return [low, n - 1];
        }
        return [low, high + 1];
      });
    }, 300);
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [slicerPlaying, yearOptions.length]);

  const busCodesForFetch = useMemo(() => {
    if (selectedAimag === "all") return aimagCodes;
    const sumCodes = aimagToSumCodes.get(selectedAimag);
    return sumCodes?.length ? sumCodes : aimagCodes;
  }, [selectedAimag, aimagCodes, aimagToSumCodes]);

  useEffect(() => {
    let cancelled = false;
    setMetadata(null);
    getPxMetadata(LIVESTOCK_API_URL)
      .then((meta) => {
        if (!cancelled) setMetadata(meta);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Уучлаарай алдаа гарлаа.");
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setMapRowsLoading(true);
    const yearCodes = Array.from({ length: 56 }, (_, i) => String(i));
    const body = {
      query: [
        { code: "Малын төрөл", selection: { filter: "item" as const, values: ["0"] } },
        { code: "Бүс", selection: { filter: "item" as const, values: MAP_BUS_CODES } },
        { code: "Он", selection: { filter: "item" as const, values: yearCodes } },
      ],
      response: { format: "json-stat2" as const },
    };
    getPxData(LIVESTOCK_API_URL, body)
      .then((dataset) => {
        if (cancelled || !dataset) return;
        const parsed = jsonStatToRows(dataset);
        setMapRows(parsed);
      })
      .catch((err) => {
        if (!cancelled) setMapRows([]);
      })
      .finally(() => {
        if (!cancelled) setMapRowsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCropsLoading(true);
    getPxMetadata(CROPS_API_URL)
      .then((cropsMeta) => {
        if (cancelled) return;
        const yv = findVar(cropsMeta, ["Он", "ОН"]);
        const yearCodes = yv?.values ?? ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
        const body = {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item" as const, values: CROPS_INDICATOR_CODES } },
            { code: "Бүс", selection: { filter: "item" as const, values: ["0"] } },
            { code: "Он", selection: { filter: "item" as const, values: yearCodes } },
          ],
          response: { format: "json-stat2" as const },
        };
        return getPxData(CROPS_API_URL, body);
      })
      .then((dataset) => {
        if (cancelled || !dataset) return;
        const parsed = jsonStatToRows(dataset);
        setCropsData(parsed);
      })
      .catch(() => {
        if (!cancelled) setCropsData([]);
      })
      .finally(() => {
        if (!cancelled) setCropsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const livestockBusCodes = useMemo(() => {
    if (selectedAimag === "all") return ["0"];
    const sumCodes = aimagToSumCodes.get(selectedAimag);
    return sumCodes?.length ? sumCodes : ["0"];
  }, [selectedAimag, aimagToSumCodes]);

  const totalLivestockBusCodes = useMemo(() => {
    if (selectedAimag === "all") return ["0"];
    const aimagCode = aimagNameToBusCode.get(selectedAimag);
    if (aimagCode) return [aimagCode];
    const sumCodes = aimagToSumCodes.get(selectedAimag);
    return sumCodes?.length ? sumCodes : ["0"];
  }, [selectedAimag, aimagNameToBusCode, aimagToSumCodes]);

  useEffect(() => {
    let cancelled = false;
    if (!metadata) return;
    setLivestockChartLoading(true);
    const yearCodes = Array.from({ length: 56 }, (_, i) => String(i));
    const body = {
      query: [
        { code: "Малын төрөл", selection: { filter: "item" as const, values: ["1", "2", "3", "4", "5"] } },
        { code: "Бүс", selection: { filter: "item" as const, values: livestockBusCodes } },
        { code: "Он", selection: { filter: "item" as const, values: yearCodes } },
      ],
      response: { format: "json-stat2" as const },
    };
    getPxData(LIVESTOCK_API_URL, body)
      .then((dataset) => {
        if (cancelled || !dataset) return;
        const parsed = jsonStatToRows(dataset);
        setLivestockChartData(parsed);
      })
      .catch(() => {
        if (!cancelled) setLivestockChartData([]);
      })
      .finally(() => {
        if (!cancelled) setLivestockChartLoading(false);
      });
    return () => { cancelled = true; };
  }, [metadata, livestockBusCodes]);

  useEffect(() => {
    let cancelled = false;
    if (!metadata) return;
    setTotalLivestockLoading(true);
    const yearCodes = Array.from({ length: 56 }, (_, i) => String(i));
    const body = {
      query: [
        { code: "Малын төрөл", selection: { filter: "item" as const, values: ["0"] } },
        { code: "Бүс", selection: { filter: "item" as const, values: totalLivestockBusCodes } },
        { code: "Он", selection: { filter: "item" as const, values: yearCodes } },
      ],
      response: { format: "json-stat2" as const },
    };
    getPxData(LIVESTOCK_API_URL, body)
      .then((dataset) => {
        if (cancelled || !dataset) return;
        const parsed = jsonStatToRows(dataset);
        setTotalLivestockData(parsed);
      })
      .catch(() => {
        if (!cancelled) setTotalLivestockData([]);
      })
      .finally(() => {
        if (!cancelled) setTotalLivestockLoading(false);
      });
    return () => { cancelled = true; };
  }, [metadata, totalLivestockBusCodes]);

  const busCode = busVar?.code ?? "Бүс";
  const busLabelKey = busCode;
  const busCodeKey = `${busCode}_code`;

  // API: Он code "0"=2025, "55"=1970 (reverse of our index). Our index 55 = 2025 → API code 0.
  const apiYearCodeForLastYear = String(55 - yearSliderValue[1]);
  const lastYearLabel = yearOptions[yearSliderValue[1]]?.label ?? "2025";

  const filteredAndAggregated = useMemo(() => {
    const empty = { byAimag: [] as { name: string; value: number }[], bySum: [] as { name: string; value: number; code?: string }[] };
    const yearCodeKey = "Он_code";
    if (!busCode || mapRows.length === 0) return empty;

    const byYear = mapRows.filter((r) => {
      const code = String((r as Record<string, unknown>)[yearCodeKey] ?? "").trim();
      const label = String((r as Record<string, unknown>).Он ?? "").trim();
      return code === apiYearCodeForLastYear || label === lastYearLabel;
    });
    const codeLen = selectedAimag === "all" ? 3 : 5;
    let rowsByCode = byYear.filter((r) => {
      const c = String((r as Record<string, unknown>)[busCodeKey] ?? "").trim();
      return c.length === codeLen;
    });

    if (selectedAimag !== "all") {
      const validSumCodes = aimagToSumCodes.get(selectedAimag);
      if (validSumCodes?.length) {
        const validSet = new Set(validSumCodes);
        rowsByCode = rowsByCode.filter((r) => {
          const c = String((r as Record<string, unknown>)[busCodeKey] ?? "").trim();
          return validSet.has(c);
        });
      }
      // Livestock API: sum-level rows have 5-digit codes; label is sum name directly (no "Аймаг - Сум")
      const bySum = rowsByCode
        .filter((r) => {
          const label = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
          return !isBusRegionTotal(label);
        })
        .reduce((acc, r) => {
          const full = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
          const dashIdx = full.search(/\s[-–]\s/);
          const name = dashIdx >= 0
            ? full.slice(dashIdx).replace(/^\s*[-–]\s*/, "").replace(/\s+сум\s*$/i, "").trim()
            : full;
          const value = Number((r as { value?: number }).value ?? 0) || 0;
          const code = String((r as Record<string, unknown>)[busCodeKey] ?? "").trim();
          const cur = acc.find((x) => x.name === name);
          if (cur) cur.value += value;
          else acc.push({ name, value, code });
          return acc;
        }, [] as { name: string; value: number; code?: string }[])
        .filter((x) => x.name && x.value > 0);
      return { ...empty, bySum };
    }

    const aimagOnlyRows = rowsByCode.filter((r) => !isBusSumLevel(String((r as Record<string, unknown>)[busLabelKey] ?? "")));
    const byAimag = aimagOnlyRows
      .filter((r) => !isBusRegionTotal(String((r as Record<string, unknown>)[busLabelKey] ?? "")))
      .reduce((acc, r) => {
        const label = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
        const name = label.replace(/\s+аймаг\s*$/i, "").replace(/\s+хот\s*$/i, "");
        const value = Number((r as { value?: number }).value ?? 0) || 0;
        const cur = acc.find((x) => x.name === name);
        if (cur) cur.value += value;
        else acc.push({ name, value });
        return acc;
      }, [] as { name: string; value: number }[])
      .filter((x) => x.name && x.value > 0);

    return { byAimag, bySum: [] };
  }, [mapRows, apiYearCodeForLastYear, lastYearLabel, selectedAimag, aimagToSumCodes, busCode, busLabelKey, busCodeKey]);

  const mapData: MapDataItem[] = useMemo(() => {
    if (selectedAimag !== "all") {
      return filteredAndAggregated.bySum.map((x) => ({
        name: x.name,
        value: x.value,
        code: x.code,
      }));
    }
    return filteredAndAggregated.byAimag.map((x) => ({
      name: x.name,
      value: x.value,
    }));
  }, [filteredAndAggregated]);

  const formatNumber = (v: number) =>
    Math.round(v)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const yearLoLabel = yearOptions[yearSliderValue[0]]?.label ?? "";
  const yearHiLabel = yearOptions[yearSliderValue[1]]?.label ?? "";

  return (
    <div className="socio-dash-root min-h-screen overflow-x-hidden bg-[var(--background)]">
      <SocioDashboardBackNav lng={lng} />
      <main className="mx-auto w-full min-w-0 max-w-[90rem] overflow-x-hidden px-3 pb-10 pt-4 sm:px-6 sm:pt-6">
          <header className="border-b border-slate-200/90 pb-4 dark:border-slate-700">
            <h1 className="text-head-title text-left">Хөдөө аж ахуй</h1>
          </header>

          <section className="mb-10 mt-8 w-full min-w-0">
            <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-700">
              <h2 className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400 sm:text-sm">
                ГАЗАР ТАРИАЛАН
              </h2>
            </div>
            {cropsLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Spin size="small" />
                <span className="text-sm text-slate-500">Уншиж байна...</span>
              </div>
            ) : cropsData.length > 0 ? (
              <div className="!grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-4 md:justify-items-stretch">
                {CROPS_CHART_ORDER.map((label) => {
                  const filtered = cropsData.filter(
                    (r) => String((r as Record<string, unknown>).Үзүүлэлт ?? "").trim() === label
                  );
                  const chartData = filtered.map((r) => ({
                    ...r,
                    value: (Number((r as { value?: number }).value ?? 0) || 0) / 1000,
                  }));
                  const sorted = [...chartData].sort((a, b) =>
                    String((a as Record<string, unknown>).Он ?? "").localeCompare(String((b as Record<string, unknown>).Он ?? ""))
                  );
                  const lastVal = Number((sorted[sorted.length - 1] as { value?: number })?.value ?? 0) || 0;
                  const prevVal = Number((sorted[sorted.length - 2] as { value?: number })?.value ?? 0) || 0;
                  const growthPct = prevVal ? (((lastVal - prevVal) / prevVal) * 100) : 0;
                  const growthStr = growthPct >= 0 ? `+${growthPct.toFixed(1)}%` : `${growthPct.toFixed(1)}%`;
                  if (chartData.length === 0) return null;
                  return (
                    <div key={label} className={LIVESTOCK_CHART_SHELL}>
                      <ChartTrend
                        data={chartData}
                        xKey="Он"
                        valueKey="value"
                        title={label}
                        tooltipUnit="мян.т"
                        valueFormatter={(v) => `${formatNumber(v)} мян.т`}
                        latestValueFormatter={(v) => `${formatNumber(v)} мян.т ${growthStr}`}
                        colorVariant="orange"
                        forceGradientArea
                        chartHeight={chartHeight}
                        enableSlicers={false}
                        showRangeSlider={false}
                        hideHeader={false}
                        showLatestValue={true}
                        yGridLineStyle="dashed"
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>

          <section className="mb-6 mt-12">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-[#001C44] dark:text-slate-100 sm:text-xl">
              Мал аж ахуй
            </h2>
          </section>

          <div className="flex min-h-[280px] w-full justify-center sm:min-h-[400px] md:min-h-[720px]">
            {mapRowsLoading && mapRows.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center sm:min-h-[400px] md:min-h-[720px]">
                <Spin size="large" />
              </div>
            ) : error && mapRows.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center text-red-500 sm:min-h-[400px] md:min-h-[720px]">
                {error}
              </div>
            ) : (
              <MongoliaChoroplethMap
                title=""
                subtextOnly
                showRegionLabels
                data={mapData}
                useSimpleAimagMap={selectedAimag === "all"}
                useSoumLevel={selectedAimag !== "all"}
                enableDrillDown={selectedAimag !== "all"}
                dataLabel="Малын тоо"
                valueSuffix=" Мянган толгой"
                height={mapHeight}
                layoutCenter={selectedAimag === "all" ? ["50%", "52%"] : undefined}
                activeAimagName={selectedAimag !== "all" ? selectedAimag : undefined}
                onAimagClick={(name) => {
                  const normalized = name.trim().replace(/\s+аймаг\s*$/i, "").replace(/\s+хот\s*$/i, "");
                  const match = aimagOptions.find(
                    (o) => o.value !== "all" && normalized.toLowerCase().startsWith(o.value.toLowerCase())
                  );
                  setSelectedAimag(match?.value ?? normalized);
                }}
                onResetAimag={() => setSelectedAimag("all")}
              />
            )}
          </div>

          <section className="mt-10">
            {totalLivestockLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Spin size="small" />
                <span className="text-sm text-slate-500">Уншиж байна...</span>
              </div>
            ) : totalLivestockData.length > 0 ? (
              (() => {
                let chartRows = totalLivestockData;
                if (totalLivestockBusCodes.length > 1) {
                  chartRows = totalLivestockData.filter((r) => {
                    const label = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
                    return !isBusRegionTotal(label);
                  });
                }
                if (totalLivestockBusCodes.length > 1) {
                  const sumByYear = new Map<string, { Он: string; Он_code: string; value: number }>();
                  chartRows.forEach((r) => {
                    const Он = String((r as Record<string, unknown>).Он ?? "").trim();
                    const Он_code = String((r as Record<string, unknown>).Он_code ?? "");
                    const val = Number((r as { value?: number }).value ?? 0) || 0;
                    const cur = sumByYear.get(Он);
                    if (cur) cur.value += val;
                    else sumByYear.set(Он, { Он, Он_code, value: val });
                  });
                  chartRows = Array.from(sumByYear.values()).map((x) => ({ ...x } as unknown as DataRow));
                }
                const [lowIdx, highIdx] = yearSliderValue;
                const rangeYears: [string, string] = [
                  yearOptions[lowIdx]?.label ?? "1970",
                  yearOptions[highIdx]?.label ?? "2025",
                ];
                const chartData = chartRows.filter((r) => {
                  const code = (r as Record<string, unknown>).Он_code;
                  const apiIdx = typeof code === "string" ? parseInt(code, 10) : typeof code === "number" ? code : NaN;
                  if (apiIdx >= 0 && apiIdx <= 55) {
                    const ourIdx = 55 - apiIdx;
                    return ourIdx >= lowIdx && ourIdx <= highIdx;
                  }
                  const label = String((r as Record<string, unknown>).Он ?? "").trim();
                  const yYear = parseInt(label, 10) || parseInt(String(label).match(/\d{4}/)?.[0] ?? "0", 10);
                  return yYear >= 1970 && yYear <= 2025 && yYear >= parseInt(rangeYears[0], 10) && yYear <= parseInt(rangeYears[1], 10);
                });
                const sorted = [...chartData].sort((a, b) =>
                  String((a as Record<string, unknown>).Он ?? "").localeCompare(String((b as Record<string, unknown>).Он ?? ""))
                );
                const lastVal = Number((sorted[sorted.length - 1] as { value?: number })?.value ?? 0) || 0;
                const prevVal = Number((sorted[sorted.length - 2] as { value?: number })?.value ?? 0) || 0;
                const growthPct = prevVal ? (((lastVal - prevVal) / prevVal) * 100) : 0;
                const growthStr = growthPct >= 0 ? `+${growthPct.toFixed(1)}%` : `${growthPct.toFixed(1)}%`;
                const chartTitle = selectedAimag === "all" ? "Нийт малын тоо" : selectedAimag;
                if (chartData.length === 0) return null;
                return (
                  <div className={LIVESTOCK_CHART_SHELL}>
                    <ChartTrend
                      data={chartData}
                      xKey="Он"
                      valueKey="value"
                      title={chartTitle}
                      tooltipUnit="мян.толгой"
                      valueFormatter={(v) => `${formatNumber(v)} мян.толгой`}
                      latestValueFormatter={(v) => `${formatNumber(v)} мян.толгой ${growthStr}`}
                      rangeYears={rangeYears}
                      forceGradientArea
                      chartHeight={largeChartHeight}
                      enableSlicers={false}
                      showRangeSlider={false}
                      hideHeader={false}
                      showLatestValue={true}
                      colorVariant="default"
                      widePlot
                      yGridLineStyle="dashed"
                    />
                  </div>
                );
              })()
            ) : null}
          </section>

          <section className="mt-4 max-w-[90rem] border-t border-slate-200/90 pt-6 dark:border-slate-700">
            <div className="flex min-h-9 flex-nowrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setSlicerPlaying((p) => !p)}
                title={slicerPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                aria-label={slicerPlaying ? "Зогсоох" : "Тоглуулах"}
                className="range-slider-play-btn"
              >
                {slicerPlaying ? (
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
                {yearLoLabel}
              </span>
              <div className="min-w-0 w-full flex-1">
                <RangeSlider
                  min={0}
                  max={Math.max(0, yearOptions.length - 1)}
                  value={yearSliderValue}
                  onChange={([low, high]) => {
                    setSlicerPlaying(false);
                    setYearSliderValue([low, high]);
                  }}
                  labels={yearOptions.map((o) => o.label)}
                  showLabels={false}
                  className="w-full"
                />
              </div>
              <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap text-right text-xs font-normal tabular-nums text-slate-700 dark:text-slate-200">
                {yearHiLabel}
              </span>
            </div>
          </section>

          <section className="mt-10">
            {livestockChartLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Spin size="small" />
                <span className="text-sm text-slate-500">Уншиж байна...</span>
              </div>
            ) : livestockChartData.length > 0 ? (
              <div className="!grid w-full min-w-0 grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-5">
                {LIVESTOCK_CHART_ORDER.map((label) => {
                  let byType = livestockChartData.filter(
                    (r) => String((r as Record<string, unknown>)["Малын төрөл"] ?? "").trim() === label
                  );
                  if (livestockBusCodes.length > 1) {
                    const sumByYear = new Map<string, { Он: string; Он_code: string; value: number }>();
                    byType.forEach((r) => {
                      const Он = String((r as Record<string, unknown>).Он ?? "").trim();
                      const Он_code = String((r as Record<string, unknown>).Он_code ?? "");
                      const val = Number((r as { value?: number }).value ?? 0) || 0;
                      const cur = sumByYear.get(Он);
                      if (cur) cur.value += val;
                      else sumByYear.set(Он, { Он, Он_code, value: val });
                    });
                    byType = Array.from(sumByYear.values()).map((x) => ({ ...x, "Малын төрөл": label } as unknown as DataRow));
                  }
                  const [lowIdx, highIdx] = yearSliderValue;
                  const rangeYears: [string, string] = [
                    yearOptions[lowIdx]?.label ?? "1970",
                    yearOptions[highIdx]?.label ?? "2025",
                  ];
                  const chartData = byType.filter((r) => {
                    const code = (r as Record<string, unknown>).Он_code;
                    const label = String((r as Record<string, unknown>).Он ?? "").trim();
                    const apiIdx = typeof code === "string" ? parseInt(code, 10) : typeof code === "number" ? code : NaN;
                    if (apiIdx >= 0 && apiIdx <= 55) {
                      const ourIdx = 55 - apiIdx;
                      return ourIdx >= lowIdx && ourIdx <= highIdx;
                    }
                    const yYear = parseInt(label, 10) || parseInt(String(label).match(/\d{4}/)?.[0] ?? "0", 10);
                    return yYear >= 1970 && yYear <= 2025 && yYear >= parseInt(rangeYears[0], 10) && yYear <= parseInt(rangeYears[1], 10);
                  });
                  const sorted = [...chartData].sort((a, b) =>
                    String((a as Record<string, unknown>).Он ?? "").localeCompare(String((b as Record<string, unknown>).Он ?? ""))
                  );
                  const lastVal = Number((sorted[sorted.length - 1] as { value?: number })?.value ?? 0) || 0;
                  const prevVal = Number((sorted[sorted.length - 2] as { value?: number })?.value ?? 0) || 0;
                  const growthPct = prevVal ? (((lastVal - prevVal) / prevVal) * 100) : 0;
                  const growthStr = growthPct >= 0 ? `+${growthPct.toFixed(1)}%` : `${growthPct.toFixed(1)}%`;
                  if (chartData.length === 0) return null;
                  return (
                    <div key={label} className={LIVESTOCK_CHART_SHELL}>
                      <ChartTrend
                        data={chartData}
                        xKey="Он"
                        valueKey="value"
                        title={label}
                        tooltipUnit="мян.толгой"
                        valueFormatter={(v) => `${formatNumber(v)} мян.толгой`}
                        latestValueFormatter={(v) => `${formatNumber(v)} мян.толгой ${growthStr}`}
                        rangeYears={rangeYears}
                        forceGradientArea
                        chartHeight={chartHeight}
                        enableSlicers={false}
                        showRangeSlider={false}
                        hideHeader={false}
                        showLatestValue={true}
                        yGridLineStyle="dashed"
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </section>
      </main>
    </div>
  );
}
