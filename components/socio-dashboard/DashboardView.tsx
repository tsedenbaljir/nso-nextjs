"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Checkbox, Select, Segmented, TreeSelect } from "antd";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { DashboardConfig, DataRow, JsonStatDataset, PxMetadata } from "@/lib/socio-dashboard/types";
import { BOP_TABLE_INDICATOR_VALUES, BOP_CHART_INDICATOR_VALUES, BOP_CHART_TOP_CODE, BOP_CHART_ROW_1, BOP_CHART_ROW_2, BOP_CHART_ROW_3, MONEY_SUPPLY_INDICATOR_VALUES, LOAN_INDICATOR_VALUES, LOAN_INDICATOR_LABELS, LOAN_SECTOR_VALUES, LOAN_CITIZENS_INDICATOR_VALUES, LOAN_CITIZENS_INDICATOR_LABELS, LOAN_IPOTEK_INDICATOR_VALUES, LOAN_IPOTEK_INDICATOR_LABELS, EXCHANGE_RATE_INDICATOR_VALUES, EXCHANGE_RATE_INDICATOR_LABELS } from "@/config/socio-dashboards";
import { getPxMetadata, getPxData, buildQuery, buildFullQuery } from "@/lib/socio-dashboard/px-api";
import { jsonStatToRows } from "@/lib/socio-dashboard/parse-json-stat";
import { buildBusTreeData } from "@/lib/socio-dashboard/bus-tree";
import { DashboardFilters } from "./DashboardFilters";
import { ChartTrend } from "./ChartTrend";
import { BirthsAndCBRChart } from "./BirthsAndCBRChart";
import { ChartBar } from "./ChartBar";
import { MongoliaChoroplethMap, type MapDataItem } from "./MongoliaChoroplethMap";
import { PopulationPyramidChart } from "./PopulationPyramidChart";
import { RangeSlider } from "./RangeSlider";

interface DashboardViewProps {
  config: DashboardConfig;
}

const barChartWithYearSlicer = (charts: DashboardViewProps["config"]["charts"]) =>
  charts?.find((c) => c.type === "bar" && c.yearSlicerDimension);

const CPI_LEVEL_LABELS: Record<string, string> = {
  улс: "Улс",
  нийслэл: "Нийслэл",
  аймаг: "Аймаг",
};

/** Бизнес регистр — API-ийн «Эдийн засгийн салбар» бүрэн нэр → харуулах гарчиг */
const BUSINESS_REGISTER_SECTOR_LABELS: Record<string, string> = {
  "Хөдөө аж ахуй, ойн аж ахуй, загас барилт, ан агнуур": "Хөдөө аж ахуй",
  "Ус хангамж, бохир ус зайлуулах систем, хог хаягдлын менежмент болон цэвэрлэх үйл ажиллагаа":
    "Ус хангамж; сувагжилтын систем, хог хаягдал зайлуулах болон хүрээлэн буй орчныг дахин сэргээх үйл ажиллагаа",
  "Бөөний болон жижиглэн худалдаа; машин, мотоциклийн засвар, үйлчилгээ": "Бөөний болон жижиглэн худалдаа",
  "Зочид буудал, байр, сууц болон нийтийн хоолны үйлчилгээ": "Зочид буудал, байр сууц, нийтийн хоол",
  "Санхүүгийн болон даатгалын үйл ажиллагаа": "Санхүү болон даатгал",
  "Мэргэжлийн, шинжлэх ухаан болон техникийн үйл ажиллагаа": "Мэргэжлийн, Ш/У болон техник",
  "Удирдлагын болон дэмжлэг үзүүлэх үйл ажиллагаа": "Удирдлагын болон дэмжлэг үзүүлэх",
  "Төрийн удирдлага, батлан хамгаалах үйл ажиллагаа, албан журмын нийгмийн хамгаалал": "Төрийн удирдлага, батлан хамгаалах",
  "Хүний эрүүл мэнд, нийгмийн халамжийн үйл ажиллагаа": "Хүний эрүүл мэнд, нийгмийн халамж",
  "Олон улсын байгууллага, суурин төлөөлөгчийн үйл ажиллагаа": "Олон улсын байгууллага",
};

/** Салбаруудыг харуулах дараалал (3 баганаар үргэлжлэнэ) */
const BUSINESS_REGISTER_SECTOR_ORDER: readonly string[] = [
  "Хөдөө аж ахуй",
  "Уул уурхай, олборлолт",
  "Боловсруулах үйлдвэрлэл",
  "Цахилгаан, хий, уур, агааржуулалт",
  "Ус хангамж; сувагжилтын систем, хог хаягдал зайлуулах болон хүрээлэн буй орчныг дахин сэргээх үйл ажиллагаа",
  "Барилга",
  "Бөөний болон жижиглэн худалдаа",
  "Тээвэр, агуулахын үйл ажиллагаа",
  "Зочид буудал, байр сууц, нийтийн хоол",
  "Мэдээлэл, холбоо",
  "Санхүү болон даатгал",
  "Төрийн удирдлага, батлан хамгаалах",
  "Боловсрол",
  "Хүний эрүүл мэнд, нийгмийн халамж",
  "Урлаг, үзвэр, тоглоом наадам",
  "Үйлчилгээний бусад үйл ажиллагаа",
  "Олон улсын байгууллага",
  "Үл хөдлөх хөрөнгийн үйл ажиллагаа",
  "Мэргэжлийн, Ш/У болон техник",
  "Удирдлагын болон дэмжлэг үзүүлэх",
];

function businessRegisterDisplayTitle(apiLabel: string): string {
  const raw = String(apiLabel ?? "").trim();
  if (BUSINESS_REGISTER_SECTOR_LABELS[raw]) return BUSINESS_REGISTER_SECTOR_LABELS[raw];
  if (/хөдөө\s*аж\s*ахуй/i.test(raw) && /ойн|загас/i.test(raw)) return "Хөдөө аж ахуй";
  if (/уул\s*уурхай|олборлолт/i.test(raw)) return "Уул уурхай, олборлолт";
  if (/боловсруулах\s*үйлдвэрлэл/i.test(raw)) return "Боловсруулах үйлдвэрлэл";
  if (/цахилгаан.*хий.*уур|агааржуулалт/i.test(raw)) return "Цахилгаан, хий, уур, агааржуулалт";
  if (/ус\s*хангамж|бохир\s*ус|хог\s*хаягдал|цэвэрлэх/i.test(raw))
    return "Ус хангамж; сувагжилтын систем, хог хаягдал зайлуулах болон хүрээлэн буй орчныг дахин сэргээх үйл ажиллагаа";
  if (/^барилга$/i.test(raw) || /барилгын\s*үйл ажиллагаа/i.test(raw)) return "Барилга";
  if (/тээвэр|агуулах/i.test(raw) && /үйл\s*ажиллагаа/i.test(raw)) return "Тээвэр, агуулахын үйл ажиллагаа";
  if (/мэдээлэл|холбоо/i.test(raw) && /үйлчилгээ|үйл ажиллагаа/i.test(raw)) return "Мэдээлэл, холбоо";
  if (/урлаг|үзвэр|тоглоом/i.test(raw)) return "Урлаг, үзвэр, тоглоом наадам";
  if (/үйлчилгээний\s*бусад/i.test(raw)) return "Үйлчилгээний бусад үйл ажиллагаа";
  if (/үл\s*хөдлөх\s*хөрөнгө/i.test(raw)) return "Үл хөдлөх хөрөнгийн үйл ажиллагаа";
  if (/боловсрол/i.test(raw) && !/суралцагч|сургууль/i.test(raw)) return "Боловсрол";
  return raw;
}

function sortBusinessRegisterSectors(sectors: { code: string; label: string }[]): { code: string; label: string }[] {
  const order = BUSINESS_REGISTER_SECTOR_ORDER;
  return [...sectors].sort((a, b) => {
    const ta = businessRegisterDisplayTitle(a.label);
    const tb = businessRegisterDisplayTitle(b.label);
    const ia = order.indexOf(ta);
    const ib = order.indexOf(tb);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      if (ia !== ib) return ia - ib;
    }
    return ta.localeCompare(tb, "mn");
  });
}

/** ДНБ улирал (2015-1, 2025-4) — жил, улирал дарааллаар эрэмбэлэх */
function sortGdpQuarterPeriods(periods: string[]): string[] {
  return [...periods].filter(Boolean).sort((a, b) => {
    const pa = a.split("-");
    const pb = b.split("-");
    const ya = parseInt(pa[0] ?? "0", 10);
    const yb = parseInt(pb[0] ?? "0", 10);
    if (ya !== yb) return ya - yb;
    return (parseInt(pa[1] ?? "0", 10) || 0) - (parseInt(pb[1] ?? "0", 10) || 0);
  });
}

/** NSO PX сарын код (0,1,…) — түүхэн хугацааны индекс */
function moneyFinanceIdxToCalendarYear(idx: number): number {
  if (idx === 0) return 2026;
  return 2026 - Math.ceil(idx / 12);
}

function calendarYearMonthFromMoneyFinanceIdx(idx: number): { year: number; month: number } {
  const year = idx === 0 ? 2026 : 2026 - Math.ceil(idx / 12);
  const month = idx === 0 ? 1 : idx % 12 === 0 ? 1 : 13 - (idx % 12);
  return { year, month };
}

/**
 * Мөнгө/зээл/ханш мөрнөөс календарийн жил авна.
 * Зарим API «Сар»-ыг индексээр, зарим нь YYYY-MM текстээр өгдөг; parseInt("2017-01")=2017 гэж индекс болгон алдахаас сэргийлнэ.
 */
function yearFromMoneyFinanceRow(r: DataRow): number | null {
  const codeRaw = r["Сар_code"];
  if (codeRaw != null && String(codeRaw).trim() !== "") {
    const n = typeof codeRaw === "number" ? codeRaw : parseInt(String(codeRaw), 10);
    if (!Number.isNaN(n) && n >= 0 && n < 600) {
      return moneyFinanceIdxToCalendarYear(n);
    }
  }
  const sar = r["Сар"];
  if (sar == null || sar === "") return null;
  const s = String(sar).trim();
  const iso = /^(\d{4})-(\d{2})/.exec(s);
  if (iso) return parseInt(iso[1]!, 10);
  const yonly = /^(\d{4})$/.exec(s);
  if (yonly) return parseInt(yonly[1]!, 10);
  const asIdx = parseInt(s, 10);
  if (!Number.isNaN(asIdx) && asIdx >= 0 && asIdx < 600) {
    return moneyFinanceIdxToCalendarYear(asIdx);
  }
  return null;
}

/** Хүснэгтийн «сар» шүүлтүүрт — хамгийн сүүлийн аж наблюдени */
function latestYearMonthFromMoneyFinanceRows(rows: DataRow[]): { year: number; month: number } | null {
  let best: { year: number; month: number } | null = null;
  const consider = (y: number, m: number) => {
    if (!Number.isFinite(y) || m < 1 || m > 12) return;
    if (!best || y > best.year || (y === best.year && m > best.month)) best = { year: y, month: m };
  };
  for (const r of rows) {
    const codeRaw = r["Сар_code"];
    if (codeRaw != null && String(codeRaw).trim() !== "") {
      const n = typeof codeRaw === "number" ? codeRaw : parseInt(String(codeRaw), 10);
      if (!Number.isNaN(n) && n >= 0 && n < 600) {
        const ym = calendarYearMonthFromMoneyFinanceIdx(n);
        consider(ym.year, ym.month);
        continue;
      }
    }
    const sar = String(r["Сар"] ?? "").trim();
    const iso = /^(\d{4})-(\d{2})/.exec(sar);
    if (iso) consider(parseInt(iso[1]!, 10), parseInt(iso[2]!, 10));
  }
  return best;
}

export function DashboardView({ config }: DashboardViewProps) {
  const { apiUrl: configApiUrl, apiUrlByLevel, apiUrlByLevelMonthlyChange, housingChangeUrl, charts = [], mapApiUrl, mapDimension, mapLevel, showMapPlaceholder, birthRateMapApiUrl, birthRateMapDimension, deathRateMapApiUrl, deathRateMapDimension, lifeExpectancyMapApiUrl, lifeExpectancyMapDimension, lifeExpectancyNationalApiUrl } = config;
  const hasLevels = !!apiUrlByLevel && Object.keys(apiUrlByLevel).length > 0;
  const levelKeys = useMemo(() => (apiUrlByLevel ? Object.keys(apiUrlByLevel) : []), [apiUrlByLevel]);
  const [selectedLevel, setSelectedLevel] = useState(
    config.id === "cpi" && levelKeys.includes("улс") ? "улс" : (levelKeys[0] ?? "")
  );
  const [cpiChangeMode, setCpiChangeMode] = useState<"yearly" | "monthly">("yearly");
  const [housingIndexMode, setHousingIndexMode] = useState<"index" | "change">("change");
  const [housingIndicatorMode, setHousingIndicatorMode] = useState<"0" | "1">("0");
  const [housingIndexMonthRange, setHousingIndexMonthRange] = useState<[string, string] | null>(null);
  const [housingIndexRangePlaying, setHousingIndexRangePlaying] = useState(false);
  const [ppiIndicatorMode, setPpiIndicatorMode] = useState<"1" | "3">("3");
  const [ppiRangePeriod, setPpiRangePeriod] = useState<[string, string] | null>(null);
  const [ppiRangePlaying, setPpiRangePlaying] = useState(false);
  const levelUrlMap =
    config.id === "cpi" && cpiChangeMode === "monthly" && apiUrlByLevelMonthlyChange && Object.keys(apiUrlByLevelMonthlyChange).length > 0
      ? apiUrlByLevelMonthlyChange
      : apiUrlByLevel;
  const apiUrl =
    config.id === "housing-prices" && housingChangeUrl
      ? housingIndexMode === "change"
        ? housingChangeUrl
        : configApiUrl
      : hasLevels
        ? (levelKeys.includes(selectedLevel) ? levelUrlMap?.[selectedLevel] : levelUrlMap?.[levelKeys[0]])
        : configApiUrl;

  const getChartApiUrl = useCallback(
    (chart: (typeof charts)[0]) => {
      if (config.id === "cpi" && chart.chartApiUrlByCpiMode) {
        // Түвшин (Улс/Нийслэл/Аймаг) сонгосноор trend график тухайн түвшний API ашиглана (жил: 012V1/010V1/07V8, сар: 003V4/009V1/07V7)
        const level = selectedLevel && levelKeys.includes(selectedLevel) ? selectedLevel : levelKeys[0];
        const urlMap =
          cpiChangeMode === "monthly" && apiUrlByLevelMonthlyChange && Object.keys(apiUrlByLevelMonthlyChange).length > 0
            ? apiUrlByLevelMonthlyChange
            : apiUrlByLevel;
        const levelUrl = level ? urlMap?.[level] : undefined;
        if (levelUrl) return levelUrl;
        return chart.chartApiUrlByCpiMode[cpiChangeMode];
      }
      return chart.chartApiUrl;
    },
    [config.id, cpiChangeMode, charts, selectedLevel, levelKeys, apiUrlByLevel, apiUrlByLevelMonthlyChange]
  );

  const yearSlicerChart = barChartWithYearSlicer(charts);
  const [metadata, setMetadata] = useState<PxMetadata | null>(null);
  const [dataset, setDataset] = useState<JsonStatDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [barChartYear, setBarChartYear] = useState<Record<string, string>>({});
  const [mapMetadata, setMapMetadata] = useState<PxMetadata | null>(null);
  const [mapDataset, setMapDataset] = useState<JsonStatDataset | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [metadataByChartId, setMetadataByChartId] = useState<Record<string, PxMetadata>>({});
  const [chartDataByChartId, setChartDataByChartId] = useState<Record<string, DataRow[]>>({});
  const [trendChartSeriesSelection, setTrendChartSeriesSelection] = useState<Record<string, string[]>>({});
  const [sharedRangeYears, setSharedRangeYears] = useState<[string, string] | null>(["2010", "2024"]);
  const [educationRangeYears, setEducationRangeYears] = useState<[string, string]>(["2010", "2024"]);
  const [educationPlaying, setEducationPlaying] = useState(false);
  const educationYearsRef = useRef<string[]>([]);
  const educationRangeRef = useRef<{ n: number; range: [number, number] }>({ n: 0, range: [0, 0] });
  const [householdMetricMode, setHouseholdMetricMode] = useState<"value" | "growth">("value");
  const [netGrowthMetricMode, setNetGrowthMetricMode] = useState<"value" | "growth">("value");
  const [budgetRange, setBudgetRange] = useState<[number, number] | null>(null);
  const [budgetMonthlyRange, setBudgetMonthlyRange] = useState<[number, number] | null>(null);
  const [budgetMonthlyPlaying, setBudgetMonthlyPlaying] = useState(false);
  const budgetMonthlyNRef = useRef(0);
  const [budgetYearlyRange, setBudgetYearlyRange] = useState<[number, number] | null>(null);
  const [budgetYearlyPlaying, setBudgetYearlyPlaying] = useState(false);
  const budgetYearlyPlayStartedRef = useRef(false);
  const [budgetMonthFilter, setBudgetMonthFilter] = useState<string>("01");
  const [budgetPeriodTab, setBudgetPeriodTab] = useState<"Сар" | "Жил">("Жил");
  const [tradePeriodTab, setTradePeriodTab] = useState<"Сар" | "Жил">("Жил");
  const [tradeYearlyRange, setTradeYearlyRange] = useState<[number, number] | null>(null);
  const [tradeRange, setTradeRange] = useState<[number, number] | null>(null);
  const [tradeMonthlyRange, setTradeMonthlyRange] = useState<[number, number] | null>(null);
  const [tradeMonthFilter, setTradeMonthFilter] = useState<string>("01");
  const [bopMonthFilter, setBopMonthFilter] = useState<string>("12");
  const [moneyFinanceMonthFilter, setMoneyFinanceMonthFilter] = useState<string>("12");
  const [moneyFinanceRange, setMoneyFinanceRange] = useState<[number, number]>([0, 0]);
  const [loanViewMode, setLoanViewMode] = useState<"table" | "chart" | "rate">("table");
  const [loanMetricMode, setLoanMetricMode] = useState<"value" | "growth">("value");
  const [loanIndicatorFilter, setLoanIndicatorFilter] = useState<string>("0");
  const [loanCitizensIndicatorFilter, setLoanCitizensIndicatorFilter] = useState<string>("4");
  const [loanCitizensMetricMode, setLoanCitizensMetricMode] = useState<"value" | "growth">("value");
  const [loanIpotekMetricMode, setLoanIpotekMetricMode] = useState<"value" | "growth">("value");
  const [loanChartIsPlaying, setLoanChartIsPlaying] = useState(false);
  const loanChartPlayRef = useRef<{ n: number; range: [number, number] }>({ n: 0, range: [0, 0] });
  const [bopViewMode, setBopViewMode] = useState<"table" | "chart">("table");
  const [bopChartRange, setBopChartRange] = useState<[number, number]>([0, 0]);
  const [bopChartIsPlaying, setBopChartIsPlaying] = useState(false);
  const bopChartPlayRef = useRef<{ n: number; range: [number, number] }>({ n: 0, range: [0, 0] });
  const [tradeProductIndicator, setTradeProductIndicator] = useState<string>("0");
  const [tradeProductFilter, setTradeProductFilter] = useState<string>("31");
  const [tradeImportProductIndicator, setTradeImportProductIndicator] = useState<string>("0");
  const [tradeImportProductFilter, setTradeImportProductFilter] = useState<string>("45");
  const [budgetIsPlaying, setBudgetIsPlaying] = useState(false);
  const [tradeIsPlaying, setTradeIsPlaying] = useState(false);
  const [tradeMonthlyIsPlaying, setTradeMonthlyIsPlaying] = useState(false);
  const [tradeYearlyIsPlaying, setTradeYearlyIsPlaying] = useState(false);
  const tradeYearlyPlayRef = useRef<{ n: number; defaultStart: number }>({ n: 0, defaultStart: 0 });
  const [commodityPlaying, setCommodityPlaying] = useState(false);
  const commodityPlayRef = useRef<{ reversedValues: string[]; n: number }>({ reversedValues: [], n: 0 });
  const tradeYearlyYearRangeRef = useRef<{ start: string; end: string }>({ start: "2021", end: String(new Date().getFullYear()) });
  const tradeMonthlyBalanceNRef = useRef(0);
  const tradeCumulativeNRef = useRef(0);
  const [salaryMetricMode, setSalaryMetricMode] = useState<"value" | "growth">("value");
  const [cpiRangeYears, setCpiRangeYears] = useState<[string, string] | null>(null);
  const [cpiRangePlaying, setCpiRangePlaying] = useState(false);
  const [unemploymentRange, setUnemploymentRange] = useState<[string, string] | null>(null);
  const [unemploymentRangePlaying, setUnemploymentRangePlaying] = useState(false);
  const [householdRangeYears, setHouseholdRangeYears] = useState<[string, string] | null>(null);
  const [householdRangePlaying, setHouseholdRangePlaying] = useState(false);
  const [salaryRangeYears, setSalaryRangeYears] = useState<[string, string] | null>(null);
  /** Өмчийн хэлбэрээр / Ажил мэргэжлийн ангилалаар chart-уудын filter — default Улсын дундаж */
  const [wagesOwnershipFilter, setWagesOwnershipFilter] = useState<string>("0");
  const [wagesOccupationFilter, setWagesOccupationFilter] = useState<string>("0");
  const [gdpRangeYears, setGdpRangeYears] = useState<[string, string] | null>(null);
  const [gdpQuarterRangeYears, setGdpQuarterRangeYears] = useState<[string, string] | null>(null);
  const [gdpQuarterPlaying, setGdpQuarterPlaying] = useState(false);
  const [gdpIndicatorCode, setGdpIndicatorCode] = useState<string>(config.gdpIndicatorFilter?.defaultCode ?? "0");
  /** Нэг ажиллагчид ногдох ДНБ — эдийн засгийн салбар шүүлт */
  const [gdpPerWorkerSectorCode, setGdpPerWorkerSectorCode] = useState<string>("all");
  /** Нэг хүнд ногдох ДНБ ам.доллар — ДНБ шүүлт (0=мян.төг, 1=ам.доллар) */
  const [gdpPerCapitaUsdGdpCode, setGdpPerCapitaUsdGdpCode] = useState<string>("1");
  /** Map дээрх оноор шүүлт (null = bar chart эсвэл сүүлийн он) */
  const [selectedMapYearLocal, setSelectedMapYearLocal] = useState<string | null>(null);
  /** Төрөлтийн ерөнхий коэффициентийн газрын зураг */
  const [birthRateMapMetadata, setBirthRateMapMetadata] = useState<PxMetadata | null>(null);
  const [birthRateMapDataset, setBirthRateMapDataset] = useState<JsonStatDataset | null>(null);
  const [birthRateMapYear, setBirthRateMapYear] = useState<string>("");
  const [birthRateMapLoading, setBirthRateMapLoading] = useState(false);
  /** Нас баралтын ерөнхий коэффициентийн газрын зураг */
  const [deathRateMapMetadata, setDeathRateMapMetadata] = useState<PxMetadata | null>(null);
  const [deathRateMapDataset, setDeathRateMapDataset] = useState<JsonStatDataset | null>(null);
  const [deathRateMapYear, setDeathRateMapYear] = useState<string>("");
  const [deathRateMapLoading, setDeathRateMapLoading] = useState(false);
  /** Дундаж наслалтын газрын зураг */
  const [lifeExpectancyMapMetadata, setLifeExpectancyMapMetadata] = useState<PxMetadata | null>(null);
  const [lifeExpectancyMapDataset, setLifeExpectancyMapDataset] = useState<JsonStatDataset | null>(null);
  const [lifeExpectancyMapYear, setLifeExpectancyMapYear] = useState<string>("");
  const [lifeExpectancyMapLoading, setLifeExpectancyMapLoading] = useState(false);
  /** Улсын дундаж наслалт (039V1 API-аас) */
  const [lifeExpectancyNationalMetadata, setLifeExpectancyNationalMetadata] = useState<PxMetadata | null>(null);
  const [lifeExpectancyNationalDataset, setLifeExpectancyNationalDataset] = useState<JsonStatDataset | null>(null);

  const selectedBusCodes = useMemo(() => {
    if (config.id === "cpi" && selectedLevel === "нийслэл") return ["5"];
    const bus = selections["Бүс"];
    return bus?.length ? bus : [];
  }, [selections, config.id, selectedLevel]);

  const availableCpiPeriods = useMemo(() => {
    if (config.id !== "cpi") return [] as string[];
    const rows = chartDataByChartId["cpi-trend"] ?? [];
    const periods = [...new Set(rows.map((r: DataRow) => String(r["Сар"] ?? r["Сар_code"] ?? "")))].filter(Boolean).sort();
    return periods;
  }, [config.id, chartDataByChartId]);

  const cpiRangeStartPeriod = "2024-01";

  useEffect(() => {
    if (config.id !== "cpi" || availableCpiPeriods.length < 1) return;
    setCpiRangeYears((prev) => {
      if (prev != null) return prev;
      const last = availableCpiPeriods[availableCpiPeriods.length - 1] ?? "";
      const startIdx = availableCpiPeriods.findIndex((p) => p.slice(0, 4) >= "2024");
      const start = startIdx >= 0 ? availableCpiPeriods[startIdx]! : availableCpiPeriods[0] ?? "";
      return [start, last];
    });
  }, [config.id, availableCpiPeriods]);

  useEffect(() => {
    if (!cpiRangePlaying || config.id !== "cpi") return;
    const periods = availableCpiPeriods;
    if (periods.length < 2) return;
    const interval = setInterval(() => {
      setCpiRangeYears((prev) => {
        const start = prev?.[0] ?? periods[0]!;
        const end = prev?.[1] ?? periods[periods.length - 1]!;
        const i0 = Math.max(0, periods.indexOf(start));
        const i1 = Math.max(i0, periods.indexOf(end));
        if (i1 >= periods.length - 1) {
          queueMicrotask(() => setCpiRangePlaying(false));
          return prev ?? [periods[0]!, periods[periods.length - 1]!];
        }
        const windowLen = Math.max(2, i1 - i0 + 1);
        const ni1 = Math.min(periods.length - 1, i1 + 1);
        const ni0 = Math.max(0, ni1 - windowLen + 1);
        return [periods[ni0]!, periods[ni1]!];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [cpiRangePlaying, config.id, availableCpiPeriods]);

  // Household: available periods
  const availableHouseholdPeriods = useMemo(() => {
    if (config.id !== "household-survey") return [];
    const rows = chartDataByChartId["household-income-main"] ?? [];
    const periods = [...new Set(rows.map((r: DataRow) => String(r["Улирал"] ?? r["Улирал_code"] ?? "")))].filter(Boolean);
    return sortGdpQuarterPeriods(periods);
  }, [config.id, chartDataByChartId]);

  useEffect(() => {
    if (config.id !== "household-survey" || availableHouseholdPeriods.length < 1) return;
    setHouseholdRangeYears((prev) => {
      if (prev != null) return prev;
      const last = availableHouseholdPeriods[availableHouseholdPeriods.length - 1];
      const start = availableHouseholdPeriods.includes("2020-1") ? "2020-1" : availableHouseholdPeriods[0];
      return [start, last];
    });
  }, [config.id, availableHouseholdPeriods]);

  useEffect(() => {
    if (!householdRangePlaying || config.id !== "household-survey") return;
    const periods = availableHouseholdPeriods;
    if (periods.length < 2) return;
    const interval = setInterval(() => {
      setHouseholdRangeYears((prev) => {
        const start = prev?.[0] ?? periods[0]!;
        const end = prev?.[1] ?? periods[periods.length - 1]!;
        const i0 = Math.max(0, periods.indexOf(start));
        const i1 = Math.max(i0, periods.indexOf(end));
        if (i1 >= periods.length - 1) {
          queueMicrotask(() => setHouseholdRangePlaying(false));
          return prev ?? [periods[0]!, periods[periods.length - 1]!];
        }
        const windowLen = Math.max(2, i1 - i0 + 1);
        const ni1 = Math.min(periods.length - 1, i1 + 1);
        const ni0 = Math.max(0, ni1 - windowLen + 1);
        return [periods[ni0]!, periods[ni1]!];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [householdRangePlaying, config.id, availableHouseholdPeriods]);

  // Average-salary: available periods
  const availableSalaryPeriods = useMemo(() => {
    if (config.id !== "average-salary") return [];
    const rows = chartDataByChartId["wages-region-area"] ?? [];
    const periods = [...new Set(rows.map((r: DataRow) => String(r["Улирал"] ?? r["Улирал_code"] ?? "")))].filter(Boolean).sort();
    return periods;
  }, [config.id, chartDataByChartId]);

  useEffect(() => {
    if (config.id !== "average-salary" || availableSalaryPeriods.length < 1) return;
    setSalaryRangeYears((prev) => {
      if (prev != null) return prev;
      const last = availableSalaryPeriods[availableSalaryPeriods.length - 1];
      const start = availableSalaryPeriods.includes("2016-1") ? "2016-1" : availableSalaryPeriods[0];
      return [start, last];
    });
  }, [config.id, availableSalaryPeriods]);

  // Budget cumulative chart play animation
  const budgetPlayMaxRef = useRef(0);
  useEffect(() => {
    if (!budgetIsPlaying) return;
    const interval = setInterval(() => {
      setBudgetRange((prev) => {
        if (!prev) return [0, 1];
        const [start, end] = prev;
        const maxEnd = budgetPlayMaxRef.current;
        if (end >= maxEnd - 1) {
          setBudgetIsPlaying(false);
          return [start, maxEnd - 1];
        }
        return [start, end + 1];
      });
    }, 400);
    return () => clearInterval(interval);
  }, [budgetIsPlaying]);

  // Улсын төсөв Жил tab: play — 2000-аас эхлэн жил нэмж тоглуулах
  useEffect(() => {
    if (!budgetYearlyPlaying) {
      budgetYearlyPlayStartedRef.current = false;
      return;
    }
    if (config.id !== "state-budget") return;
    const yearlyMeta = metadataByChartId["budget-balance-yearly"];
    const onVar = yearlyMeta?.variables?.find((v: { code: string }) => v.code === "Он");
    if (!onVar?.values?.length || !onVar?.valueTexts?.length) return;
    const n = onVar.values.length;
    let idx2000 = 0;
    for (let i = 0; i < n; i++) {
      const label = String(onVar.valueTexts?.[i] ?? "").replace(/\D/g, "").slice(0, 4);
      if (label.length === 4 && parseInt(label, 10) >= 2000) {
        idx2000 = i;
        break;
      }
    }
    const y0 = Number(String(onVar.valueTexts?.[0] ?? "").replace(/\D/g, "").slice(0, 4)) || 0;
    const yLast = Number(String(onVar.valueTexts?.[n - 1] ?? "").replace(/\D/g, "").slice(0, 4)) || 0;
    const oldestFirst = y0 < yLast;
    const codes = onVar.values as string[];
    if (!budgetYearlyPlayStartedRef.current) {
      budgetYearlyPlayStartedRef.current = true;
      setBudgetYearlyRange([idx2000, idx2000]);
      setSelections((s) => ({ ...s, Он: codes.slice(idx2000, idx2000 + 1).map(String) }));
    }
    const interval = setInterval(() => {
      setBudgetYearlyRange((prev) => {
        const [low, high] = prev ?? [idx2000, idx2000];
        if (oldestFirst) {
          if (high >= n - 1) {
            setBudgetYearlyPlaying(false);
            setSelections((s) => ({ ...s, Он: codes.slice(idx2000, n).map(String) }));
            return [idx2000, n - 1];
          }
          const nextHigh = high + 1;
          setSelections((s) => ({ ...s, Он: codes.slice(idx2000, nextHigh + 1).map(String) }));
          return [idx2000, nextHigh];
        }
        if (low <= 0) {
          setBudgetYearlyPlaying(false);
          setSelections((s) => ({ ...s, Он: codes.slice(0, idx2000 + 1).map(String) }));
          return [0, idx2000];
        }
        const nextLow = low - 1;
        setSelections((s) => ({ ...s, Он: codes.slice(nextLow, idx2000 + 1).map(String) }));
        return [nextLow, idx2000];
      });
    }, 400);
    return () => clearInterval(interval);
  }, [budgetYearlyPlaying, config.id, metadataByChartId]);

  useEffect(() => {
    setBudgetMonthlyPlaying(false);
  }, [budgetPeriodTab]);

  useEffect(() => {
    if (!budgetMonthlyPlaying || config.id !== "state-budget") return;
    const max = budgetMonthlyNRef.current;
    if (max < 2) return;
    const interval = setInterval(() => {
      setBudgetMonthlyRange((prev) => {
        const [a, b] = prev ?? [0, max - 1];
        if (b >= max - 1) {
          queueMicrotask(() => setBudgetMonthlyPlaying(false));
          return prev ?? [0, max - 1];
        }
        const windowLen = Math.max(4, b - a + 1);
        const nb = Math.min(max - 1, b + 1);
        const na = Math.max(0, nb - windowLen + 1);
        return [na, nb];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [budgetMonthlyPlaying, config.id]);

  // Гадаад худалдаа Жил: play — эхлэх оноос сүүлийн жил хүртэл өргөж тоглуулах
  useEffect(() => {
    if (!tradeYearlyIsPlaying || config.id !== "foreign-trade") return;
    const { n, defaultStart } = tradeYearlyPlayRef.current;
    if (n <= 0) return;
    const interval = setInterval(() => {
      setTradeYearlyRange((prev) => {
        const [a, b] = prev ?? [defaultStart, n - 1];
        if (b >= n - 1) {
          setTradeYearlyIsPlaying(false);
          return [a, n - 1];
        }
        return [a, b + 1];
      });
    }, 400);
    return () => clearInterval(interval);
  }, [tradeYearlyIsPlaying, config.id]);

  useEffect(() => {
    setTradeMonthlyIsPlaying(false);
    setTradeIsPlaying(false);
    setTradeYearlyIsPlaying(false);
  }, [tradePeriodTab]);

  useEffect(() => {
    if (!tradeMonthlyIsPlaying || config.id !== "foreign-trade") return;
    const max = tradeMonthlyBalanceNRef.current;
    if (max < 2) return;
    const interval = setInterval(() => {
      setTradeMonthlyRange((prev) => {
        const [a, b] = prev ?? [0, max - 1];
        if (b >= max - 1) {
          queueMicrotask(() => setTradeMonthlyIsPlaying(false));
          return prev ?? [0, max - 1];
        }
        const windowLen = Math.max(4, b - a + 1);
        const nb = Math.min(max - 1, b + 1);
        const na = Math.max(0, nb - windowLen + 1);
        return [na, nb];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [tradeMonthlyIsPlaying, config.id]);

  useEffect(() => {
    if (!tradeIsPlaying || config.id !== "foreign-trade") return;
    const max = tradeCumulativeNRef.current;
    if (max < 2) return;
    const interval = setInterval(() => {
      setTradeRange((prev) => {
        const [a, b] = prev ?? [0, max - 1];
        if (b >= max - 1) {
          queueMicrotask(() => setTradeIsPlaying(false));
          return prev ?? [0, max - 1];
        }
        const windowLen = Math.max(4, b - a + 1);
        const nb = Math.min(max - 1, b + 1);
        const na = Math.max(0, nb - windowLen + 1);
        return [na, nb];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [tradeIsPlaying, config.id]);

  useEffect(() => {
    if (!bopChartIsPlaying) return;
    const interval = setInterval(() => {
      const { n, range } = bopChartPlayRef.current;
      const [a, b] = range;
      if (n <= 1 || b >= n - 1) {
        setBopChartIsPlaying(false);
        return;
      }
      const nextRange: [number, number] = [a, Math.min(b + 1, n - 1)];
      bopChartPlayRef.current.range = nextRange;
      setBopChartRange(nextRange);
    }, 600);
    return () => clearInterval(interval);
  }, [bopChartIsPlaying]);

  useEffect(() => {
    if (!loanChartIsPlaying) return;
    const interval = setInterval(() => {
      const { n, range } = loanChartPlayRef.current;
      const [a, b] = range;
      if (n <= 1 || b >= n - 1) {
        setLoanChartIsPlaying(false);
        return;
      }
      const nextRange: [number, number] = [a, Math.min(b + 1, n - 1)];
      loanChartPlayRef.current.range = nextRange;
      setMoneyFinanceRange(nextRange);
    }, 600);
    return () => clearInterval(interval);
  }, [loanChartIsPlaying]);

  useEffect(() => {
    if (!educationPlaying) return;
    const { n } = educationRangeRef.current;
    if (n < 2) return;
    const interval = setInterval(() => {
      const [a, b] = educationRangeRef.current.range;
      if (b >= educationRangeRef.current.n - 1) {
        setEducationPlaying(false);
        return;
      }
      const years = educationYearsRef.current;
      const nextEnd = Math.min(b + 1, educationRangeRef.current.n - 1);
      educationRangeRef.current.range = [a, nextEnd];
      setEducationRangeYears([years[a]!, years[nextEnd]!]);
    }, 800);
    return () => clearInterval(interval);
  }, [educationPlaying]);

  // Гол нэрийн барааны үнэ — 7 хоногийн үнэний range slider play (хугацааг эртнээс сүүл рүү тоглуулах)
  useEffect(() => {
    if (!commodityPlaying || config.id !== "cpi-commodity-prices") return;
    const interval = setInterval(() => {
      const { reversedValues, n } = commodityPlayRef.current;
      if (!reversedValues.length || n < 1) return;
      setSelections((prev) => {
        const selected = prev["Хугацаа"] ?? [];
        if (!selected.length) return prev;
        const lastCode = selected[selected.length - 1];
        const highIdx = reversedValues.indexOf(lastCode);
        if (highIdx < 0) return prev;
        if (highIdx >= n - 1) {
          queueMicrotask(() => setCommodityPlaying(false));
          return { ...prev, Хугацаа: reversedValues.map(String) };
        }
        return { ...prev, Хугацаа: reversedValues.slice(0, highIdx + 2).map(String) };
      });
    }, 150);
    return () => clearInterval(interval);
  }, [commodityPlaying, config.id]);

  const gdpQuarterSliderPeriods = useMemo(() => {
    if (config.id !== "gdp") return [] as string[];
    const firstQId = charts.find((c) => c.id.startsWith("gdp-quarter-"))?.id;
    if (!firstQId) return [];
    const rows = chartDataByChartId[firstQId] ?? [];
    const raw = [...new Set(rows.map((r) => String(r["ОН"] ?? "")))].filter(Boolean);
    return sortGdpQuarterPeriods(raw);
  }, [config.id, charts, chartDataByChartId]);

  useEffect(() => {
    if (!gdpQuarterPlaying || config.id !== "gdp") return;
    const periods = gdpQuarterSliderPeriods;
    if (periods.length < 2) return;
    const interval = setInterval(() => {
      setGdpQuarterRangeYears((prev) => {
        const start = prev?.[0] ?? periods[0]!;
        const end = prev?.[1] ?? periods[periods.length - 1]!;
        const i0 = Math.max(0, periods.indexOf(start));
        const i1 = Math.max(i0, periods.indexOf(end));
        if (i1 >= periods.length - 1) {
          queueMicrotask(() => setGdpQuarterPlaying(false));
          return prev ?? [periods[0]!, periods[periods.length - 1]!];
        }
        const windowLen = Math.max(2, i1 - i0 + 1);
        const ni1 = Math.min(periods.length - 1, i1 + 1);
        const ni0 = Math.max(0, ni1 - windowLen + 1);
        return [periods[ni0]!, periods[ni1]!];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [gdpQuarterPlaying, config.id, gdpQuarterSliderPeriods]);

  const loadData = useCallback(async () => {
    if (config.id === "society-education") {
      const chartApiCharts = charts.filter((c) => getChartApiUrl(c));
      if (chartApiCharts.length === 0) return;
      const codeMap = config.educationAngilalCodeMap ?? {};
      const selectedAngilal = selections["Ангилал"];
      const schoolsCodes = ["0", "1", "5", "8"];
      const angilalCodes = selectedAngilal?.length
        ? selectedAngilal.filter((c) => schoolsCodes.includes(c))
        : schoolsCodes;
      setLoading(true);
      setError(null);
      try {
        const nextChartData: Record<string, DataRow[]> = {};
        await Promise.all(
          chartApiCharts.map(async (chart) => {
            const chartUrl = getChartApiUrl(chart);
            const fixedQuery = chart.chartFixedQuery;
            if (!chartUrl || !fixedQuery) return;
            const mappedCodes =
              chart.id === "education-schools"
                ? angilalCodes
                : chart.id === "education-graduates"
                  ? ["2", "4", "6"]
                  : codeMap[chart.id]
                    ? angilalCodes.map((c) => codeMap[chart.id]![c] ?? c).filter(Boolean)
                    : angilalCodes;
            if (mappedCodes.length === 0) {
              nextChartData[chart.id] = [];
              return;
            }
            const query = {
              ...fixedQuery,
              query: fixedQuery.query?.map((q) =>
                q.code === "Ангилал" ? { ...q, selection: { ...q.selection, values: mappedCodes } } : q
              ) ?? fixedQuery.query,
            };
            try {
              const chartDataset = await getPxData(chartUrl, query);
              nextChartData[chart.id] = jsonStatToRows(chartDataset);
            } catch {
              nextChartData[chart.id] = [];
            }
          })
        );
        setChartDataByChartId((prev) => ({ ...prev, ...nextChartData }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Уучлаарай алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!metadata || !apiUrl) return;
    if (config.id === "money-finance" || config.id === "balance-of-payments") {
      setLoading(true);
      try {
        const chartApiCharts = charts.filter((c) => getChartApiUrl(c));
        const nextChartData: Record<string, DataRow[]> = {};
        await Promise.all(
          chartApiCharts.map(async (chart) => {
            const chartUrl = getChartApiUrl(chart);
            const fixedQuery = chart.chartFixedQuery;
            if (!chartUrl || !fixedQuery) return;
            try {
              const chartDataset = await getPxData(chartUrl, fixedQuery);
              nextChartData[chart.id] = jsonStatToRows(chartDataset);
            } catch {
              nextChartData[chart.id] = [];
            }
          })
        );
        setChartDataByChartId((prev) => ({ ...prev, ...nextChartData }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Уучлаарай алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (process.env.NODE_ENV === "development" && config.id === "average-salary") {
      console.debug("[Average-salary] loadData called, selections['Бүс']:", selections["Бүс"]);
    }
    setLoading(true);
    setError(null);
    try {
      // CPI аймаг/нийслэл: Бүс-ээр шүүхгүйгээр бүх бүс/дүүргийн өгөгдөл татаж, графикт selectedBusCodes-аар шүүнэ
      const querySelections = { ...selections };
      if (config.id === "cpi" && hasLevels && (selectedLevel === "аймаг" || selectedLevel === "нийслэл") && metadata) {
        const busVar = metadata.variables.find((v) => v.code === "Бүс");
        if (busVar?.values) querySelections["Бүс"] = busVar.values;
      }
      // CPI: "Суурь он" эсвэл "Үзүүлэлт" filter-ийг зөвхөн ганц утга (single-select) болгох
      if (config.id === "cpi" && metadata) {
        const suuriOnVar = metadata.variables.find((v) => v.code === "Суурь он" || v.code === "Үзүүлэлт");
        if (suuriOnVar) {
          const currentSelection = selections[suuriOnVar.code];
          // Зөвхөн эхний (сонгосон) утгыг авах - Segmented нь single-select
          if (currentSelection?.length === 1) {
            querySelections[suuriOnVar.code] = currentSelection;
          } else {
            // Default: 2023=100 (код "2")
            querySelections[suuriOnVar.code] = ["2"];
          }
        }
      }
      if (config.id === "ppi" && metadata) {
        querySelections["Дэд салбар"] = ["0", "1", "7", "26", "27", "28"];
        querySelections["Үзүүлэлт"] = ["1", "3"];
      }
      if (config.id === "housing-prices" && metadata) {
        if (housingIndexMode === "index") {
          querySelections["Суурь хугацаа"] = ["1"];
        } else {
          querySelections["Үзүүлэлт"] = ["0"];
        }
      }
      if (config.id === "unemployment" && metadata) {
        querySelections["Бүс"] = ["0"];
        querySelections["Статистик үзүүлэлт"] = ["1"];
        querySelections["Насны бүлэг"] = ["0"];
        querySelections["Хүйс"] = ["0"];
      }
      if (config.id === "gdp" && metadata) {
        const onVar = metadata.variables.find((v) => v.code === "ОН");
        if (onVar?.values?.length) querySelections["ОН"] = onVar.values;
        if (!querySelections["Статистик үзүүлэлт"]?.length) querySelections["Статистик үзүүлэлт"] = ["4"];
        const sectorVar = metadata.variables.find((v) => v.code === "Эдийн засгийн үйл ажиллагааны салбарын ангилал");
        if (sectorVar?.values?.length && !querySelections["Эдийн засгийн үйл ажиллагааны салбарын ангилал"]?.length)
          querySelections["Эдийн засгийн үйл ажиллагааны салбарын ангилал"] = sectorVar.values;
      }
      const body = buildQuery(metadata, querySelections);
      if (process.env.NODE_ENV === "development" && config.id === "cpi") {
        console.debug("[CPI] PX query", { url: apiUrl, body });
      }
      let data = await getPxData(apiUrl, body);
      const mainRows = jsonStatToRows(data ?? {});
      if (mainRows.length === 0 && (config.id === "cpi" || config.id === "gdp")) {
        try {
          const fullData = await getPxData(apiUrl, buildFullQuery(metadata));
          const fullRows = jsonStatToRows(fullData);
          if (fullRows.length > 0) data = fullData;
        } catch {
          // fallback failed, keep original empty data
        }
      }
      setDataset(data);

      // chartApiUrl / chartApiUrlByCpiMode бүхий графикууд: өгөгдөл татах
      const chartApiCharts = charts.filter((c) => getChartApiUrl(c));
      if (chartApiCharts.length > 0) {
        const nextChartData: Record<string, DataRow[]> = {};
        await Promise.all(
          chartApiCharts.map(async (chart) => {
            const chartUrl = getChartApiUrl(chart);
            if (!chartUrl) return;
            const fixedQuery = chart.chartFixedQuery;
            if (fixedQuery) {
              // Average-salary: chartFixedQuery-д Бүс болон Салбар slicer-ыг оруулах (Хүйс-г series-р харуулна)
              let queryToUse = fixedQuery;
              if (config.id === "average-salary") {
                const selectedBus = selections["Бүс"]?.[0] ?? "0";
                let salbarForQuery = selections["Салбар"]?.[0] ?? "0";
                const chartMetaForSalbar = metadataByChartId[chart.id] ?? metadata;
                const salbarVar = chartMetaForSalbar?.variables?.find((v: { code: string }) => v.code === "Салбар");
                if (salbarVar?.values?.length && salbarForQuery === "0") {
                  if (salbarVar.valueTexts?.length) {
                    const idx = salbarVar.valueTexts.findIndex((t: string) => String(t) !== "Улсын дундаж");
                    salbarForQuery = idx >= 0 && salbarVar.values[idx] != null ? String(salbarVar.values[idx]) : String(salbarVar.values[0]);
                  } else {
                    salbarForQuery = salbarVar.values.length > 1 ? String(salbarVar.values[1]) : String(salbarVar.values[0]);
                  }
                }
                const hasBusInQuery = fixedQuery.query?.some((q) => q.code === "Бүс");
                const hasSalbarInQuery = fixedQuery.query?.some((q) => q.code === "Салбар");
                if (hasBusInQuery) {
                  queryToUse = {
                    ...fixedQuery,
                    query: fixedQuery.query.map((q) =>
                      q.code === "Бүс"
                        ? { ...q, selection: { filter: "item" as const, values: [selectedBus] } }
                        : q
                    ),
                  };
                }
                if (hasSalbarInQuery) {
                  queryToUse = {
                    ...queryToUse,
                    query: queryToUse.query.map((q) =>
                      q.code === "Салбар"
                        ? { ...q, selection: { filter: "item" as const, values: [salbarForQuery] } }
                        : q
                    ),
                  };
                }
              }
              // Household-survey: Суурьшил, Бүс slicer-ыг chartFixedQuery-д оруулах
              if (config.id === "household-survey") {
                const selectedSuurshil = selections["Суурьшил"]?.[0];
                const selectedBus = selections["Бүс"]?.[0];
                const hasSuurshilInQuery = fixedQuery.query?.some((q) => q.code === "Суурьшил");
                const hasBusInQuery = fixedQuery.query?.some((q) => q.code === "Бүс");
                if (hasSuurshilInQuery && selectedSuurshil) {
                  queryToUse = {
                    ...queryToUse,
                    query: queryToUse.query.map((q) =>
                      q.code === "Суурьшил"
                        ? { ...q, selection: { filter: "item" as const, values: [selectedSuurshil] } }
                        : q
                    ),
                  };
                }
                if (hasBusInQuery && selectedBus) {
                  queryToUse = {
                    ...queryToUse,
                    query: queryToUse.query.map((q) =>
                      q.code === "Бүс"
                        ? { ...q, selection: { filter: "item" as const, values: [selectedBus] } }
                        : q
                    ),
                  };
                }
              }
              // Бизнес регистр: Үйл ажиллагаа эрхлэлтийн байдал-г filter-ээс авах, default "1" (Үйл ажиллагаа явуулж байгаа)
              if (config.id === "business-register" && fixedQuery.query?.some((q) => q.code === "Үйл ажиллагаа эрхлэлтийн байдал")) {
                const activitySelection = selections["Үйл ажиллагаа эрхлэлтийн байдал"]?.length
                  ? selections["Үйл ажиллагаа эрхлэлтийн байдал"]
                  : ["1"];
                queryToUse = {
                  ...queryToUse,
                  query: queryToUse.query.map((q) =>
                    q.code === "Үйл ажиллагаа эрхлэлтийн байдал"
                      ? { ...q, selection: { filter: "item" as const, values: activitySelection } }
                      : q
                  ),
                };
              }
              try {
                const chartDataset = await getPxData(chartUrl, queryToUse);
                nextChartData[chart.id] = jsonStatToRows(chartDataset);
                // Бизнес регистр: салбар бүрээр нэмэлт өгөгдөл татах (доор салбараар жижиг chart)
                if (config.id === "business-register" && chart.id === "business-register-active") {
                  const chartMeta = metadataByChartId[chart.id];
                  const sectorVar = chartMeta?.variables?.find((v: { code: string }) => v.code === "Эдийн засгийн салбар");
                  if (sectorVar?.values?.length) {
                    for (const sectorCode of sectorVar.values) {
                      const sectorQuery = {
                        ...queryToUse,
                        query: queryToUse.query.map((q) =>
                          q.code === "Эдийн засгийн салбар"
                            ? { ...q, selection: { filter: "item" as const, values: [String(sectorCode)] } }
                            : q
                        ),
                      };
                      try {
                        const sectorDataset = await getPxData(chartUrl, sectorQuery);
                        nextChartData[`business-register-sector-${sectorCode}`] = jsonStatToRows(sectorDataset);
                      } catch {
                        nextChartData[`business-register-sector-${sectorCode}`] = [];
                      }
                    }
                  }
                }
              } catch {
                nextChartData[chart.id] = [];
              }
              return;
            }
            const chartMeta = metadataByChartId[chart.id];
            if (!chartMeta) return;
            const chartSelections: Partial<Record<string, string[]>> =
              chart.filterToSingleValue && Object.keys(chart.filterToSingleValue).length > 0
                ? Object.fromEntries(
                    Object.entries(chart.filterToSingleValue).map(([k, v]) => [k, [v]])
                  )
                : {};
            // CPI detailed chart: бүс dimension-г түвшингээс хамааруулж шүүнэ
            if (config.id === "cpi" && chart.id === "cpi-detailed" && chart.regionFilterDimension) {
              if (selectedLevel === "нийслэл" || selectedLevel === "улс") {
                // Нийслэл болон Улс түвшинд: Бараа, үйлчилгээний үнэ-г Нийслэлээр (Улаанбаатар + дүүргүүд 5, 511) харуулна
                const busVar = chartMeta.variables.find(v => v.code === chart.regionFilterDimension);
                if (busVar?.values?.length) {
                  const ubCodes = busVar.values.filter((val) => val === "5" || val === "511");
                  chartSelections[chart.regionFilterDimension] = ubCodes.length > 0 ? ubCodes : ["5"];
                }
              } else if (selectedLevel === "аймаг" && selectedBusCodes.length > 0) {
                chartSelections[chart.regionFilterDimension] = selectedBusCodes;
              }
            }
            // CPI chart-уудад "Суурь он" / "Үзүүлэлт" filter-ийг зөвхөн ганц утга болгох
            if (config.id === "cpi" && chartMeta) {
              const suuriOnVar = chartMeta.variables.find((v) => v.code === "Суурь он" || v.code === "Үзүүлэлт");
              if (suuriOnVar) {
                const currentSelection = selections[suuriOnVar.code];
                if (currentSelection?.length === 1) {
                  chartSelections[suuriOnVar.code] = currentSelection;
                } else {
                  // Default: 2023=100 (код "2")
                  chartSelections[suuriOnVar.code] = ["2"];
                }
              }
            }
            // Орон сууц: дүүргээр — Үзүүлэлт 0,1 (шинэ/хуучин) + бүх дүүрэг
            if (config.id === "housing-prices" && chart.id === "housing-by-district") {
              chartSelections["Үзүүлэлт"] = ["0", "1"];
              chartSelections["Дүүрэг"] = ["0", "1", "2", "3", "4", "5", "6"];
            }
            if (config.id === "unemployment") {
              if (chart.id === "labour-participation") {
                chartSelections["Бүс"] = ["0"];
                chartSelections["Насны бүлэг"] = ["0"];
                chartSelections["Хүйс"] = ["0"];
              } else if (chart.id === "outside-labour-force" || chart.id === "unemployed") {
                chartSelections["Бүс"] = ["0"];
                chartSelections["Шалтгаан"] = ["0"];
                chartSelections["Насны бүлэг"] = ["0"];
                chartSelections["Хүйс"] = ["0"];
              } else if (chart.id === "employment") {
                chartSelections["Бүс"] = ["0"];
                chartSelections["Хүйс"] = ["0"];
                chartSelections["Насны бүлэг"] = ["0"];
                chartSelections["Эдийн засгийн салбар"] = ["0"];
              }
            }
            // Өрхийн тоо: дэлгэцийн Бүс шүүлттэй холбоно, default Улсын дүн (["0"])
            if (config.id === "population" && (chart.id === "population-birth-rate-coefficient" || chart.id === "population-death-rate-coefficient")) {
              chartSelections["Хүйс"] = ["0"];
            }
            if (config.id === "cpi-commodity-prices") {
              const timeVarCommodity = chartMeta.variables.find((v) => v.code === "Хугацаа");
              const commodityTimeCodes = selections["Хугацаа"]?.length ? selections["Хугацаа"] : (timeVarCommodity?.values?.slice(0, 24) ?? []);
              if (chart.id === "cpi-commodity-grid") {
                chartSelections["Бүтээгдэхүүн"] = ["3", "5", "9", "10", "16", "22", "30", "31"];
                chartSelections["Хугацаа"] = commodityTimeCodes;
              } else {
                chartSelections["Бүтээгдэхүүн"] = selections["Бүтээгдэхүүн"]?.length ? selections["Бүтээгдэхүүн"] : ["10"];
                chartSelections["Хугацаа"] = commodityTimeCodes;
              }
            }
            if (config.id === "population" && chart.id === "population-household-count") {
              chartSelections["Бүс"] = selections["Бүс"]?.length ? selections["Бүс"] : ["0"];
              const onVar = chartMeta.variables.find((v) => v.code === "Он");
              chartSelections["Он"] = onVar?.values ?? Array.from({ length: 21 }, (_, i) => String(i));
            }
            // Өрх, нийгэм — орлого зарлага: бүх утгаар татах
            if (config.id === "household-survey") {
              if (chart.id === "household-income-v1") {
                chartSelections["Байршил"] = ["0", "1", "2"];
                chartSelections["Орлогын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7"];
                chartSelections["Он"] = Array.from({ length: 28 }, (_, i) => String(i));
              } else if (chart.id === "household-income-v2") {
                chartSelections["Бүс"] = ["0", "1", "2", "3", "4", "5"];
                chartSelections["Орлогын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7"];
                chartSelections["Он"] = Array.from({ length: 18 }, (_, i) => String(i));
              } else if (chart.id === "household-income-018") {
                chartSelections["Суурьшил"] = ["0", "1", "2", "3", "4"];
                chartSelections["Орлогын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
                chartSelections["Улирал"] = Array.from({ length: 83 }, (_, i) => String(i));
              } else if (chart.id === "household-income-003-v1") {
                chartSelections["Байршил"] = ["0", "1", "2"];
                chartSelections["Орлогын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7"];
                chartSelections["Он"] = Array.from({ length: 28 }, (_, i) => String(i));
              } else if (chart.id === "household-income-003-v2") {
                chartSelections["Бүс"] = ["0", "1", "2", "3", "4", "5"];
                chartSelections["Орлогын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7"];
                chartSelections["Он"] = Array.from({ length: 18 }, (_, i) => String(i));
              } else if (chart.id === "household-income-020") {
                chartSelections["Суурьшил"] = ["1", "2", "3", "4", "5"];
                chartSelections["Орлогын төрөл"] = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
                chartSelections["Улирал"] = Array.from({ length: 83 }, (_, i) => String(i));
              } else if (chart.id === "household-expense-v1") {
                chartSelections["Байршил"] = ["0", "1", "2"];
                chartSelections["Зарлагын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7"];
                chartSelections["Он"] = Array.from({ length: 28 }, (_, i) => String(i));
              } else if (chart.id === "household-expense-v2") {
                chartSelections["Бүс"] = ["0", "1", "2", "3", "4", "5"];
                chartSelections["Зарлагын төрөл"] = ["0", "1", "2", "3", "4", "5"];
                chartSelections["Он"] = Array.from({ length: 18 }, (_, i) => String(i));
              } else if (chart.id === "household-expense-019") {
                chartSelections["Суурьшил"] = ["0", "1", "2", "3", "4"];
                chartSelections["Зарлагын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7"];
                chartSelections["Улирал"] = Array.from({ length: 83 }, (_, i) => String(i));
              } else if (chart.id === "household-expense-004-v1") {
                chartSelections["Байршил"] = ["0", "1", "2"];
                chartSelections["Зарлагын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7"];
                chartSelections["Он"] = Array.from({ length: 28 }, (_, i) => String(i));
              } else if (chart.id === "household-expense-004-v2") {
                chartSelections["Бүс"] = ["0", "1", "2", "3", "4", "5"];
                chartSelections["Зарлагын төрөл"] = ["0", "1", "2", "3", "4", "5"];
                chartSelections["Он"] = Array.from({ length: 18 }, (_, i) => String(i));
              } else if (chart.id === "household-expense-021") {
                chartSelections["Суурьшил"] = ["0", "1", "2", "3", "4"];
                chartSelections["Зарлагын төрөл"] = ["0", "1", "2", "3", "4", "5", "6", "7"];
                chartSelections["Улирал"] = Array.from({ length: 83 }, (_, i) => String(i));
              } else if (chart.id === "household-inequality-036") {
                chartSelections["Үзүүлэлт"] = ["0", "1"];
                chartSelections["Суурьшил"] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
                chartSelections["Он"] = Array.from({ length: 7 }, (_, i) => String(i));
              }
              // Нэгтгэсэн slicer: Орлого — Байршил, Орлогын төрөл, Он; Зарлага — Зарлагын төрөл
              const skipSlicerOverride =
                chart.id === "household-income-020" ||
                chart.id === "household-inequality-036";
              if (!skipSlicerOverride) {
                for (const dim of ["Байршил", "Орлогын төрөл", "Он"] as const) {
                  if (chartSelections[dim] !== undefined && selections[dim]?.length) {
                    const allowed = chartMeta.variables.find((x) => x.code === dim)?.values ?? [];
                    const filtered = selections[dim].filter((v) => allowed.includes(v));
                    chartSelections[dim] = filtered.length > 0 ? filtered : chartSelections[dim];
                  }
                }
                if (chart.id.startsWith("household-expense") && chartSelections["Зарлагын төрөл"] !== undefined && selections["Зарлагын төрөл"]?.length) {
                  const allowed = chartMeta.variables.find((x) => x.code === "Зарлагын төрөл")?.values ?? [];
                  const filtered = selections["Зарлагын төрөл"].filter((v) => allowed.includes(v));
                  chartSelections["Зарлагын төрөл"] = filtered.length > 0 ? filtered : chartSelections["Зарлагын төрөл"];
                }
              }
            }
            // Average-salary dashboard - Бүс болон Салбар; Салбар "0" (Улсын дундаж) бол chart-ын metadata-аас эхний салбар ашиглана (анх ачаалахад өгөгдөл гарна)
            if (config.id === "average-salary") {
              const hasBus = chartMeta.variables.some((v) => v.code === "Бүс");
              if (hasBus && selections["Бүс"]?.length) {
                chartSelections["Бүс"] = selections["Бүс"];
              }
              const salbarVar = chartMeta.variables.find((v) => v.code === "Салбар");
              if (salbarVar?.values?.length) {
                const current = selections["Салбар"]?.[0] ?? "0";
                const isUlsiinDundaj = current === "0" || (salbarVar.valueTexts?.[salbarVar.values.indexOf(current)] === "Улсын дундаж");
                const effectiveSalbar = isUlsiinDundaj && salbarVar.valueTexts?.length
                  ? (() => {
                      const idx = salbarVar.valueTexts.findIndex((t) => String(t) !== "Улсын дундаж");
                      return idx >= 0 && salbarVar.values[idx] != null ? [String(salbarVar.values[idx])] : [String(salbarVar.values[0])];
                    })()
                  : (selections["Салбар"]?.length ? selections["Салбар"] : [String(salbarVar.values[0])]);
                chartSelections["Салбар"] = effectiveSalbar;
              }
            }
            const chartBody = buildQuery(chartMeta, chartSelections);
            try {
              const chartDataset = await getPxData(chartUrl, chartBody);
              nextChartData[chart.id] = jsonStatToRows(chartDataset);
            } catch {
              nextChartData[chart.id] = [];
            }
          })
        );
        setChartDataByChartId((prev) => ({ ...prev, ...nextChartData }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Уучлаарай алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, metadata, metadataByChartId, selections, config.id, hasLevels, selectedLevel, charts, getChartApiUrl, selectedBusCodes, housingIndexMode]);

  // Дундаж цалин: анхны татсан өгөгдлөөс Салбар сонголтыг синк (өгөгдөл "0" биш салбарын кодыг агуулсан бол)
  useEffect(() => {
    if (config.id !== "average-salary") return;
    const sectorData = chartDataByChartId["wages-sector-area"];
    const current = selections["Салбар"]?.[0] ?? "0";
    if (current !== "0" || !sectorData?.length) return;
    const first = sectorData[0];
    const code = first["Салбар_code"] ?? first["Салбар"];
    if (code != null && String(code) !== "0") {
      setSelections((prev) => ({ ...prev, Салбар: [String(code)] }));
    }
  }, [config.id, chartDataByChartId, selections["Салбар"]]);

  useEffect(() => {
    if (!apiUrl) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getPxMetadata(apiUrl)
      .then((meta) => {
        if (!cancelled) {
          setMetadata(meta);
          const initial: Record<string, string[]> = {};
          const isCpiNiiislelApi = config.id === "cpi" && (apiUrl.includes("012V1") || apiUrl.includes("003V4"));
          meta.variables.forEach((v) => {
            initial[v.code] = v.values;
            // Үзүүлэлт / Суурь он: default 2023=100 (код "2", single-select)
            if ((v.code === "Суурь он" || v.code === "Үзүүлэлт") && config.id === "cpi") {
              initial[v.code] = ["2"];
            }
            if (v.code === "Бүс" && v.valueTexts?.length) {
              if (config.id === "cpi") {
                const idxAimag = v.valueTexts.findIndex((t) => !String(t).includes("бүс"));
                if (idxAimag >= 0 && v.values[idxAimag] != null)
                  initial[v.code] = [String(v.values[idxAimag])];
              } else {
                const idxUlsiin = v.valueTexts.findIndex((t) => String(t).includes("Улсын дүн"));
                if (idxUlsiin >= 0 && v.values[idxUlsiin] != null)
                  initial[v.code] = [String(v.values[idxUlsiin])];
                else {
                  const idxAimag = v.valueTexts.findIndex((t) => !String(t).includes("бүс"));
                  if (idxAimag >= 0 && v.values[idxAimag] != null)
                    initial[v.code] = [String(v.values[idxAimag])];
                }
              }
            }
            if (config.id === "gdp" && v.code === "Статистик үзүүлэлт" && v.values?.includes("4")) {
              initial[v.code] = ["4"];
            }
            if (config.id === "gdp" && (v.code === "Эдийн засгийн салбар" || v.code === "Эдийн засгийн үйл ажиллагааны салбарын ангилал") && v.values?.length) {
              const idxMining = v.values.indexOf("2");
              initial[v.code] = idxMining >= 0 ? ["2"] : [String(v.values[0])];
            }
            // "Хүн амын тоо" (Бүгд/Хот/Хөдөө) төрлийн 3 утгатай хувьсагчийг ганц сонголттой default болгоно
            if (v.valueTexts?.length && v.values?.length) {
              const hasBugd = v.valueTexts.some((t) => String(t).includes("Бүгд"));
              const hasHot = v.valueTexts.some((t) => String(t).includes("Хот"));
              const hasHodoo = v.valueTexts.some((t) => String(t).includes("Хөдөө"));
              if (hasBugd && hasHot && hasHodoo) {
                const idxBugd = v.valueTexts.findIndex((t) => String(t).includes("Бүгд"));
                const pick = idxBugd >= 0 && v.values[idxBugd] != null ? String(v.values[idxBugd]) : String(v.values[0]);
                initial[v.code] = [pick];
              }
            }
            // CPI Бүс: нийслэл=Улаанбаатар ("5"), аймаг=эхний аймаг (Баян-Өлгий биш Архангай)
            if (config.id === "cpi" && v.code === "Бүс" && selectedLevel && v.values.length > 0) {
              if (selectedLevel === "нийслэл") {
                // Нийслэл: код "5" (Улаанбаатар)
                const ulaanbaatarCode = v.values.find((val) => val === "5") ?? v.values[0];
                initial[v.code] = [ulaanbaatarCode];
              } else if (selectedLevel === "аймаг") {
                // Аймаг: Архангай эсвэл alphabetically эхний аймаг (Баян-Өлгий биш)
                const aimags = v.values.filter((val) => val !== "5" && val !== "511");
                let aimag = aimags[0];
                if (v.valueTexts?.length) {
                  // Архангай байвал түүнийг сонгоно
                  const arhangaiIdx = v.valueTexts.findIndex((t) => String(t).includes("Архангай"));
                  if (arhangaiIdx >= 0 && v.values[arhangaiIdx] && aimags.includes(v.values[arhangaiIdx])) {
                    aimag = v.values[arhangaiIdx];
                  } else {
                    // Эсвэл alphabetically эхний аймгийг олно (Баян-Өлгийг орхих)
                    const aimagNames = aimags
                      .map((code) => {
                        const idx = v.values.indexOf(code);
                        return idx >= 0 && v.valueTexts?.[idx] ? { code, name: String(v.valueTexts[idx]) } : null;
                      })
                      .filter((x) => x != null && !x.name.includes("Баян-Өлгий") && !x.name.includes("бүс"));
                    if (aimagNames.length > 0) {
                      aimagNames.sort((a, b) => a!.name.localeCompare(b!.name, "mn"));
                      aimag = aimagNames[0]!.code;
                    }
                  }
                }
                initial[v.code] = [aimag ?? v.values[0]];
              }
            }
            // PPI: Сар-ыг бүх онуудаар татах (2021 оноос хойш)
            if (config.id === "ppi" && v.code === "Сар" && v.values?.length) {
              initial[v.code] = v.values.map(String);
            }
            // Хүн амын тоо: Бүс (аймаг) default = Улсын дүн ("0")
            if (config.id === "population" && v.code === "Бүс" && v.values?.length) {
              initial[v.code] = ["0"];
            }
            // Average-salary: Бүс=Улсын дүн ("0"), Салбар=Бүгд ("0")
            if (config.id === "average-salary" && v.code === "Бүс" && v.values?.length) {
              initial[v.code] = ["0"];
            }
            // Average-salary: Салбар = Улсын дундаж биш эхний салбар (анх ачаалахад chart-д өгөгдөл гарна)
            if (config.id === "average-salary" && v.code === "Салбар" && v.values?.length && v.valueTexts?.length) {
              const idxNotUlsiin = v.valueTexts.findIndex((t) => String(t) !== "Улсын дундаж");
              const code = idxNotUlsiin >= 0 && v.values[idxNotUlsiin] != null ? String(v.values[idxNotUlsiin]) : String(v.values[0]);
              initial[v.code] = [code];
            } else if (config.id === "average-salary" && v.code === "Салбар" && v.values?.length) {
              initial[v.code] = [String(v.values[0])];
            }
            // Household-survey: Суурьшил=Бүгд ("0")
            if (config.id === "household-survey" && v.code === "Суурьшил" && v.values?.length) {
              initial[v.code] = ["0"];
            }
            // Бизнес регистр: Үйл ажиллагаа эрхлэлтийн байдал = Үйл ажиллагаа явуулж байгаа ("1")
            if (config.id === "business-register" && v.code === "Үйл ажиллагаа эрхлэлтийн байдал") {
              initial[v.code] = ["1"];
            }
            // Бизнес регистр: Улирал default = 2022-1 (2022 Q1). API-д values=индекс код, valueTexts=харуулах утга
            if (config.id === "business-register" && v.code === "Улирал" && v.values?.length && v.valueTexts?.length) {
              const idx2022q1 = v.valueTexts.findIndex((t) => String(t) === "2022-1" || String(t) === "2022-01");
              const code = idx2022q1 >= 0 ? v.values[idx2022q1] : v.values[v.values.length - 1];
              initial[v.code] = [String(code)];
            }
            // Улсын төсөв: Он-ыг энд тохируулахгүй — 2010–2025-ийг budget-balance-yearly metadata ирсэн үед useEffect тохируулна
            if (config.id === "state-budget" && v.code === "Он") return;
            // Гол нэрийн барааны үнэ: default Үхрийн мах, ястай, кг (код 10), Хугацаа = сүүлийн 24 сар
            if (config.id === "cpi-commodity-prices" && v.code === "Бүтээгдэхүүн") {
              initial[v.code] = ["10"];
            }
            if (config.id === "cpi-commodity-prices" && v.code === "Хугацаа" && v.values?.length) {
              initial[v.code] = v.values.slice(0, 24).map(String);
            }
          });
          // Household-survey: Бүс default-ыг chartMeta-с авна
          if (config.id === "household-survey") {
            initial["Бүс"] = ["0"];
          }
          setSelections(initial);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Уучлаарай алдаа гарлаа.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiUrl, config.id]);

  // chartApiUrl / chartApiUrlByCpiMode бүхий графикуудын metadata татах
  useEffect(() => {
    const withUrl = charts.filter((c) => getChartApiUrl(c));
    if (withUrl.length === 0) return;
    let cancelled = false;
    withUrl.forEach((chart) => {
      const url = getChartApiUrl(chart);
      if (!url) return;
      getPxMetadata(url)
        .then((meta) => {
          if (!cancelled) setMetadataByChartId((prev) => ({ ...prev, [chart.id]: meta }));
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [charts, getChartApiUrl]);

  const chartApiCharts = useMemo(
    () => charts.filter((c) => getChartApiUrl(c)),
    [charts, getChartApiUrl]
  );
  const chartMetaReady =
    chartApiCharts.length === 0 || chartApiCharts.every((c) => metadataByChartId[c.id] != null);

  useEffect(() => {
    if (config.id === "society-education" && selections["Ангилал"] == null) {
      setSelections((prev) => ({ ...prev, Ангилал: ["0"] }));
    }
  }, [config.id, selections["Ангилал"]]);

  useEffect(() => {
    if (config.id === "society-education") {
      if (chartApiCharts.length === 0 || !chartMetaReady) return;
      loadData();
      return;
    }
    const hasSelections = Object.keys(selections).length > 0;
    const runHouseholdWithoutSelections = config.id === "household-survey" && metadata != null;
    if (!metadata || (!hasSelections && !runHouseholdWithoutSelections)) return;
    if (chartApiCharts.length > 0 && !chartMetaReady) return;
    loadData();
  }, [metadata, selections, loadData, config.id, chartMetaReady, chartApiCharts.length]);

  useEffect(() => {
    if (!metadata || !charts?.length) return;
    setTrendChartSeriesSelection((prev) => {
      let next = prev;
      for (const chart of charts) {
        const dim = chart.seriesDimensions?.[0];
        if (!dim || !chart.defaultSeriesCodes?.[dim] || prev[chart.id] !== undefined) continue;
        const codes = chart.defaultSeriesCodes[dim];
        if (!codes?.length) continue;
        next = { ...next, [chart.id]: codes };
      }
      return next;
    });
  }, [metadata, charts]);

  // Улсын төсөв Жил tab: default эхлэх 2021, дуусах 2025
  const selectionsOn = selections["Он"];
  useEffect(() => {
    if (config.id !== "state-budget") return;
    const yearlyMeta = metadataByChartId["budget-balance-yearly"];
    const onVar = yearlyMeta?.variables?.find((v: { code: string }) => v.code === "Он");
    if (!onVar?.values?.length || !onVar?.valueTexts?.length) return;
    if (selectionsOn != null && selectionsOn.length > 0) return;
    const n = onVar.values.length;
    const codes = onVar.values as string[];
    let idx2021 = -1;
    let idx2025 = -1;
    for (let i = 0; i < n; i++) {
      const label = String(onVar.valueTexts?.[i] ?? "").replace(/\D/g, "").slice(0, 4);
      const y = label.length === 4 ? parseInt(label, 10) : 0;
      if (y === 2021) idx2021 = i;
      if (y === 2025) idx2025 = i;
    }
    const startIdx = idx2021 >= 0 ? idx2021 : 0;
    const endIdx = idx2025 >= 0 ? idx2025 : n - 1;
    const lo = Math.min(startIdx, endIdx);
    const hi = Math.max(startIdx, endIdx);
    setSelections((prev) => ({ ...prev, Он: codes.slice(lo, hi + 1).map(String) }));
    setBudgetYearlyRange([lo, hi]);
  }, [config.id, metadataByChartId["budget-balance-yearly"], selectionsOn]);

  const rows: DataRow[] = dataset ? jsonStatToRows(dataset) : [];

  const availableHousingIndexMonths = useMemo(() => {
    if (config.id !== "housing-prices" || housingIndexMode !== "change") return [] as string[];
    return [...new Set(rows.map((r: DataRow) => String(r["Сар"] ?? r["Сар_code"] ?? "")))].filter(Boolean).sort();
  }, [config.id, housingIndexMode, rows]);

  useEffect(() => {
    if (housingIndexMode === "change") return;
    setHousingIndexMonthRange(null);
    setHousingIndexRangePlaying(false);
  }, [housingIndexMode]);

  useEffect(() => {
    if (config.id !== "housing-prices" || housingIndexMode !== "change" || availableHousingIndexMonths.length < 1) return;
    setHousingIndexMonthRange((prev) => {
      if (prev != null) return prev;
      const last = availableHousingIndexMonths[availableHousingIndexMonths.length - 1] ?? "";
      const startIdx = availableHousingIndexMonths.findIndex((m) => m >= "2022-01");
      const start = startIdx >= 0 ? availableHousingIndexMonths[startIdx]! : availableHousingIndexMonths[0]!;
      return [start, last];
    });
  }, [config.id, housingIndexMode, availableHousingIndexMonths]);

  useEffect(() => {
    if (!housingIndexRangePlaying || config.id !== "housing-prices" || housingIndexMode !== "change") return;
    const periods = availableHousingIndexMonths;
    if (periods.length < 2) return;
    const interval = setInterval(() => {
      setHousingIndexMonthRange((prev) => {
        const start = prev?.[0] ?? periods[0]!;
        const end = prev?.[1] ?? periods[periods.length - 1]!;
        const i0 = Math.max(0, periods.indexOf(start));
        const i1 = Math.max(i0, periods.indexOf(end));
        if (i1 >= periods.length - 1) {
          queueMicrotask(() => setHousingIndexRangePlaying(false));
          return prev ?? [periods[0]!, periods[periods.length - 1]!];
        }
        const windowLen = Math.max(2, i1 - i0 + 1);
        const ni1 = Math.min(periods.length - 1, i1 + 1);
        const ni0 = Math.max(0, ni1 - windowLen + 1);
        return [periods[ni0]!, periods[ni1]!];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [housingIndexRangePlaying, config.id, housingIndexMode, availableHousingIndexMonths]);

  const availableUnemploymentQuarters = useMemo(() => {
    if (config.id !== "unemployment" || !rows.length) return [] as string[];
    const key = "Улирал";
    const vals = [...new Set(rows.map((r: DataRow) => String(r[key] ?? r[`${key}_code`] ?? "")))].filter(Boolean);
    return sortGdpQuarterPeriods(vals);
  }, [config.id, rows]);

  useEffect(() => {
    if (config.id !== "unemployment" || availableUnemploymentQuarters.length < 1) return;
    setUnemploymentRange((prev) => {
      if (prev != null) return prev;
      // Default: 2019-1 эсвэл эхний боломжит улирал
      const start2019 = availableUnemploymentQuarters.find((q) => q.startsWith("2019"));
      const first = start2019 ?? availableUnemploymentQuarters[0];
      const last = availableUnemploymentQuarters[availableUnemploymentQuarters.length - 1];
      return [first, last];
    });
  }, [config.id, availableUnemploymentQuarters]);

  useEffect(() => {
    if (!unemploymentRangePlaying || config.id !== "unemployment") return;
    const periods = availableUnemploymentQuarters;
    if (periods.length < 2) return;
    const interval = setInterval(() => {
      setUnemploymentRange((prev) => {
        const start = prev?.[0] ?? periods[0]!;
        const end = prev?.[1] ?? periods[periods.length - 1]!;
        const i0 = Math.max(0, periods.indexOf(start));
        const i1 = Math.max(i0, periods.indexOf(end));
        if (i1 >= periods.length - 1) {
          queueMicrotask(() => setUnemploymentRangePlaying(false));
          return prev ?? [periods[0]!, periods[periods.length - 1]!];
        }
        const windowLen = Math.max(2, i1 - i0 + 1);
        const ni1 = Math.min(periods.length - 1, i1 + 1);
        const ni0 = Math.max(0, ni1 - windowLen + 1);
        return [periods[ni0]!, periods[ni1]!];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [unemploymentRangePlaying, config.id, availableUnemploymentQuarters]);

  useEffect(() => {
    if (config.id !== "population" || !dataset) return;
    const mainRows = jsonStatToRows(dataset);
    if (mainRows.length === 0) return;
    const years = [...new Set(mainRows.map((r) => String(r["Он"] ?? r["Он_code"] ?? "")).filter(Boolean))].sort((a, b) => {
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) return Number(a) - Number(b);
      return a.localeCompare(b);
    });
    if (years.length === 0) return;
    const endYear = years[years.length - 1]!;
    let defaultFromYear = "1989";
    if (metadata?.variables && selections) {
      const busVar = metadata.variables.find(
        (v) =>
          v.valueTexts?.some((t) => String(t).includes("Бүгд")) &&
          v.valueTexts?.some((t) => String(t).includes("Хот")) &&
          v.valueTexts?.some((t) => String(t).includes("Хөдөө"))
      );
      if (busVar) {
        const sel = selections[busVar.code];
        const selCode = sel?.[0];
        if (selCode != null && busVar.valueTexts && busVar.values) {
          const idx = busVar.values.indexOf(selCode);
          const label = idx >= 0 ? String(busVar.valueTexts[idx] ?? "") : "";
          if (label.includes("Хот") || label.includes("Хөдөө")) defaultFromYear = "1990";
        }
      }
    }
    const startYear = years.find((y) => /^\d+$/.test(y) && Number(y) >= Number(defaultFromYear)) ?? years[0];
    setSharedRangeYears([startYear!, endYear]);
  }, [config.id, dataset, metadata, selections]);

  const availablePpiPeriods = useMemo(() => {
    if (config.id !== "ppi") return [] as string[];
    const ppiIds = ["ppi-industrial", "ppi-transport", "ppi-info-comm", "ppi-accommodation", "ppi-food-service"];
    const allPeriods = new Set<string>();
    for (const id of ppiIds) {
      const meta = metadataByChartId[id] ?? metadata;
      const sarVar = meta?.variables?.find((v: { code: string }) => v.code === "Сар");
      const texts = sarVar?.valueTexts;
      if (texts?.length) texts.forEach((t: string) => allPeriods.add(String(t).replace(".", "-")));
    }
    const fromRows = (chartDataByChartId["ppi-industrial"] ?? rows) as DataRow[];
    const key = "Сар";
    fromRows.forEach((r) => {
      const v = String(r[key] ?? r[`${key}_code`] ?? "");
      if (v && /^\d{4}[.-]\d{2}/.test(v)) allPeriods.add(v.replace(".", "-"));
    });
    const vals = [...allPeriods].filter(Boolean);
    return vals.sort((a, b) => {
      const aY = parseInt(String(a).slice(0, 4), 10) || 0;
      const bY = parseInt(String(b).slice(0, 4), 10) || 0;
      if (aY !== bY) return aY - bY;
      const aM = parseInt(String(a).slice(5, 7), 10) || 1;
      const bM = parseInt(String(b).slice(5, 7), 10) || 1;
      return aM - bM;
    });
  }, [config.id, metadata, metadataByChartId, chartDataByChartId, rows]);

  useEffect(() => {
    if (config.id !== "ppi" || availablePpiPeriods.length < 1 || ppiRangePeriod != null) return;
    const idx = availablePpiPeriods.findIndex((p) => parseInt(String(p).slice(0, 4), 10) >= 2025);
    const start = idx >= 0 ? availablePpiPeriods[idx]! : availablePpiPeriods[0]!;
    const end = availablePpiPeriods[availablePpiPeriods.length - 1]!;
    setPpiRangePeriod([start, end]);
  }, [config.id, availablePpiPeriods, ppiRangePeriod]);

  useEffect(() => {
    if (!ppiRangePlaying || config.id !== "ppi") return;
    const periods = availablePpiPeriods;
    if (periods.length < 2) return;
    const interval = setInterval(() => {
      setPpiRangePeriod((prev) => {
        const start = prev?.[0] ?? periods[0]!;
        const end = prev?.[1] ?? periods[periods.length - 1]!;
        const i0 = Math.max(0, periods.indexOf(start));
        const i1 = Math.max(i0, periods.indexOf(end));
        if (i1 >= periods.length - 1) {
          queueMicrotask(() => setPpiRangePlaying(false));
          return prev ?? [periods[0]!, periods[periods.length - 1]!];
        }
        const windowLen = Math.max(2, i1 - i0 + 1);
        const ni1 = Math.min(periods.length - 1, i1 + 1);
        const ni0 = Math.max(0, ni1 - windowLen + 1);
        return [periods[ni0]!, periods[ni1]!];
      });
    }, 800);
    return () => clearInterval(interval);
  }, [ppiRangePlaying, config.id, availablePpiPeriods]);

  useEffect(() => {
    if (config.id !== "gdp" || !rows.length) return;
    const years = [...new Set(rows.map((r) => String(r["Он"] ?? r["Он_code"] ?? "")).filter(Boolean))].sort((a, b) => {
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) return Number(a) - Number(b);
      return a.localeCompare(b);
    });
    if (years.length > 0)
      setGdpRangeYears((prev) => (prev != null ? prev : [years[0], years[years.length - 1]]));
  }, [config.id, rows]);

  const selectedMapYear = yearSlicerChart ? barChartYear[yearSlicerChart.id] : undefined;

  const computedNetGrowthByChartId = useMemo(() => {
    const out: Record<string, DataRow[]> = {};
    for (const chart of charts) {
      if (!chart.computedSourceCharts?.length) continue;
      
      // births-minus-deaths formula
      if (chart.computedFormula === "births-minus-deaths") {
        const [birthsId, deathsId] = chart.computedSourceCharts;
        const birthRows = chartDataByChartId[birthsId] ?? [];
        const deathRows = chartDataByChartId[deathsId] ?? [];
        const deathByKey = new Map<string, number>();
        for (const r of deathRows) {
          const key = `${r["Он_code"] ?? r["Он"]}_${r["Хүйс_code"] ?? r["Хүйс"]}`;
          deathByKey.set(key, Number(r.value) || 0);
        }
        const result: DataRow[] = [];
        for (const r of birthRows) {
          const key = `${r["Он_code"] ?? r["Он"]}_${r["Хүйс_code"] ?? r["Хүйс"]}`;
          const deathVal = deathByKey.get(key);
          if (deathVal === undefined) continue;
          const birthVal = Number(r.value) || 0;
          result.push({ ...r, value: birthVal - deathVal });
        }
        out[chart.id] = result;
      }
      
      // budget-balance formula (income - expense)
      if (chart.computedFormula === "budget-balance" || chart.computedFormula === "budget-balance-cumulative") {
        const [incomeId, expenseId] = chart.computedSourceCharts;
        const incomeRows = chartDataByChartId[incomeId] ?? [];
        const expenseRows = chartDataByChartId[expenseId] ?? [];
        const expenseByKey = new Map<string, number>();
        for (const r of expenseRows) {
          const period = r["Сар_code"] ?? r["Сар"] ?? r["Он_code"] ?? r["Он"];
          expenseByKey.set(String(period), Number(r.value) || 0);
        }
        const result: DataRow[] = [];
        for (const r of incomeRows) {
          const period = r["Он_code"] ?? r["Он"] ?? r["Сар_code"] ?? r["Сар"];
          const expenseVal = expenseByKey.get(String(period));
          if (expenseVal === undefined) continue;
          const incomeVal = Number(r.value) || 0;
          result.push({ ...r, value: incomeVal - expenseVal });
        }
        out[chart.id] = result;
      }

      // foreign-trade-balance formula (export - import)
      if (chart.computedFormula === "foreign-trade-balance") {
        const [exportId, importId] = chart.computedSourceCharts;
        const exportRows = chartDataByChartId[exportId] ?? [];
        const importRows = chartDataByChartId[importId] ?? [];
        const importByKey = new Map<string, number>();
        for (const r of importRows) {
          const period = r["Сар_code"] ?? r["Сар"];
          importByKey.set(String(period), Number(r.value) || 0);
        }
        const result: DataRow[] = [];
        for (const r of exportRows) {
          const period = r["Сар_code"] ?? r["Сар"];
          const importVal = importByKey.get(String(period));
          if (importVal === undefined) continue;
          const exportVal = Number(r.value) || 0;
          result.push({ ...r, value: exportVal - importVal });
        }
        out[chart.id] = result;
      }

      // foreign-trade-balance-cumulative formula (export - import)
      if (chart.computedFormula === "foreign-trade-balance-cumulative") {
        const [exportId, importId] = chart.computedSourceCharts;
        const exportRows = chartDataByChartId[exportId] ?? [];
        const importRows = chartDataByChartId[importId] ?? [];
        const importByKey = new Map<string, number>();
        for (const r of importRows) {
          const period = r["Сар_code"] ?? r["Сар"];
          importByKey.set(String(period), Number(r.value) || 0);
        }
        const result: DataRow[] = [];
        for (const r of exportRows) {
          const period = r["Сар_code"] ?? r["Сар"];
          const importVal = importByKey.get(String(period));
          if (importVal === undefined) continue;
          const exportVal = Number(r.value) || 0;
          result.push({ ...r, value: exportVal - importVal });
        }
        out[chart.id] = result;
      }
    }
    return out;
  }, [charts, chartDataByChartId]);

  // Household: Олон code-г нэгтгэх шаардлагатай chart-ууд
  const processedChartData = useMemo(() => {
    let result = { ...chartDataByChartId };

    // Нэгтгэх функц
    const mergeByPeriod = (data: DataRow[] | undefined): DataRow[] => {
      if (!data?.length) return [];
      const sumMap = new Map<string, { baseRow: DataRow; sum: number }>();
      for (const r of data) {
        const key = `${r["Улирал_code"] ?? r["Улирал"]}_${r["Суурьшил_code"] ?? r["Суурьшил"]}`;
        const existing = sumMap.get(key);
        if (existing) {
          existing.sum += Number(r.value) || 0;
        } else {
          sumMap.set(key, { baseRow: r, sum: Number(r.value) || 0 });
        }
      }
      const mergedRows: DataRow[] = [];
      for (const { baseRow, sum } of sumMap.values()) {
        mergedRows.push({ ...baseRow, value: sum });
      }
      return mergedRows;
    };

    // Орлого: Үйлдвэрлэлийн орлого нэгтгэх (codes 4+5)
    const productionData = chartDataByChartId["household-income-production"];
    if (productionData?.length) {
      result["household-income-production"] = mergeByPeriod(productionData);
    }

    return result;
  }, [chartDataByChartId]);

  const moneyFinanceBaseYears = useMemo(() => {
    if (config.id !== "money-finance") return [];
    const years = new Set<number>();
    const addFrom = (rows: DataRow[] | undefined) => {
      for (const r of rows ?? []) {
        const y = yearFromMoneyFinanceRow(r);
        if (y != null && y >= 2000 && y <= 2100) years.add(y);
      }
    };
    addFrom(chartDataByChartId["money-supply-table"]);
    addFrom(chartDataByChartId["loan-table"]);
    addFrom(chartDataByChartId["loan-balance-area"]);
    addFrom(chartDataByChartId["loan-citizens-detail"]);
    addFrom(chartDataByChartId["loan-ipotek-detail"]);
    addFrom(chartDataByChartId["loan-rate"]);
    return [...years].sort((a, b) => a - b);
  }, [config.id, chartDataByChartId]);

  const moneyFinanceLatestMonth = useMemo(() => {
    if (config.id !== "money-finance") return null;
    const rows = (chartDataByChartId["loan-table"] ?? [])
      .concat(chartDataByChartId["money-supply-table"] ?? [])
      .concat(chartDataByChartId["loan-balance-area"] ?? []);
    const best = latestYearMonthFromMoneyFinanceRows(rows);
    return best?.month ?? null;
  }, [config.id, chartDataByChartId]);

  const moneyFinanceMonthInitializedRef = useRef(false);
  useEffect(() => {
    if (config.id !== "money-finance" || moneyFinanceLatestMonth == null) {
      if (config.id !== "money-finance") moneyFinanceMonthInitializedRef.current = false;
      return;
    }
    if (!moneyFinanceMonthInitializedRef.current) {
      moneyFinanceMonthInitializedRef.current = true;
      setMoneyFinanceMonthFilter(String(moneyFinanceLatestMonth));
    }
  }, [config.id, moneyFinanceLatestMonth]);

  useEffect(() => {
    if (!mapApiUrl) return;
    let cancelled = false;
    getPxMetadata(mapApiUrl)
      .then((meta) => {
        if (!cancelled) setMapMetadata(meta);
      })
      .catch(() => {
        if (!cancelled) setMapMetadata(null);
      });
    return () => {
      cancelled = true;
    };
  }, [mapApiUrl]);

  const effectiveMapYear = useMemo(() => {
    if (!mapMetadata) return "";
    const yearVar = mapMetadata.variables.find((v) => v.code === "Он");
    const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
    if (yearLabels.length === 0) return selectedMapYearLocal ?? selectedMapYear ?? "";
    const defaultLabel =
      config.id === "livestock"
        ? yearLabels[0]
        : yearLabels[yearLabels.length - 1];
    return selectedMapYearLocal ?? selectedMapYear ?? defaultLabel;
  }, [mapMetadata, selectedMapYearLocal, selectedMapYear, config.id]);

  useEffect(() => {
    if (!mapMetadata || !mapApiUrl) return;
    const yearVar = mapMetadata.variables.find((v) => v.code === "Он");
    const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
    const yearValues = yearVar?.values ?? [];
    const defaultLabelForFetch =
      config.id === "livestock" && yearLabels.length > 0
        ? yearLabels[0]
        : yearLabels.length > 0
          ? yearLabels[yearLabels.length - 1]
          : "";
    const yearLabel = effectiveMapYear || defaultLabelForFetch;
    const yearIdx = yearLabels.indexOf(yearLabel);
    const fallbackIdx = config.id === "livestock" ? 0 : yearValues.length - 1;
    const yearValue = yearIdx >= 0 && yearValues[yearIdx] != null ? yearValues[yearIdx] : yearValues[fallbackIdx];
    let cancelled = false;
    setMapLoading(true);
    const genderVar = mapMetadata.variables.find((v) => v.code === "Хүйс");
    const busVar = mapMetadata.variables.find((x) => x.code === "Бүс");
    const busValuesForLivestock =
      config.id === "livestock" && busVar?.values?.length
        ? busVar.values.filter((c) => {
            const s = String(c ?? "").trim();
            if (!s || s === "0") return true;
            return s.length === 3;
          })
        : null;

    const query = mapMetadata.variables.map((v) => {
      if (v.code === "Хүйс" && genderVar?.values?.length) {
        return { code: v.code, selection: { filter: "item" as const, values: [genderVar.values[0]] } };
      }
      if (v.code === "Малын төрөл" && v.values?.includes("0")) {
        return { code: v.code, selection: { filter: "item" as const, values: ["0"] } };
      }
      if (v.code === "Бүс" && busValuesForLivestock?.length) {
        return { code: v.code, selection: { filter: "item" as const, values: busValuesForLivestock } };
      }
      return {
        code: v.code,
        selection: { filter: "item" as const, values: v.code === "Он" && yearValue != null ? [yearValue] : v.values },
      };
    });
    getPxData(mapApiUrl, { query, response: { format: "json-stat2" } })
      .then((data) => {
        if (!cancelled) setMapDataset(data);
      })
      .catch(() => {
        if (!cancelled) setMapDataset(null);
      })
      .finally(() => {
        if (!cancelled) setMapLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mapApiUrl, mapMetadata, effectiveMapYear, config.id]);

  const mapYears = useMemo(() => {
    if (!mapMetadata) return [];
    const v = mapMetadata.variables.find((x) => x.code === "Он");
    if (!v) return [];
    return (v.valueTexts ?? v.values).slice();
  }, [mapMetadata]);

  const mapData: MapDataItem[] = useMemo(() => {
    if (!mapDataset || !mapDimension) return [];
    const mapRows = jsonStatToRows(mapDataset);
    const byRegion = new Map<string, { sum: number; count: number }>();
    for (const r of mapRows) {
      const name = String(r[mapDimension] ?? "").trim();
      if (!name) continue;
      const val = Number(r.value);
      if (Number.isNaN(val)) continue;
      const cur = byRegion.get(name);
      if (!cur) byRegion.set(name, { sum: val, count: 1 });
      else {
        cur.sum += val;
        cur.count += 1;
      }
    }
    return Array.from(byRegion.entries()).map(([name, { sum, count }]) => ({
      name,
      value: count > 0 ? sum / count : 0,
    }));
  }, [mapDataset, mapDimension]);

  useEffect(() => {
    if (!birthRateMapApiUrl) return;
    let cancelled = false;
    getPxMetadata(birthRateMapApiUrl)
      .then((meta) => {
        if (!cancelled) {
          setBirthRateMapMetadata(meta);
          const yearVar = meta.variables.find((v) => v.code === "Он");
          const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
          if (yearLabels.length > 0) {
            setBirthRateMapYear((prev) => prev || yearLabels[yearLabels.length - 1]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setBirthRateMapMetadata(null);
      });
    return () => { cancelled = true; };
  }, [birthRateMapApiUrl]);

  useEffect(() => {
    if (!birthRateMapMetadata || !birthRateMapApiUrl || !birthRateMapDimension) return;
    const yearVar = birthRateMapMetadata.variables.find((v) => v.code === "Он");
    const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
    const yearValues = yearVar?.values ?? [];
    const yearLabel = birthRateMapYear || (yearLabels.length > 0 ? yearLabels[yearLabels.length - 1] : "");
    const yearIdx = yearLabels.indexOf(yearLabel);
    const yearValue = yearIdx >= 0 && yearValues[yearIdx] != null ? yearValues[yearIdx] : yearValues[yearValues.length - 1];
    const busVar = birthRateMapMetadata.variables.find((v) => v.code === birthRateMapDimension);
    const busValues = busVar?.values ?? [];
    const busValuesForMap = busValues.length > 1 ? busValues.slice(1) : busValues;
    let cancelled = false;
    setBirthRateMapLoading(true);
    const query = birthRateMapMetadata.variables.map((v) => {
      if (v.code === "Үзүүлэлт") return { code: v.code, selection: { filter: "item" as const, values: ["3"] } };
      if (v.code === "Он" && yearValue != null) return { code: v.code, selection: { filter: "item" as const, values: [yearValue] } };
      if (v.code === birthRateMapDimension) return { code: v.code, selection: { filter: "item" as const, values: busValuesForMap.length > 0 ? busValuesForMap : v.values } };
      return { code: v.code, selection: { filter: "item" as const, values: v.values } };
    });
    getPxData(birthRateMapApiUrl, { query, response: { format: "json-stat2" } })
      .then((data) => {
        if (!cancelled) setBirthRateMapDataset(data);
      })
      .catch(() => {
        if (!cancelled) setBirthRateMapDataset(null);
      })
      .finally(() => {
        if (!cancelled) setBirthRateMapLoading(false);
      });
    return () => { cancelled = true; };
  }, [birthRateMapApiUrl, birthRateMapMetadata, birthRateMapDimension, birthRateMapYear]);

  useEffect(() => {
    if (!deathRateMapApiUrl) return;
    let cancelled = false;
    getPxMetadata(deathRateMapApiUrl)
      .then((meta) => {
        if (!cancelled) {
          setDeathRateMapMetadata(meta);
          const yearVar = meta.variables.find((v) => v.code === "Он");
          const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
          if (yearLabels.length > 0) {
            setDeathRateMapYear((prev) => prev || yearLabels[yearLabels.length - 1]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setDeathRateMapMetadata(null);
      });
    return () => { cancelled = true; };
  }, [deathRateMapApiUrl]);

  useEffect(() => {
    if (!deathRateMapMetadata || !deathRateMapApiUrl || !deathRateMapDimension) return;
    const yearVar = deathRateMapMetadata.variables.find((v) => v.code === "Он");
    const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
    const yearValues = yearVar?.values ?? [];
    const yearLabel = deathRateMapYear || (yearLabels.length > 0 ? yearLabels[yearLabels.length - 1] : "");
    const yearIdx = yearLabels.indexOf(yearLabel);
    const yearValue = yearIdx >= 0 && yearValues[yearIdx] != null ? yearValues[yearIdx] : yearValues[yearValues.length - 1];
    const busVar = deathRateMapMetadata.variables.find((v) => v.code === deathRateMapDimension);
    const busValues = busVar?.values ?? [];
    const busValuesForMap = busValues.length > 1 ? busValues.slice(1) : busValues;
    let cancelled = false;
    setDeathRateMapLoading(true);
    const deathGenderVar = deathRateMapMetadata.variables.find((v) => v.code === "Хүйс");
    const query = deathRateMapMetadata.variables.map((v) => {
      if (v.code === "Он" && yearValue != null) return { code: v.code, selection: { filter: "item" as const, values: [yearValue] } };
      if (v.code === "Хүйс" && deathGenderVar?.values?.length) return { code: v.code, selection: { filter: "item" as const, values: [deathGenderVar.values[0]] } };
      if (v.code === deathRateMapDimension) return { code: v.code, selection: { filter: "item" as const, values: busValuesForMap.length > 0 ? busValuesForMap : v.values } };
      return { code: v.code, selection: { filter: "item" as const, values: v.values } };
    });
    getPxData(deathRateMapApiUrl, { query, response: { format: "json-stat2" } })
      .then((data) => {
        if (!cancelled) setDeathRateMapDataset(data);
      })
      .catch(() => {
        if (!cancelled) setDeathRateMapDataset(null);
      })
      .finally(() => {
        if (!cancelled) setDeathRateMapLoading(false);
      });
    return () => { cancelled = true; };
  }, [deathRateMapApiUrl, deathRateMapMetadata, deathRateMapDimension, deathRateMapYear]);

  const deathRateMapData: MapDataItem[] = useMemo(() => {
    if (!deathRateMapDataset || !deathRateMapDimension) return [];
    const mapRows = jsonStatToRows(deathRateMapDataset);
    const byRegion = new Map<string, { sum: number; count: number }>();
    for (const r of mapRows) {
      const name = String(r[deathRateMapDimension] ?? "").trim();
      if (!name) continue;
      const val = Number(r.value);
      if (Number.isNaN(val)) continue;
      const cur = byRegion.get(name);
      if (!cur) byRegion.set(name, { sum: val, count: 1 });
      else {
        cur.sum += val;
        cur.count += 1;
      }
    }
    return Array.from(byRegion.entries()).map(([name, { sum, count }]) => ({
      name,
      value: count > 0 ? sum / count : 0,
    }));
  }, [deathRateMapDataset, deathRateMapDimension]);

  // Дундаж наслалтын газрын зураг
  useEffect(() => {
    if (!lifeExpectancyMapApiUrl) return;
    let cancelled = false;
    getPxMetadata(lifeExpectancyMapApiUrl)
      .then((meta) => {
        if (!cancelled) {
          setLifeExpectancyMapMetadata(meta);
          const yearVar = meta.variables.find((v) => v.code === "Он");
          const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
          if (yearLabels.length > 0) {
            const defaultYear = yearLabels.includes("2024") ? "2024" : yearLabels[yearLabels.length - 1];
            setLifeExpectancyMapYear((prev) => prev || defaultYear);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setLifeExpectancyMapMetadata(null);
      });
    return () => { cancelled = true; };
  }, [lifeExpectancyMapApiUrl]);

  useEffect(() => {
    if (!lifeExpectancyMapMetadata || !lifeExpectancyMapApiUrl || !lifeExpectancyMapDimension) return;
    const yearVar = lifeExpectancyMapMetadata.variables.find((v) => v.code === "Он");
    const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
    const yearValues = yearVar?.values ?? [];
    const yearLabel = lifeExpectancyMapYear || (yearLabels.length > 0 ? yearLabels[yearLabels.length - 1] : "");
    const yearIdx = yearLabels.indexOf(yearLabel);
    const yearValue = yearIdx >= 0 && yearValues[yearIdx] != null ? yearValues[yearIdx] : yearValues[yearValues.length - 1];
    const aimgVar = lifeExpectancyMapMetadata.variables.find((v) => v.code === lifeExpectancyMapDimension);
    const aimgValues = aimgVar?.values ?? [];
    let cancelled = false;
    setLifeExpectancyMapLoading(true);
    const query = lifeExpectancyMapMetadata.variables.map((v) => {
      if (v.code === "Он" && yearValue != null) return { code: v.code, selection: { filter: "item" as const, values: [yearValue] } };
      if (v.code === "Хүйс") return { code: v.code, selection: { filter: "item" as const, values: ["0"] } };
      if (v.code === lifeExpectancyMapDimension) return { code: v.code, selection: { filter: "item" as const, values: aimgValues } };
      return { code: v.code, selection: { filter: "item" as const, values: v.values } };
    });
    getPxData(lifeExpectancyMapApiUrl, { query, response: { format: "json-stat2" } })
      .then((data) => {
        if (!cancelled) setLifeExpectancyMapDataset(data);
      })
      .catch(() => {
        if (!cancelled) setLifeExpectancyMapDataset(null);
      })
      .finally(() => {
        if (!cancelled) setLifeExpectancyMapLoading(false);
      });
    return () => { cancelled = true; };
  }, [lifeExpectancyMapApiUrl, lifeExpectancyMapMetadata, lifeExpectancyMapDimension, lifeExpectancyMapYear]);

  // Улсын дундаж наслалт API (039V1) metadata татах
  useEffect(() => {
    if (!lifeExpectancyNationalApiUrl) return;
    let cancelled = false;
    getPxMetadata(lifeExpectancyNationalApiUrl)
      .then((m) => {
        if (!cancelled) setLifeExpectancyNationalMetadata(m);
      })
      .catch(() => {
        if (!cancelled) setLifeExpectancyNationalMetadata(null);
      });
    return () => { cancelled = true; };
  }, [lifeExpectancyNationalApiUrl]);

  // Улсын дундаж наслалт API (039V1) data татах
  useEffect(() => {
    if (!lifeExpectancyNationalMetadata || !lifeExpectancyNationalApiUrl) return;
    const yearVar = lifeExpectancyNationalMetadata.variables.find((v) => v.code === "Он");
    const yearLabels = yearVar?.valueTexts ?? yearVar?.values ?? [];
    const yearValues = yearVar?.values ?? [];
    const yearLabel = lifeExpectancyMapYear || (yearLabels.length > 0 ? yearLabels[yearLabels.length - 1] : "");
    const yearIdx = yearLabels.indexOf(yearLabel);
    const yearValue = yearIdx >= 0 && yearValues[yearIdx] != null ? yearValues[yearIdx] : yearValues[yearValues.length - 1];
    let cancelled = false;
    const query = lifeExpectancyNationalMetadata.variables.map((v) => {
      if (v.code === "Он" && yearValue != null) return { code: v.code, selection: { filter: "item" as const, values: [yearValue] } };
      if (v.code === "Хүйс") return { code: v.code, selection: { filter: "item" as const, values: ["0"] } }; // Бүгд
      return { code: v.code, selection: { filter: "item" as const, values: v.values } };
    });
    getPxData(lifeExpectancyNationalApiUrl, { query, response: { format: "json-stat2" } })
      .then((ds) => {
        if (!cancelled) setLifeExpectancyNationalDataset(ds);
      })
      .catch(() => {
        if (!cancelled) setLifeExpectancyNationalDataset(null);
      });
    return () => { cancelled = true; };
  }, [lifeExpectancyNationalApiUrl, lifeExpectancyNationalMetadata, lifeExpectancyMapYear]);

  const lifeExpectancyMapData: MapDataItem[] = useMemo(() => {
    if (!lifeExpectancyMapDataset || !lifeExpectancyMapDimension) return [];
    const mapRows = jsonStatToRows(lifeExpectancyMapDataset);
    const byRegion = new Map<string, { sum: number; count: number }>();
    for (const r of mapRows) {
      const name = String(r[lifeExpectancyMapDimension] ?? "").trim();
      if (!name) continue;
      const val = Number(r.value);
      if (Number.isNaN(val)) continue;
      const cur = byRegion.get(name);
      if (!cur) byRegion.set(name, { sum: val, count: 1 });
      else {
        cur.sum += val;
        cur.count += 1;
      }
    }
    return Array.from(byRegion.entries()).map(([name, { sum, count }]) => ({
      name,
      value: count > 0 ? sum / count : 0,
    }));
  }, [lifeExpectancyMapDataset, lifeExpectancyMapDimension]);

  const lifeExpectancyNationalAvg = useMemo(() => {
    if (!lifeExpectancyNationalDataset) return null;
    const rows = jsonStatToRows(lifeExpectancyNationalDataset);
    const val = rows[0]?.value;
    return typeof val === "number" && !Number.isNaN(val) ? val : null;
  }, [lifeExpectancyNationalDataset]);

  const lifeExpectancyMapYears = useMemo(() => {
    if (!lifeExpectancyMapMetadata) return [];
    const v = lifeExpectancyMapMetadata.variables.find((x) => x.code === "Он");
    if (!v) return [];
    return (v.valueTexts ?? v.values).slice();
  }, [lifeExpectancyMapMetadata]);

  const birthRateMapYears = useMemo(() => {
    if (!birthRateMapMetadata) return [];
    const v = birthRateMapMetadata.variables.find((x) => x.code === "Он");
    if (!v) return [];
    return (v.valueTexts ?? v.values).slice();
  }, [birthRateMapMetadata]);

  const birthRateMapData: MapDataItem[] = useMemo(() => {
    if (!birthRateMapDataset || !birthRateMapDimension) return [];
    const mapRows = jsonStatToRows(birthRateMapDataset);
    const byRegion = new Map<string, { sum: number; count: number }>();
    for (const r of mapRows) {
      const name = String(r[birthRateMapDimension] ?? "").trim();
      if (!name) continue;
      const val = Number(r.value);
      if (Number.isNaN(val)) continue;
      const cur = byRegion.get(name);
      if (!cur) byRegion.set(name, { sum: val, count: 1 });
      else {
        cur.sum += val;
        cur.count += 1;
      }
    }
    return Array.from(byRegion.entries()).map(([name, { sum, count }]) => ({
      name,
      value: count > 0 ? sum / count : 0,
    }));
  }, [birthRateMapDataset, birthRateMapDimension]);

  const handleSelectionChange = useCallback((code: string, values: string[]) => {
    setSelections((prev) => ({ ...prev, [code]: values.length > 0 ? values : prev[code] ?? [] }));
  }, []);

  const getLatestDimensionValue = useCallback(
    (meta: PxMetadata, dimCode: string): string | undefined => {
      const v = meta.variables.find((x) => x.code === dimCode);
      return v?.values?.[v.values.length - 1];
    },
    []
  );

  const firstTrendChart = charts.find(
    (c) => c.type === "line" || c.type === "area" || c.type === "combo"
  );

  const hasFilterSection =
    (hasLevels && levelKeys.length > 0) ||
    !!metadata ||
    config.id === "society-education" ||
    (!!mapApiUrl && config.id !== "population");

  return (
    <div className="min-w-0 w-full space-y-4">
      {hasFilterSection && config.id !== "gdp" && config.id !== "household-survey" && config.id !== "unemployment" && (
        <div className="space-y-2 pb-4 pt-3">
          {/* Гарчиг + тайлбар */}
          <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
            <div
              className={
                (config.id === "cpi" && hasLevels && levelKeys.length > 0) ||
                (config.id === "business-register" && metadata)
                  ? "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                  : ""
              }
            >
              <div className="min-w-0 flex-1">
                <h1 className="text-head-title">
                  {config.shortTitle ?? config.name}
                </h1>
                {(config.introText ?? config.description) && (
                  <p className="text-sm font-normal leading-snug text-[var(--muted-foreground)] line-clamp-2 mt-1">
                    {config.introText ?? config.description}
                  </p>
                )}
              </div>
              {config.id === "business-register" && metadata && (
                <div className="flex w-full shrink-0 justify-stretch sm:w-auto sm:justify-end sm:pt-0">
                  <DashboardFilters
                    variables={metadata.variables}
                    selections={selections}
                    onSelectionChange={handleSelectionChange}
                    loading={loading}
                    hiddenVariables={["Эдийн засгийн салбар", "Улирал"]}
                    slicerWider
                    labelOverrides={(() => {
                      const hideAll: Record<string, string> = {};
                      metadata.variables.forEach((v) => {
                        hideAll[v.code] = "";
                      });
                      return hideAll;
                    })()}
                    slicerOnly
                  />
                </div>
              )}
              {config.id === "cpi" && hasLevels && levelKeys.length > 0 && (
                <div className="flex shrink-0 justify-end sm:pt-0.5">
                  <Segmented
                    size="small"
                    className="segmented-pill"
                    value={selectedLevel}
                    onChange={(key) => setSelectedLevel(key as string)}
                    options={levelKeys.map((key) => ({ label: CPI_LEVEL_LABELS[key] ?? key, value: key }))}
                  />
                </div>
              )}
            </div>
          </div>

          {config.id === "society-education" && (
            <div className="flex flex-wrap items-center justify-start gap-2 pt-1">
              <div className="filter-btn-group filter-btn-group--multiline max-w-full">
                {[
                  { value: "0", label: "Цэцэрлэг" },
                  { value: "1", label: "Ерөнхий боловсролын сургууль" },
                  { value: "5", label: "Техникийн болон мэргэжлийн боловсролын сургалтын байгууллага" },
                  { value: "8", label: "Дээд боловсролын сургалтын байгууллага" },
                ].map(({ value, label }) => {
                  const isSelected = (selections["Ангилал"]?.[0] ?? "0") === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSelectionChange("Ангилал", [value])}
                      disabled={loading}
                      className={`whitespace-normal text-xs sm:text-sm ${isSelected ? "active" : ""}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {config.id === "money-finance" && (
            <div className="border-b border-slate-200 dark:border-slate-700">
              <nav
                className="flex justify-center gap-10 px-2 pt-2 pb-0 sm:gap-16"
                aria-label="Мөнгө, санхүү"
              >
                {(["table", "chart", "rate"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setLoanViewMode(v)}
                    className={`relative pb-3 text-[0.9375rem] transition-colors ${
                      loanViewMode === v
                        ? "font-semibold text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[#0050C3] dark:text-slate-100 dark:after:bg-blue-400"
                        : "font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    {v === "table" ? "Хүснэгт" : v === "chart" ? "Зээл" : "Ханш"}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {config.id === "balance-of-payments" && (
            <div className="border-b border-slate-200 py-3 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-0" />
                <div className="flex items-center gap-8 shrink-0">
                  {(["table", "chart"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBopViewMode(v)}
                      className={`text-sm pb-1.5 border-b-2 transition-colors ${
                        bopViewMode === v
                          ? "border-blue-500 font-semibold text-slate-900 dark:text-slate-100"
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                      }`}
                    >
                      {v === "table" ? "Хүснэгт" : "Дүрслэл"}
                    </button>
                  ))}
                </div>
                <div className="flex min-w-0 flex-1 justify-end">
                  <select
                    value={bopMonthFilter}
                    onChange={(e) => setBopMonthFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={String(m)}>
                        {m} сар
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {config.id === "state-budget" && (
            <div className="py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-0" />
                <div className="flex items-center gap-6 shrink-0">
                  {(["Жил", "Сар"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBudgetPeriodTab(v)}
                      className={`text-sm pb-1 border-b-2 transition-colors ${
                        budgetPeriodTab === v
                          ? "text-slate-900 dark:text-slate-100 font-medium border-blue-500"
                          : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-w-0" />
              </div>
            </div>
          )}

          {config.id === "foreign-trade" && (
            <div className="py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-0" />
                <div className="flex items-center gap-6 shrink-0">
                  {(["Жил", "Сар"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTradePeriodTab(v)}
                      className={`text-sm pb-1 border-b-2 transition-colors ${
                        tradePeriodTab === v
                          ? "text-slate-900 dark:text-slate-100 font-medium border-blue-500"
                          : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="flex-1 min-w-0" />
              </div>
            </div>
          )}

          {metadata && config.id !== "gdp" && config.id !== "household-survey" && config.id !== "population" && config.id !== "unemployment" && config.id !== "average-salary" && config.id !== "foreign-trade" && config.id !== "balance-of-payments" && config.id !== "money-finance" && config.id !== "test" && config.id !== "society-education" && config.id !== "business-register" && !(config.id === "state-budget" && budgetPeriodTab === "Жил") && !(config.id === "cpi" && hasLevels && levelKeys.length > 0) && (
            <div className="socio-dash-scroll-touch flex flex-wrap items-center gap-3 justify-end overflow-x-auto border-b border-slate-200 pb-3 scrollbar-hide">
              {hasLevels && levelKeys.length > 0 && (
                <Segmented
                  size="small"
                  className="segmented-pill"
                  value={selectedLevel}
                  onChange={(key) => setSelectedLevel(key as string)}
                  options={levelKeys.map((key) => ({ label: CPI_LEVEL_LABELS[key] ?? key, value: key }))}
                />
              )}
              <div>
                <DashboardFilters
                  variables={
                    config.id === "household-survey"
                      ? (() => {
                          const suurshilVar = metadata.variables.find((v) => v.code === "Суурьшил");
                          const filtered: typeof metadata.variables = [];
                          if (suurshilVar) filtered.push(suurshilVar);
                          return filtered;
                        })()
                      : config.id === "state-budget" && budgetPeriodTab === "Жил"
                        ? (() => {
                            const yearlyMeta = metadataByChartId["budget-balance-yearly"];
                            const onVar = yearlyMeta?.variables?.find((v) => v.code === "Он");
                            return onVar ? [onVar] : metadata.variables;
                          })()
                      : metadata.variables
                  }
                  selections={selections}
                  onSelectionChange={handleSelectionChange}
                  loading={loading}
                  busSingleSelect={config.id === "cpi"}
                  hiddenVariables={
                    config.id === "cpi"
                      ? selectedLevel === "нийслэл"
                        ? ["Он", "ОН", "Сар", "Бүс", "Бүлэг", "Суурь он", "Үзүүлэлт"]
                        : ["Он", "ОН", "Сар", "Бүлэг", "Суурь он", "Үзүүлэлт"]
                      : config.id === "ppi"
                        ? ["Дэд салбар", "Үзүүлэлт", "Сар"]
                        : config.id === "housing-prices"
                          ? ["Суурь хугацаа", "Сар", "CAP", "Үзүүлэлт"]
                          : config.id === "unemployment"
                            ? ["Бүс", "Статистик үзүүлэлт", "Насны бүлэг", "Хүйс", "Улирал"]
                            : config.id === "household-survey"
                              ? []
                              : config.id === "average-salary"
                                ? ["Улирал", "Хүйс", "Ажил мэргэжлийн ангилал", "Бүс", "Аймаг", "Салбар", "Өмчийн хэлбэр", "Хариуцлагын хэлбэр", "Ажиллагчдын тооны бүлэг"]
                                : config.id === "population"
                                  ? ["Он", "ОН", "Хүм амын тоо", "Бүс"]
                                  : config.id === "state-budget"
                                    ? budgetPeriodTab === "Жил"
                                      ? ["ОН", "Сар", "Үзүүлэлт", "Ангилал"]
                                      : ["Он", "ОН", "Сар", "Үзүүлэлт", "Ангилал"]
                                    : config.id === "business-register"
                                      ? ["Эдийн засгийн салбар", "Улирал"]
                                      : config.id === "cpi-commodity-prices"
                                        ? ["Хугацаа"]
                                        : ["Он", "ОН"]
                  }
                  slicerWider={config.id === "business-register"}
                  checkboxSlicerVariables={config.id === "state-budget" && budgetPeriodTab === "Жил" ? ["Он"] : undefined}
                  labelOverrides={(() => {
                    const hideAll: Record<string, string> = {};
                    metadata.variables.forEach(v => { hideAll[v.code] = ""; });
                    return hideAll;
                  })()}
                  slicerOnly={true}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {!apiUrl && config.id !== "society-education" && (
        <div className="rounded-md border border-[var(--card-border)] bg-[var(--card-bg-muted)] p-5 text-center chart-section-label text-[var(--muted-foreground)]">
          Энэ дашбоард одоогоор бэлтгэгдэж байна. Тун удахгүй нээгдэх болно.
        </div>
      )}


      {((metadata &&
          (rows.length > 0 ||
            Object.keys(chartDataByChartId).some((id) => (chartDataByChartId[id]?.length ?? 0) > 0) ||
            Object.keys(computedNetGrowthByChartId).some((id) => (computedNetGrowthByChartId[id]?.length ?? 0) > 0))) ||
        (config.id === "society-education" && charts.length > 0) ||
        (mapApiUrl && config.id !== "population")) && (
        <>
          <div className="space-y-6">
          {charts.map((chart, chartIndex) => {
          // Дундаж наслалтын trend chart-г тусад нь render хийдэг тул энд алгасах
          if (chart.id === "population-life-expectancy-trend") return null;
          // Улсын төсөв — Сар tab-д жилийн chart нуух; Жил tab-д зөвхөн жилийн chart
          if (config.id === "state-budget" && budgetPeriodTab === "Сар" && chart.id === "budget-balance-yearly") return null;
          if (config.id === "state-budget" && budgetPeriodTab === "Жил" && chart.id !== "budget-balance-yearly" && chart.id !== "budget-unified-income-yearly" && chart.id !== "budget-unified-expense-yearly") return null;

          // Төлбөрийн тэнцэл — өссөн дүнгийн хүснэгт, сар шүүлт
          if (config.id === "balance-of-payments" && chart.id === "bop-table") {
            const bopRows = chartDataByChartId["bop-table"] ?? [];
            const bopMeta = metadataByChartId["bop-table"] ?? metadata;
            if (bopRows.length === 0) {
              return (
                <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                  Төлбөрийн тэнцлийн мэдээлэл татагдаж байна...
                </div>
              );
            }

            const indVar = bopMeta?.variables?.find((v) => v.code === "Үзүүлэлт");
            const sarVar = bopMeta?.variables?.find((v) => v.code === "Сар" || v.text === "Сар");

            const monthIdxToYearMonth = (idx: number) => {
              if (!sarVar || !sarVar.values?.length) return { year: 0, month: 1 };
              const code = sarVar.values[idx];
              const label = String(sarVar.valueTexts?.[idx] ?? code ?? "").trim();
              const yMatch = /(20\d{2}|19\d{2})/.exec(label);
              const mMatch =
                /(\d{1,2})\s*сар|M(\d{2})|[-.](\d{1,2})\b/.exec(label) || [null, "1", "01", "01"];
              const year = yMatch ? parseInt(yMatch[0]!, 10) : 0;
              const month = parseInt(mMatch[1] ?? mMatch[2] ?? mMatch[3] ?? "1", 10) || 1;
              return { year, month };
            };

            const parseBopLabel = (raw: string): { text: string; isTopLevel: boolean; depth: number } => {
              const s = String(raw ?? "").trimStart();
              const romanMatch = s.match(/^(I{1,3}|IV|V|VI{0,3})\s*\.\s*(.*)$/i);
              if (romanMatch) return { text: romanMatch[2].trim(), isTopLevel: true, depth: 0 };
              const numMatch = s.match(/^(\d+(?:\.\d+)*)\.?\s*(.*)$/);
              if (numMatch) {
                const depth = numMatch[1].split(".").length;
                return { text: numMatch[2].trim(), isTopLevel: false, depth };
              }
              return { text: s.trim(), isTopLevel: false, depth: 1 };
            };

            const yearToMaxMonth = new Map<number, number>();
            for (const r of bopRows) {
              const sarCode = r["Сар_code"];
              const idx = typeof sarCode === "string" ? parseInt(sarCode, 10) : typeof sarCode === "number" ? sarCode : -1;
              if (Number.isNaN(idx) || idx < 0) continue;
              const { year, month } = monthIdxToYearMonth(idx);
              const cur = yearToMaxMonth.get(year) ?? 0;
              yearToMaxMonth.set(year, Math.max(cur, month));
            }
            const latestYearInData = yearToMaxMonth.size ? Math.max(...yearToMaxMonth.keys()) : 0;

            const M = parseInt(bopMonthFilter, 10) || 12;
            // Сонгосон сард өгөгдөлтэй жилүүд: тухайн сард ядаж нэг мөр байвал тухайн жилийн багана/цуваа харуулна.
            const yearsWithDataForSelectedMonth = new Set<number>();
            for (const r of bopRows) {
              const sarCode = r["Сар_code"];
              const idx = typeof sarCode === "string" ? parseInt(sarCode, 10) : typeof sarCode === "number" ? sarCode : -1;
              if (Number.isNaN(idx) || idx < 0) continue;
              const { year, month } = monthIdxToYearMonth(idx);
              if (month === M) yearsWithDataForSelectedMonth.add(year);
            }

            const byYearInd = new Map<number, Map<string, number>>();

            // API-с тухайн сарын дүн ирнэ; өссөн дүнг жил бүр 1–12 сарыг нэмж тооцно.
            for (const r of bopRows) {
              const sarCode = r["Сар_code"];
              const idx = typeof sarCode === "string" ? parseInt(sarCode, 10) : typeof sarCode === "number" ? sarCode : -1;
              if (Number.isNaN(idx) || idx < 0) continue;
              const { year, month } = monthIdxToYearMonth(idx);
              if (!yearsWithDataForSelectedMonth.has(year)) continue;
              const cap = year === latestYearInData
                ? (yearToMaxMonth.get(year) ?? 12)
                : Math.min(M, 12);
              if (month > cap) continue;
              const val = Number(r.value) || 0;
              const indCode = String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "");

              if (!byYearInd.has(year)) byYearInd.set(year, new Map());
              const cur = byYearInd.get(year)!;
              cur.set(indCode, (cur.get(indCode) ?? 0) + val);
            }

            const years = [...byYearInd.keys()].filter((y) => yearsWithDataForSelectedMonth.has(y)).sort((a, b) => a - b);
            const indCodesFromData = new Set(bopRows.map((r) => String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "")));
            const indCodesOrderedTable = BOP_TABLE_INDICATOR_VALUES.filter((c) => indCodesFromData.has(c));
            const indCodesOrderedChart = BOP_CHART_INDICATOR_VALUES.filter((c) => indCodesFromData.has(c));
            const allIndCodes = [...new Set([...indCodesOrderedTable, ...indCodesOrderedChart])];
            const codeToParsed = new Map<string, { text: string; isTopLevel: boolean; depth: number }>();
            for (const code of allIndCodes) {
              const i = indVar?.values?.indexOf(code) ?? -1;
              const raw = i >= 0 && indVar?.valueTexts?.[i] ? String(indVar.valueTexts[i]) : "";
              codeToParsed.set(code, parseBopLabel(raw));
            }
            const INDENT_PER_LEVEL = 24;
            const lastYear = years[years.length - 1];
            const prevYear = years.length >= 2 ? years[years.length - 2] : null;

            const calcChangePct = (code: string): string => {
              if (prevYear == null) return "—";
              const v1 = byYearInd.get(prevYear)?.get(code);
              const v2 = byYearInd.get(lastYear)?.get(code);
              if (v1 == null || v2 == null || !Number.isFinite(v1) || !Number.isFinite(v2)) return "—";
              if (v1 === 0) return v2 !== 0 ? "—" : "—";
              const pct = ((v2 - v1) / Math.abs(v1)) * 100;
              return Number.isFinite(pct) ? `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%` : "—";
            };

            if (bopViewMode === "chart") {
              const BOP_CHART_COLOR = "#0050C3";
              const yearsChart2009 = years.filter((y) => y >= 2009);
              const nYears = yearsChart2009.length;
              const defaultStartIdx = 0;
              const isDefaultRange = bopChartRange[0] === 0 && bopChartRange[1] === 0;
              const effectiveStart = nYears > 0
                ? (isDefaultRange ? defaultStartIdx : Math.max(0, Math.min(bopChartRange[0], nYears - 1)))
                : 0;
              const effectiveEnd = nYears > 0
                ? (isDefaultRange ? nYears - 1 : Math.max(effectiveStart, Math.min(bopChartRange[1], nYears - 1)))
                : 0;
              const displayYears = yearsChart2009.slice(effectiveStart, effectiveEnd + 1);
              const hasTopChart = indCodesOrderedChart.includes(BOP_CHART_TOP_CODE);
              bopChartPlayRef.current = { n: nYears, range: [effectiveStart, effectiveEnd] };

              const BOP_LABEL_OVERRIDES: Record<string, string> = {
                "44": "Багцын Х/О",
                "51": "Санхүүгийн үүсмэл",
                "65": "Алдаа болон орхигдуулга",
              };
              const BOP_ROW_2_COLOR = "#14b8a6";
              const BOP_ROW_3_COLOR = "#C0504D";
              const formatSaiUsd = (v: number) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 })} сая $`;
              const bopAreaGradient = (top: string, bottom: string) => ({
                type: "linear" as const,
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: top },
                  { offset: 1, color: bottom },
                ],
              });
              const renderBopChart = (
                code: string,
                chartHeight: number,
                _titleSize: string,
                titleOverride?: string,
                colorVariant?: "green" | "orange",
                hero?: boolean
              ) => {
                const label = titleOverride ?? BOP_LABEL_OVERRIDES[code] ?? codeToParsed.get(code)?.text ?? code;
                const negate = colorVariant === "green";
                const rawData = displayYears.map((y) => byYearInd.get(y)?.get(code) ?? null);
                const dataArr = rawData.map((v) => (v != null && Number.isFinite(v) && negate ? -v : v));
                const rawLatest = lastYear != null ? byYearInd.get(lastYear)?.get(code) : null;
                const latestVal = rawLatest != null && Number.isFinite(rawLatest) && negate ? -rawLatest : rawLatest;
                const latestStr = latestVal != null && Number.isFinite(latestVal)
                  ? formatSaiUsd(latestVal)
                  : "—";
                const lineColor = colorVariant === "green" ? BOP_ROW_2_COLOR : colorVariant === "orange" ? BOP_ROW_3_COLOR : BOP_CHART_COLOR;
                const areaStyle =
                  colorVariant === "green"
                    ? { color: bopAreaGradient("rgba(20, 184, 166, 0.38)", "rgba(20, 184, 166, 0.06)") }
                    : colorVariant === "orange"
                      ? { color: bopAreaGradient("rgba(192, 80, 77, 0.38)", "rgba(192, 80, 77, 0.06)") }
                      : { color: bopAreaGradient("rgba(0, 80, 195, 0.32)", "rgba(0, 80, 195, 0.05)") };
                const titleClass = hero
                  ? "text-base font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400"
                  : colorVariant === "green"
                    ? "text-xs font-bold uppercase tracking-tight text-teal-700 dark:text-teal-400"
                    : colorVariant === "orange"
                      ? "text-xs font-bold uppercase tracking-tight text-amber-900 dark:text-amber-600"
                      : "text-xs font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400";
                const chartOption: EChartsOption = {
                  grid: { left: 44, right: 16, top: 40, bottom: 32 },
                  tooltip: {
                    trigger: "axis",
                    borderColor: "#0d9488",
                    borderWidth: 1,
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    confine: true,
                    padding: [12, 16],
                    extraCssText: "min-width: 160px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                    textStyle: { color: "#f1f5f9", fontSize: 12 },
                    formatter: (params: unknown) => {
                      const p = Array.isArray(params) ? params : [];
                      const axisValue = p[0]?.axisValue ?? "";
                      const periodLabel = `${String(axisValue)} он, ${M} сар`;
                      const rows = p
                        .filter((item: { value?: number }) => item.value != null)
                        .map((item: { seriesName?: string; value?: number }) => {
                          const valStr = formatSaiUsd(Number(item.value));
                          return `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                            <span style="color:#94a3b8;font-size:12px;">${item.seriesName ?? ""}</span>
                            <span style="color:#f1f5f9;font-weight:600;">${valStr}</span>
                          </div>`;
                        });
                      return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                        <span style="color:#2dd4bf;font-size:14px;">◉</span>
                        <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${periodLabel}</span>
                      </div>${rows.join("")}`;
                    },
                  },
                  xAxis: {
                    type: "category",
                    data: displayYears.map(String),
                    axisLine: { lineStyle: { color: "#e2e8f0" } },
                    axisLabel: { color: "#64748b", fontSize: 11, showMinLabel: true, showMaxLabel: true },
                  },
                  yAxis: {
                    type: "value",
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: "#64748b", fontSize: 10, formatter: (v: number) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                    splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
                  },
                  series: [{
                    name: label,
                    type: "line",
                    smooth: true,
                    symbol: "none",
                    lineStyle: { color: lineColor, width: 2 },
                    itemStyle: { color: lineColor },
                    areaStyle,
                    data: dataArr,
                  }],
                };
                return (
                  <div key={code} className="space-y-2">
                    <div>
                      <h4 className={titleClass}>{label}</h4>
                      <p className={`mt-1 ${hero ? "text-base" : "text-sm"}`}>
                        <span className={hero ? "text-2xl font-bold text-slate-900 dark:text-slate-100" : `font-semibold ${colorVariant === "green" ? "text-teal-700 dark:text-teal-400" : colorVariant === "orange" ? "text-amber-900 dark:text-amber-600" : "text-[#0050C3] dark:text-blue-400"}`}>
                          {latestStr}
                        </span>
                        {lastYear != null && (
                          <span className={`ml-1.5 text-slate-500 dark:text-slate-400 ${hero ? "text-base font-normal" : ""}`}>
                            ({lastYear})
                          </span>
                        )}
                      </p>
                    </div>
                    <ReactECharts option={chartOption} style={{ height: chartHeight }} notMerge />
                  </div>
                );
              };

              return (
                <div key={chart.id} className="space-y-6">
                  {hasTopChart && (
                    <div className="w-full">
                      {renderBopChart(BOP_CHART_TOP_CODE, 400, "text-lg", "Төлбөрийн тэнцэл (нөөц хөрөнгө)", undefined, true)}
                    </div>
                  )}
                  {nYears > 1 && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          bopChartPlayRef.current = { n: nYears, range: [effectiveStart, effectiveEnd] };
                          if (!bopChartIsPlaying) {
                            const atEnd = effectiveEnd >= nYears - 1;
                            const stuck = effectiveStart === effectiveEnd;
                            if (stuck) {
                              setBopChartRange([0, Math.min(5, nYears - 1)]);
                              bopChartPlayRef.current.range = [0, Math.min(5, nYears - 1)];
                            } else if (atEnd) {
                              const win = Math.min(6, nYears);
                              setBopChartRange([0, win - 1]);
                              bopChartPlayRef.current.range = [0, win - 1];
                            }
                          }
                          setBopChartIsPlaying((p) => !p);
                        }}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={bopChartIsPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={bopChartIsPlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {bopChartIsPlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[3.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {String(yearsChart2009[effectiveStart] ?? "")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={nYears - 1}
                            value={[effectiveStart, effectiveEnd]}
                            onChange={(v) => {
                              setBopChartRange(v);
                              bopChartPlayRef.current.range = v;
                              setBopChartIsPlaying(false);
                            }}
                            labels={yearsChart2009.map(String)}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[3.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                          {String(yearsChart2009[effectiveEnd] ?? "")}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-6">
                    <div className="!grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                      {BOP_CHART_ROW_1.filter((c) => indCodesOrderedChart.includes(c)).map((code) => renderBopChart(code, 220, "text-sm", undefined, undefined))}
                    </div>
                    <div className="!grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                      {BOP_CHART_ROW_2.filter((c) => indCodesOrderedChart.includes(c)).map((code) => renderBopChart(code, 220, "text-sm", undefined, "green"))}
                    </div>
                    <div className="!grid grid-cols-1 gap-4 md:grid-cols-2">
                      {BOP_CHART_ROW_3.filter((c) => indCodesOrderedChart.includes(c)).map((code) =>
                        renderBopChart(code, 240, "text-sm", code === "65" ? "Алдаа болон орхигдуулга" : undefined, "orange")
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            const yearsFrom2009 = years.filter((y) => y >= 2009);
            const nYears = yearsFrom2009.length;
            const defaultStartIdx = Math.max(0, yearsFrom2009.findIndex((y) => y >= 2022));
            const isDefaultRange = bopChartRange[0] === 0 && bopChartRange[1] === 0;
            const effectiveStart = nYears > 0
              ? (isDefaultRange ? defaultStartIdx : Math.max(0, Math.min(bopChartRange[0], nYears - 1)))
              : 0;
            const effectiveEnd = nYears > 0
              ? (isDefaultRange ? nYears - 1 : Math.max(effectiveStart, Math.min(bopChartRange[1], nYears - 1)))
              : 0;
            const displayYears = yearsFrom2009.slice(effectiveStart, effectiveEnd + 1);
            // Өөрчлөлт — slicer-ийн эхний он, сүүлийн оны өөрчлөлт
            const tableFirstYear = displayYears.length >= 1 ? displayYears[0]! : null;
            const tableLastYear = displayYears.length >= 1 ? displayYears[displayYears.length - 1]! : null;
            const hasChangeCol = tableFirstYear != null && tableLastYear != null && tableFirstYear !== tableLastYear;

            return (
              <div key={chart.id} className="space-y-4">
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                  <table className="w-full min-w-[640px] text-sm" style={{ borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }}>
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800">
                        <th rowSpan={2} className="border-b border-r border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-600 dark:text-slate-300">
                          Үзүүлэлт
                        </th>
                        <th
                          colSpan={displayYears.length + (hasChangeCol ? 1 : 0)}
                          className="border-b border-slate-200 px-2 py-1.5 text-right text-xs font-normal text-slate-500 dark:border-slate-600 dark:text-slate-400"
                        >
                          сая $
                        </th>
                      </tr>
                      <tr className="bg-slate-100 dark:bg-slate-800">
                        {displayYears.map((y) => (
                          <th key={y} className="border-b border-slate-200 px-2 py-2 text-right text-xs font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-200">
                            {y}
                          </th>
                        ))}
                        {hasChangeCol && (
                          <th className="border-b border-slate-200 px-2 py-2 text-right text-xs font-semibold text-slate-800 dark:border-slate-600 dark:text-slate-200">
                            Өөрчлөлт ({tableLastYear}-{tableFirstYear})
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let detailRow = 0;
                        return indCodesOrderedTable.map((code) => {
                        const p = codeToParsed.get(code)!;
                        const isGray = p.isTopLevel;
                        const padLeft = 12 + p.depth * INDENT_PER_LEVEL;
                        const dr = !isGray ? detailRow++ : -1;
                        const zebra =
                          !isGray && dr >= 0
                            ? dr % 2 === 1
                              ? "bg-slate-50/90 dark:bg-slate-800/40"
                              : "bg-white dark:bg-slate-900/20"
                            : "";
                        const calcChangeDun = () => {
                          if (tableFirstYear == null || tableLastYear == null) return "—";
                          const v1 = byYearInd.get(tableFirstYear)?.get(code);
                          const v2 = byYearInd.get(tableLastYear)?.get(code);
                          if (v1 == null || v2 == null || !Number.isFinite(v1) || !Number.isFinite(v2)) return "—";
                          const d = v2 - v1;
                          return Number.isFinite(d) ? (d >= 0 ? "+" : "") + Math.round(d).toLocaleString() : "—";
                        };
                        return (
                          <tr
                            key={code}
                            className={`border-b border-slate-100 transition-colors hover:bg-slate-100/60 dark:border-slate-700/80 dark:hover:bg-slate-800/50 ${
                              isGray ? "bg-slate-100 dark:bg-slate-800/70" : zebra
                            }`}
                          >
                            <td className="border-r border-slate-200 py-2 text-left dark:border-slate-600" style={{ paddingLeft: padLeft }}>
                              <span className={isGray ? "text-sm font-bold text-slate-800 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}>
                                {p.text || code}
                              </span>
                            </td>
                            {displayYears.map((y) => {
                              const val = byYearInd.get(y)?.get(code) ?? null;
                              const n = val != null ? Number(val) : NaN;
                              const str = Number.isFinite(n) ? Math.round(n).toLocaleString() : "—";
                              return (
                                <td key={y} className={`px-2 py-2 text-right tabular-nums ${isGray ? "text-sm font-bold text-slate-900 dark:text-slate-50" : "text-slate-800 dark:text-slate-200"}`}>
                                  {str}
                                </td>
                              );
                            })}
                            {hasChangeCol && (
                              <td
                                className={`px-2 py-2 text-right text-sm tabular-nums ${
                                  isGray ? "font-bold text-slate-900 dark:text-slate-50" : "font-semibold text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {calcChangeDun()}
                              </td>
                            )}
                          </tr>
                        );
                      });
                      })()}
                    </tbody>
                  </table>
                </div>
                {nYears > 1 && (
                  <div className="pt-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <RangeSlider
                          min={0}
                          max={nYears - 1}
                          value={[effectiveStart, effectiveEnd]}
                          onChange={(v) => setBopChartRange(v)}
                          labels={yearsFrom2009.map(String)}
                          showLabels={false}
                        />
                      </div>
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <span>{yearsFrom2009[effectiveStart]}</span>
                      <span>{yearsFrom2009[effectiveEnd]}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Ханш — 2 area chart зэрэгцүүлэн (REER, NEER)
          if (config.id === "money-finance" && chart.id === "loan-rate") {
            if (loanViewMode !== "rate") return null;
            const rateRows = (chartDataByChartId["loan-rate"] ?? []) as DataRow[];
            if (rateRows.length === 0) {
              return (
                <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)] mt-10">
                  Ханшийн өгөгдөл татагдаж байна...
                </div>
              );
            }
            const indCodeKey = "Үзүүлэлт_code";
            const sarCodeKey = "Сар_code";
            const rateBaseYears = moneyFinanceBaseYears.length > 0 ? moneyFinanceBaseYears : [...new Set(rateRows.map((r) => parseInt(String(r.Сар ?? r[sarCodeKey]).slice(0, 4), 10)))].filter((y) => y >= 2000).sort((a, b) => a - b);
            const rateNYears = rateBaseYears.length;
            const isRateDefaultRange = moneyFinanceRange[0] === 0 && moneyFinanceRange[1] === 0;
            const rateDefaultStartIdx = (() => {
              const idx2017 = rateBaseYears.indexOf(2017);
              if (idx2017 >= 0) return idx2017;
              return rateNYears >= 2 ? rateNYears - 2 : 0;
            })();
            const rateEffectiveStart = rateNYears > 0 ? (isRateDefaultRange ? rateDefaultStartIdx : Math.max(0, Math.min(moneyFinanceRange[0], rateNYears - 1))) : 0;
            const rateEffectiveEnd = rateNYears > 0 ? (isRateDefaultRange ? rateNYears - 1 : Math.max(rateEffectiveStart, Math.min(moneyFinanceRange[1], rateNYears - 1))) : 0;
            const rateDisplayYears = rateBaseYears.slice(rateEffectiveStart, rateEffectiveEnd + 1);
            const rateRangeYears: [string, string] | undefined = rateDisplayYears.length >= 1 ? [`${rateDisplayYears[0]}-01`, `${rateDisplayYears[rateDisplayYears.length - 1]}-12`] : undefined;
            const startYearRate = rateRangeYears ? parseInt(rateRangeYears[0].slice(0, 4), 10) : 0;
            const endYearRate = rateRangeYears ? parseInt(rateRangeYears[1].slice(0, 4), 10) : 9999;
            const buildRateChartData = (indCode: string) => {
              const filtered = rateRows
                .filter((r) => String(r[indCodeKey] ?? r["Үзүүлэлт"] ?? "") === indCode)
                .map((r) => ({ Сар: String(r.Сар ?? r[sarCodeKey] ?? ""), value: Number(r.value) ?? 0 } as DataRow))
                .sort((a, b) => String(a.Сар).localeCompare(String(b.Сар)));
              return rateRangeYears
                ? filtered.filter((r) => {
                    const y = parseInt(String(r.Сар).slice(0, 4), 10);
                    return y >= startYearRate && y <= endYearRate;
                  })
                : filtered;
            };
            let rateCharts = EXCHANGE_RATE_INDICATOR_VALUES.filter((code) =>
              rateRows.some((r) => String(r[indCodeKey] ?? r["Үзүүлэлт"] ?? "") === code)
            ).map((code) => ({
              code,
              title: EXCHANGE_RATE_INDICATOR_LABELS[code] ?? code,
              data: buildRateChartData(code),
            }));
            if (rateCharts.length === 0 && rateRows.length > 0) {
              const codesInData = [...new Set(rateRows.map((r) => String(r[indCodeKey] ?? r["Үзүүлэлт"] ?? "")).filter(Boolean))];
              rateCharts = codesInData.map((code) => ({
                code,
                title: EXCHANGE_RATE_INDICATOR_LABELS[code] ?? code,
                data: buildRateChartData(code),
              }));
            }
            const rateFormatter = (v: number) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 1 })}`;

            return (
              <div key={chart.id} className="mt-6">
                <h3 className="chart-section-title mb-4 text-base sm:text-lg">Ханшийн индекс</h3>
                <div className="!grid w-full min-w-0 grid-cols-2 gap-4">
                  {rateCharts.map((rc) => (
                    <div key={rc.code} className="min-w-0 space-y-1">
                      <h4 className="chart-section-title mb-1 text-base sm:text-lg leading-snug text-[var(--foreground)]">
                        {rc.title}
                      </h4>
                      <ChartTrend
                        data={rc.data}
                        xKey="Сар"
                        title=""
                        hideHeader={true}
                        showRangeSlider={false}
                        widePlot
                        valueFormatter={rateFormatter}
                        axisFormatter={rateFormatter}
                        tooltipUnit=""
                        latestValueFormatter={rateFormatter}
                        forceGradientArea={true}
                        colorVariant="default"
                        seriesColorMap={{ value: "#0050C3" }}
                        yGridLineStyle="dashed"
                        chartHeight={380}
                        valueAxisTitle={null}
                        yAxisMin={rc.code === "0" ? 80 : rc.code === "1" ? 20 : undefined}
                        yAxisMax={rc.code === "0" ? 150 : rc.code === "1" ? 50 : undefined}
                        noHeaderMargin
                        chartMarginTop={4}
                        latestValueMarginClass="mt-1"
                      />
                    </div>
                  ))}
                </div>
                {rateNYears > 1 && (
                  <div className="mf-slider-row">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          loanChartPlayRef.current = { n: rateNYears, range: [rateEffectiveStart, rateEffectiveEnd] };
                          if (!loanChartIsPlaying) {
                            const atEnd = rateEffectiveEnd >= rateNYears - 1;
                            const stuck = rateEffectiveStart === rateEffectiveEnd;
                            if (stuck) {
                              const defStart = rateNYears >= 2 ? rateNYears - 2 : 0;
                              setMoneyFinanceRange([defStart, rateNYears - 1]);
                              loanChartPlayRef.current.range = [defStart, rateNYears - 1];
                            } else if (atEnd) {
                              const win = Math.min(6, rateNYears);
                              const defStart = Math.max(0, rateNYears - win);
                              setMoneyFinanceRange([defStart, rateNYears - 1]);
                              loanChartPlayRef.current.range = [defStart, rateNYears - 1];
                            }
                          }
                          setLoanChartIsPlaying((p) => !p);
                        }}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-0 text-[#0050C3] shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={loanChartIsPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={loanChartIsPlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {loanChartIsPlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[3.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">{rateBaseYears[rateEffectiveStart]}</span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={rateNYears - 1}
                            value={[rateEffectiveStart, rateEffectiveEnd]}
                            onChange={(v) => {
                              setMoneyFinanceRange(v);
                              loanChartPlayRef.current = { n: rateNYears, range: v };
                              setLoanChartIsPlaying(false);
                            }}
                            labels={rateBaseYears.map(String)}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[3.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">{rateBaseYears[rateEffectiveEnd]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Мөнгөний нийлүүлэлт — зөвхөн хүснэгт (зөвхөн Хүснэгт tab дээр)
          if (config.id === "money-finance" && chart.id === "money-supply-table") {
            if (loanViewMode !== "table") return null;
            const msRows = chartDataByChartId["money-supply-table"] ?? [];
            const msMeta = metadataByChartId["money-supply-table"] ?? metadata;
            if (msRows.length === 0) {
              return (
                <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                  Мөнгөний нийлүүлэлтийн мэдээлэл татагдаж байна...
                </div>
              );
            }

            const indVar = msMeta?.variables?.find((v) => v.code === "Үзүүлэлт");
            // Money Supply: idx 0=2026-01, 1=2025-12, 12=2025-01, 13=2024-12
            const monthIdxToYearMonth = (idx: number) => {
              const y = idx === 0 ? 2026 : 2026 - Math.ceil(idx / 12);
              const m = idx === 0 ? 1 : (idx % 12 === 0 ? 1 : 13 - (idx % 12));
              return { year: y, month: m };
            };

            const M = parseInt(moneyFinanceMonthFilter, 10) || 12;
            const byYearInd = new Map<number, Map<string, number>>();

            for (const r of msRows) {
              const sarCode = r["Сар_code"];
              const idx = typeof sarCode === "string" ? parseInt(sarCode, 10) : typeof sarCode === "number" ? sarCode : -1;
              if (Number.isNaN(idx) || idx < 0) continue;
              const { year, month } = monthIdxToYearMonth(idx);
              if (month !== M) continue;
              const val = Number(r.value) || 0;
              const indCode = String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "");

              if (!byYearInd.has(year)) byYearInd.set(year, new Map());
              const cur = byYearInd.get(year)!;
              cur.set(indCode, val);
            }

            const years = [...byYearInd.keys()].sort((a, b) => a - b);
            const indCodesOrdered = MONEY_SUPPLY_INDICATOR_VALUES.filter((c) =>
              msRows.some((r) => String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "") === c)
            );
            const MS_LABEL_OVERRIDES: Record<string, string> = {
              "0": "Мөнгөний нийлүүлэлт (M2)",
              "1": "Бага мөнгө (M1)",
            };
            const MS_DEPTH: Record<string, number> = {
              "0": 0, "1": 0, "2": 1, "3": 1, "4": 0, "5": 1, "6": 1, "7": 1, "8": 0,
            };
            const MS_INDENT_PER_LEVEL = 24;
            const codeToLabel = new Map<string, string>();
            const codeToDepth = new Map<string, number>();
            for (const code of indCodesOrdered) {
              const override = MS_LABEL_OVERRIDES[code];
              if (override) {
                codeToLabel.set(code, override);
              } else {
                const i = indVar?.values?.indexOf(code) ?? -1;
                const raw = i >= 0 && indVar?.valueTexts?.[i] ? String(indVar.valueTexts[i]) : code;
                codeToLabel.set(code, raw);
              }
              codeToDepth.set(code, MS_DEPTH[code] ?? 0);
            }

            const yearsFrom2000 = years.filter((y) => y >= 2000);
            const baseYears = moneyFinanceBaseYears.length > 0 ? moneyFinanceBaseYears : (yearsFrom2000.length > 0 ? yearsFrom2000 : years);
            const nYears = baseYears.length;
            const isDefaultRange = moneyFinanceRange[0] === 0 && moneyFinanceRange[1] === 0;
            const defaultStartIdx = (() => {
              const idx2017 = baseYears.indexOf(2017);
              return idx2017 >= 0 ? idx2017 : (nYears >= 2 ? nYears - 2 : 0);
            })();
            const effectiveStart = nYears > 0
              ? (isDefaultRange ? defaultStartIdx : Math.max(0, Math.min(moneyFinanceRange[0], nYears - 1)))
              : 0;
            const effectiveEnd = nYears > 0
              ? (isDefaultRange ? nYears - 1 : Math.max(effectiveStart, Math.min(moneyFinanceRange[1], nYears - 1)))
              : 0;
            const displayYears = baseYears.slice(effectiveStart, effectiveEnd + 1);
            // Өөрчлөлт, Өөрчлөлт % — slicer-ийн эхний он, сүүлийн оноос бодно (сүүлийн он - эхний он)
            const tableFirstYear = displayYears.length >= 1 ? displayYears[0]! : null;
            const tableLastYear = displayYears.length >= 1 ? displayYears[displayYears.length - 1]! : null;
            const hasChangeCol = tableFirstYear != null && tableLastYear != null && tableFirstYear !== tableLastYear;

            const formatTrg = (v: number) =>
              Number.isFinite(v) ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "—";

            return (
              <div key={chart.id} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="chart-section-title mb-1 text-base sm:text-lg">Мөнгөний үзүүлэлт</h3>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Тэрбум ₮</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={moneyFinanceMonthFilter}
                      onChange={(e) => setMoneyFinanceMonthFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-slate-600 dark:bg-slate-800"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={String(m)}>{m} сар</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/30">
                  <table className="w-full min-w-[600px] text-sm" style={{ borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }}>
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="w-[220px] min-w-[220px] max-w-[220px] border-b border-r border-slate-200 px-3 py-2 text-center font-medium dark:border-slate-600" style={{ fontFamily: "Arial, sans-serif" }}>Үзүүлэлт</th>
                        {displayYears.map((y) => (
                          <th key={y} className="border-b border-slate-200 px-2 py-2 text-right font-medium dark:border-slate-600" style={{ fontFamily: "Arial, sans-serif" }}>{y}</th>
                        ))}
                        {hasChangeCol && (
                          <>
                            <th className="border-b border-slate-200 px-2 py-2 text-right font-medium dark:border-slate-600" style={{ fontFamily: "Arial, sans-serif" }}>Өөрчлөлт ({tableLastYear}-{tableFirstYear})</th>
                            <th className="border-b border-slate-200 px-2 py-2 text-right font-medium dark:border-slate-600" style={{ fontFamily: "Arial, sans-serif" }}>Өөрчлөлт % ({tableLastYear}-{tableFirstYear})</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {indCodesOrdered.map((code, idx) => {
                        const label = codeToLabel.get(code) ?? code;
                        const depth = codeToDepth.get(code) ?? 0;
                        const padLeft = 12 + depth * MS_INDENT_PER_LEVEL;
                        const isTopLevel = depth === 0;
                        const calcChangeDun = () => {
                          if (tableFirstYear == null || tableLastYear == null) return "—";
                          const v1 = byYearInd.get(tableFirstYear)?.get(code);
                          const v2 = byYearInd.get(tableLastYear)?.get(code);
                          if (v1 == null || v2 == null || !Number.isFinite(v1) || !Number.isFinite(v2)) return "—";
                          const d = v2 - v1;
                          return Number.isFinite(d) ? (d >= 0 ? "+" : "") + formatTrg(d) : "—";
                        };
                        const calcChangePct = () => {
                          if (tableFirstYear == null || tableLastYear == null) return "—";
                          const v1 = byYearInd.get(tableFirstYear)?.get(code);
                          const v2 = byYearInd.get(tableLastYear)?.get(code);
                          if (v1 == null || v2 == null || !Number.isFinite(v1) || !Number.isFinite(v2)) return "—";
                          if (v1 === 0) return v2 !== 0 ? "—" : "—";
                          const pct = ((v2 - v1) / Math.abs(v1)) * 100;
                          return Number.isFinite(pct) ? `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%` : "—";
                        };
                        const rowBg = isTopLevel
                          ? "bg-slate-100/90 dark:bg-slate-800/70"
                          : idx % 2 === 0
                            ? "bg-white dark:bg-slate-900/25"
                            : "bg-slate-50/70 dark:bg-slate-800/25";
                        return (
                          <tr
                            key={code}
                            className={`border-b border-slate-100 dark:border-slate-700/50 ${rowBg} hover:brightness-[0.99] dark:hover:brightness-110`}
                          >
                            <td className="w-[220px] min-w-[220px] max-w-[220px] border-r border-slate-200 py-1.5 text-left dark:border-slate-600" style={{ paddingLeft: padLeft, fontFamily: "Arial, sans-serif" }}>
                              <span className={isTopLevel ? "text-slate-700 dark:text-slate-300 font-semibold" : ""}>{label}</span>
                            </td>
                            {displayYears.map((y) => {
                              const val = byYearInd.get(y)?.get(code) ?? null;
                              const n = val != null ? Number(val) : NaN;
                              const str = Number.isFinite(n) ? formatTrg(n) : "—";
                              return (
                                <td key={y} className={`px-2 py-1.5 text-right tabular-nums text-sm ${isTopLevel ? "font-bold" : ""}`} style={{ fontFamily: "Arial, sans-serif" }}>{str}</td>
                              );
                            })}
                            {hasChangeCol && (
                              <>
                                <td className={`px-2 py-1.5 text-right tabular-nums text-sm ${isTopLevel ? "font-bold" : ""}`} style={{ fontFamily: "Arial, sans-serif" }}>{calcChangeDun()}</td>
                                <td className={`px-2 py-1.5 text-right tabular-nums text-sm ${isTopLevel ? "font-bold" : ""}`} style={{ fontFamily: "Arial, sans-serif" }}>{calcChangePct()}</td>
                              </>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {loanViewMode === "table" && nYears > 1 && (
                  <div className="mt-4 pt-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          loanChartPlayRef.current = { n: nYears, range: [effectiveStart, effectiveEnd] };
                          if (!loanChartIsPlaying) {
                            const atEnd = effectiveEnd >= nYears - 1;
                            const stuck = effectiveStart === effectiveEnd;
                            if (stuck) {
                              const defStart = nYears >= 2 ? nYears - 2 : 0;
                              setMoneyFinanceRange([defStart, nYears - 1]);
                              loanChartPlayRef.current.range = [defStart, nYears - 1];
                            } else if (atEnd) {
                              const win = Math.min(6, nYears);
                              const defStart = Math.max(0, nYears - win);
                              setMoneyFinanceRange([defStart, nYears - 1]);
                              loanChartPlayRef.current.range = [defStart, nYears - 1];
                            }
                          }
                          setLoanChartIsPlaying((p) => !p);
                        }}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-[#0050C3] shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-[#0050C3] dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={loanChartIsPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={loanChartIsPlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {loanChartIsPlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">{baseYears[effectiveStart]}</span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={nYears - 1}
                            value={[effectiveStart, effectiveEnd]}
                            onChange={(v) => {
                              setMoneyFinanceRange(v);
                              loanChartPlayRef.current = { n: nYears, range: v };
                              setLoanChartIsPlaying(false);
                            }}
                            labels={baseYears.map(String)}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">{baseYears[effectiveEnd]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Зээлийн үзүүлэлт — хүснэгт (loanViewMode === "table")
          if (config.id === "money-finance" && chart.id === "loan-table") {
            if (loanViewMode !== "table") return null;
            const loanTableRows = (chartDataByChartId["loan-table"] ?? []) as DataRow[];
            const loanMeta = metadataByChartId["loan-table"] ?? metadata;
            if (loanTableRows.length === 0) {
              return (
                <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)] mt-10">
                  Зээлийн үзүүлэлтийн мэдээлэл татагдаж байна...
                </div>
              );
            }
            const sectorVar = loanMeta?.variables?.find((v) => v.code === "салбараар");
            const loanMonthIdxToYearMonth = (idx: number) => {
              const y = idx === 0 ? 2026 : 2026 - Math.ceil(idx / 12);
              const m = idx === 0 ? 1 : (idx % 12 === 0 ? 1 : 13 - (idx % 12));
              return { year: y, month: m };
            };
            const loanM = parseInt(moneyFinanceMonthFilter, 10) || 12;
            const byYearSector = new Map<number, Map<string, number>>();
            for (const r of loanTableRows) {
              const sarCode = r["Сар_code"];
              const idx = typeof sarCode === "string" ? parseInt(sarCode, 10) : typeof sarCode === "number" ? sarCode : -1;
              if (Number.isNaN(idx) || idx < 0) continue;
              const { year, month } = loanMonthIdxToYearMonth(idx);
              if (month !== loanM) continue;
              const val = Number(r.value) || 0;
              const indCode = String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "");
              const sectorCode = String(r["салбараар_code"] ?? r["салбараар"] ?? "");
              if (indCode !== loanIndicatorFilter) continue;
              if (!byYearSector.has(year)) byYearSector.set(year, new Map());
              const cur = byYearSector.get(year)!;
              cur.set(sectorCode, (cur.get(sectorCode) ?? 0) + val);
            }
            const sectorCodesOrdered = LOAN_SECTOR_VALUES.filter((c) =>
              loanTableRows.some((r) => String(r["салбараар_code"] ?? r["салбараар"] ?? "") === c)
            );
            const sectorCodeToLabel = new Map<string, string>();
            for (const code of sectorCodesOrdered) {
              const i = sectorVar?.values?.indexOf(code) ?? -1;
              sectorCodeToLabel.set(code, i >= 0 && sectorVar?.valueTexts?.[i] ? String(sectorVar.valueTexts[i]) : code);
            }
            const loanBaseYears = moneyFinanceBaseYears.length > 0 ? moneyFinanceBaseYears : [...byYearSector.keys()].filter((y) => y >= 2000).sort((a, b) => a - b);
            const loanNYears = loanBaseYears.length;
            const isLoanDefaultRange = moneyFinanceRange[0] === 0 && moneyFinanceRange[1] === 0;
            const loanDefaultStartIdx = (() => {
              const idx2017 = loanBaseYears.indexOf(2017);
              return idx2017 >= 0 ? idx2017 : (loanNYears >= 2 ? loanNYears - 2 : 0);
            })();
            const loanEffectiveStart = loanNYears > 0 ? (isLoanDefaultRange ? loanDefaultStartIdx : Math.max(0, Math.min(moneyFinanceRange[0], loanNYears - 1))) : 0;
            const loanEffectiveEnd = loanNYears > 0 ? (isLoanDefaultRange ? loanNYears - 1 : Math.max(loanEffectiveStart, Math.min(moneyFinanceRange[1], loanNYears - 1))) : 0;
            const loanDisplayYears = loanBaseYears.slice(loanEffectiveStart, loanEffectiveEnd + 1);
            const loanFirstYear = loanDisplayYears[0] ?? null;
            const loanLastYear = loanDisplayYears[loanDisplayYears.length - 1] ?? null;
            const hasLoanChangeCol = loanFirstYear != null && loanLastYear != null && loanFirstYear !== loanLastYear;
            const formatLoanTrg = (v: number) =>
              Number.isFinite(v) ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "—";

            return (
              <div key={chart.id} className="mt-10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="chart-section-title mb-1 text-base sm:text-lg">Зээлийн үзүүлэлт</h3>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Тэрбум ₮</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-600 dark:bg-slate-800/80">
                      {LOAN_INDICATOR_VALUES.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setLoanIndicatorFilter(code)}
                          className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                            loanIndicatorFilter === code
                              ? "bg-white font-medium text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                              : "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          }`}
                        >
                          {LOAN_INDICATOR_LABELS[code] ?? code}
                        </button>
                      ))}
                    </div>
                    <select
                      value={moneyFinanceMonthFilter}
                      onChange={(e) => setMoneyFinanceMonthFilter(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm dark:border-slate-600 dark:bg-slate-800"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={String(m)}>{m} сар</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/30">
                  <table className="w-full min-w-[600px] text-sm" style={{ borderCollapse: "collapse", fontFamily: "Arial, sans-serif" }}>
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="w-[220px] min-w-[220px] max-w-[220px] border-b border-r border-slate-200 px-3 py-2 text-center font-medium dark:border-slate-600">Салбараар</th>
                        {loanDisplayYears.map((y) => (
                          <th key={y} className="border-b border-slate-200 px-2 py-2 text-right font-medium dark:border-slate-600">{y}</th>
                        ))}
                        {hasLoanChangeCol && (
                          <>
                            <th className="border-b border-slate-200 px-2 py-2 text-right font-medium dark:border-slate-600">Өөрчлөлт ({loanLastYear}-{loanFirstYear})</th>
                            <th className="border-b border-slate-200 px-2 py-2 text-right font-medium dark:border-slate-600">Өөрчлөлт % ({loanLastYear}-{loanFirstYear})</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sectorCodesOrdered.map((code, idx) => {
                        const label = code === "0" ? (LOAN_INDICATOR_LABELS[loanIndicatorFilter] ?? loanIndicatorFilter) : (sectorCodeToLabel.get(code) ?? code);
                        const isTopLevel = code === "0";
                        const calcChange = () => {
                          if (!loanFirstYear || !loanLastYear) return "—";
                          const v1 = byYearSector.get(loanFirstYear)?.get(code);
                          const v2 = byYearSector.get(loanLastYear)?.get(code);
                          if (v1 == null || v2 == null || !Number.isFinite(v1) || !Number.isFinite(v2)) return "—";
                          const d = (v2 - v1) / 1000;
                          return Number.isFinite(d) ? (d >= 0 ? "+" : "") + formatLoanTrg(d) : "—";
                        };
                        const calcChangePct = () => {
                          if (!loanFirstYear || !loanLastYear) return "—";
                          const v1 = byYearSector.get(loanFirstYear)?.get(code);
                          const v2 = byYearSector.get(loanLastYear)?.get(code);
                          if (v1 == null || v2 == null || !Number.isFinite(v1) || !Number.isFinite(v2)) return "—";
                          if (v1 === 0) return v2 !== 0 ? "—" : "—";
                          const pct = ((v2 - v1) / Math.abs(v1)) * 100;
                          return Number.isFinite(pct) ? `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%` : "—";
                        };
                        const rowBg = isTopLevel
                          ? "border-l-4 border-sky-500 bg-sky-50/90 font-bold text-[#001C44] dark:border-sky-400 dark:bg-sky-950/40 dark:text-slate-100"
                          : idx % 2 === 1
                            ? "bg-slate-50/60 dark:bg-slate-800/25"
                            : "bg-white dark:bg-slate-900/20";
                        return (
                          <tr
                            key={code}
                            className={`border-b border-slate-100 dark:border-slate-700/50 ${rowBg} hover:brightness-[0.99] dark:hover:brightness-110`}
                          >
                            <td className={`w-[220px] min-w-[220px] max-w-[220px] border-r border-slate-200 py-1.5 text-left dark:border-slate-600 ${isTopLevel ? "px-3" : "pl-8 pr-3"}`}>{label}</td>
                              {loanDisplayYears.map((y) => {
                                const val = byYearSector.get(y)?.get(code) ?? null;
                                const n = val != null ? Number(val) / 1000 : NaN;
                                return (
                                  <td key={y} className={`px-2 py-1.5 text-right tabular-nums text-sm ${isTopLevel ? "font-bold" : ""}`}>{Number.isFinite(n) ? formatLoanTrg(n) : "—"}</td>
                                );
                              })}
                              {hasLoanChangeCol && (
                                <>
                                  <td className={`px-2 py-1.5 text-right tabular-nums text-sm ${isTopLevel ? "font-bold" : ""}`}>{calcChange()}</td>
                                  <td className={`px-2 py-1.5 text-right tabular-nums text-sm ${isTopLevel ? "font-bold" : ""}`}>{calcChangePct()}</td>
                                </>
                              )}
                            </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          // Зээлийн өр — 4 area chart (loanViewMode === "chart")
          if (config.id === "money-finance" && chart.id === "loan-balance-area") {
            if (loanViewMode !== "chart") return null;
            const loanTableRows = (chartDataByChartId["loan-table"] ?? []) as DataRow[];
            if (loanTableRows.length === 0) {
              return (
                <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)] mt-10">
                  Зээлийн үзүүлэлтийн мэдээлэл татагдаж байна...
                </div>
              );
            }

            const loanMonthIdxToYearMonth = (idx: number) => {
              const y = idx === 0 ? 2026 : 2026 - Math.ceil(idx / 12);
              const m = idx === 0 ? 1 : (idx % 12 === 0 ? 1 : 13 - (idx % 12));
              return { year: y, month: m };
            };

            const SECTOR_TO_SERIES: Record<string, string> = {
              "0": "Нийт зээл",
              "3": "Иргэд",
              "2": "Хувийн хэвшил",
              "1": "Бусад",
              "4": "Бусад",
              "5": "Бусад",
            };
            const byPeriodSeries = new Map<string, Record<string, number>>();

            for (const r of loanTableRows) {
              const indCode = String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "");
              if (indCode !== loanIndicatorFilter) continue;
              const sarCode = r["Сар_code"];
              const idx = typeof sarCode === "string" ? parseInt(sarCode, 10) : typeof sarCode === "number" ? sarCode : -1;
              if (Number.isNaN(idx) || idx < 0) continue;
              const { year, month } = loanMonthIdxToYearMonth(idx);
              const period = `${year}-${String(month).padStart(2, "0")}`;
              const val = Number(r.value) || 0;
              const sectorCode = String(r["салбараар_code"] ?? r["салбараар"] ?? "");
              const seriesName = SECTOR_TO_SERIES[sectorCode];
              if (!seriesName) continue;
              if (!byPeriodSeries.has(period)) byPeriodSeries.set(period, {});
              const cur = byPeriodSeries.get(period)!;
              cur[seriesName] = (cur[seriesName] ?? 0) + val;
            }

            const periods = [...byPeriodSeries.keys()].sort();
            const seriesNames = ["Нийт зээл", "Иргэд", "Хувийн хэвшил", "Бусад"];
            const loanAreaData: DataRow[] = periods.map((period) => {
              const row: DataRow = { Сар: period };
              const vals = byPeriodSeries.get(period) ?? {};
              for (const s of seriesNames) {
                (row as Record<string, number>)[s] = ((vals[s] ?? 0) / 1000);
              }
              return row;
            });

            const loanBaseYears = moneyFinanceBaseYears.length > 0 ? moneyFinanceBaseYears : [...new Set(periods.map((p) => parseInt(p.slice(0, 4), 10)))].filter((y) => y >= 2000).sort((a, b) => a - b);
            const loanNYears = loanBaseYears.length;
            const isLoanDefaultRange = moneyFinanceRange[0] === 0 && moneyFinanceRange[1] === 0;
            const loanDefaultStartIdx = loanNYears >= 2 ? loanNYears - 2 : 0;
            const loanEffectiveStart = loanNYears > 0 ? (isLoanDefaultRange ? loanDefaultStartIdx : Math.max(0, Math.min(moneyFinanceRange[0], loanNYears - 1))) : 0;
            const loanEffectiveEnd = loanNYears > 0 ? (isLoanDefaultRange ? loanNYears - 1 : Math.max(loanEffectiveStart, Math.min(moneyFinanceRange[1], loanNYears - 1))) : 0;
            const loanDisplayYears = loanBaseYears.slice(loanEffectiveStart, loanEffectiveEnd + 1);
            const loanRangeYears: [string, string] | undefined = loanDisplayYears.length >= 1
              ? [`${loanDisplayYears[0]}-01`, `${loanDisplayYears[loanDisplayYears.length - 1]}-12`]
              : undefined;

            const loanAreaFiltered = loanRangeYears
              ? loanAreaData.filter((r) => {
                  const y = parseInt(String(r.Сар).slice(0, 4), 10);
                  return y >= parseInt(loanRangeYears[0].slice(0, 4), 10) && y <= parseInt(loanRangeYears[1].slice(0, 4), 10);
                })
              : loanAreaData;

            const loanAreaForChart = loanAreaFiltered.map((r) => {
              const out: DataRow = { Сар: r.Сар };
              for (const s of seriesNames) {
                (out as Record<string, number>)[s] = (r as Record<string, number>)[s] ?? 0;
              }
              return out;
            });

            const loanChartsDataRaw = seriesNames.map((s) =>
              loanAreaForChart.map((r) => ({ Сар: r.Сар, value: (r as Record<string, number>)[s] ?? 0 } as DataRow))
            );
            const loanChartsData = loanMetricMode === "growth"
              ? loanChartsDataRaw.map((rows) => {
                  const sorted = [...rows].sort((a, b) => String(a.Сар).localeCompare(String(b.Сар)));
                  let prev = 0;
                  return sorted.map((r) => {
                    const curr = Number(r.value) || 0;
                    const growth = prev ? ((curr - prev) / prev) * 100 : 0;
                    prev = curr;
                    return { ...r, value: Math.round(growth * 10) / 10 } as DataRow;
                  });
                })
              : loanChartsDataRaw;
            const growthFormatter = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
            const growthAxisFormatter = (v: number) => `${v.toFixed(0)}%`;

            const niceLoanYMax = (vals: number[]) => {
              const m = Math.max(0, ...vals.map((x) => Number(x) || 0));
              if (m <= 0) return 100;
              const p = m * 1.12;
              const exp = Math.floor(Math.log10(p));
              const pow10 = Math.pow(10, exp);
              const n = p / pow10;
              const top = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
              return top * pow10;
            };

            return (
              <div key={chart.id} className="mt-6">
                <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="chart-section-title text-base sm:text-lg">Зээлийн өрийн үлдэгдэл</h3>
                  <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <div className="mf-pill-wrap">
                      {LOAN_INDICATOR_VALUES.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setLoanIndicatorFilter(code)}
                          className={loanIndicatorFilter === code ? "mf-pill-active" : ""}
                        >
                          {LOAN_INDICATOR_LABELS[code] ?? code}
                        </button>
                      ))}
                    </div>
                    <div className="mf-pill-wrap">
                      <button
                        type="button"
                        onClick={() => setLoanMetricMode("value")}
                        className={loanMetricMode === "value" ? "mf-pill-active" : ""}
                      >
                        Дүн
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoanMetricMode("growth")}
                        className={loanMetricMode === "growth" ? "mf-pill-active" : ""}
                      >
                        Өөрчлөлт %
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-8">
                  {(
                    [
                      ["Нийт зээл", "Иргэд"],
                      ["Хувийн хэвшил", "Бусад"],
                    ] as const
                  ).map((pair, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="!grid w-full min-w-0 grid-cols-2 gap-4"
                    >
                      {pair.map((name) => {
                        const i = seriesNames.indexOf(name);
                        const seriesVals = (loanChartsData[i] ?? []).map((r) => Number((r as DataRow).value) || 0);
                        const yMax = loanMetricMode === "growth" ? undefined : niceLoanYMax(seriesVals);
                        return (
                          <div key={name} className="min-w-0 space-y-1">
                            <h4 className="chart-section-title text-base sm:text-lg text-[var(--foreground)]">
                              {name}
                            </h4>
                            <ChartTrend
                              data={loanChartsData[i] ?? []}
                              xKey="Сар"
                              title=""
                              hideHeader={true}
                              showRangeSlider={false}
                              widePlot
                              rangeYears={loanRangeYears}
                              onRangeYearsChange={(start, end) => {
                                const startY = parseInt(start.slice(0, 4), 10);
                                const endY = parseInt(end.slice(0, 4), 10);
                                const idxStart = loanBaseYears.indexOf(startY);
                                const idxEnd = loanBaseYears.indexOf(endY);
                                if (idxStart >= 0 && idxEnd >= 0) setMoneyFinanceRange([idxStart, idxEnd]);
                              }}
                              valueFormatter={loanMetricMode === "growth" ? growthFormatter : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} тэрбум ₮`}
                              axisFormatter={loanMetricMode === "growth" ? growthAxisFormatter : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                              tooltipUnit={loanMetricMode === "growth" ? "%" : ""}
                              latestValueFormatter={loanMetricMode === "growth" ? (v) => `${v >= 0 ? "+" : ""}${Number(v).toFixed(1)}%` : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} тэрбум ₮`}
                              forceGradientArea={loanMetricMode !== "growth"}
                              dashedSeriesLabels={loanMetricMode === "growth" ? ["value"] : undefined}
                              seriesColorMap={loanMetricMode === "growth" ? { value: "#10b981" } : { value: "#0050C3" }}
                              yGridLineStyle="dashed"
                              yAxisMin={loanMetricMode === "growth" ? undefined : 0}
                              yAxisMax={yMax}
                              chartHeight={loanMetricMode === "growth" ? 320 : 420}
                              valueAxisTitle={null}
                              noHeaderMargin
                              chartMarginTop={2}
                              latestValueMarginClass="mt-0.5"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {loanNYears > 1 && (
                  <div className="mf-slider-row">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          loanChartPlayRef.current = { n: loanNYears, range: [loanEffectiveStart, loanEffectiveEnd] };
                          if (!loanChartIsPlaying) {
                            const atEnd = loanEffectiveEnd >= loanNYears - 1;
                            const stuck = loanEffectiveStart === loanEffectiveEnd;
                            if (stuck) {
                              const defStart = loanNYears >= 2 ? loanNYears - 2 : 0;
                              setMoneyFinanceRange([defStart, loanNYears - 1]);
                              loanChartPlayRef.current.range = [defStart, loanNYears - 1];
                            } else if (atEnd) {
                              const win = Math.min(6, loanNYears);
                              const defStart = Math.max(0, loanNYears - win);
                              setMoneyFinanceRange([defStart, loanNYears - 1]);
                              loanChartPlayRef.current.range = [defStart, loanNYears - 1];
                            }
                          }
                          setLoanChartIsPlaying((p) => !p);
                        }}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-0 text-[#0050C3] shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={loanChartIsPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={loanChartIsPlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {loanChartIsPlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[3.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">{loanBaseYears[loanEffectiveStart]}</span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={loanNYears - 1}
                            value={[loanEffectiveStart, loanEffectiveEnd]}
                            onChange={(v) => {
                              setMoneyFinanceRange(v);
                              loanChartPlayRef.current = { n: loanNYears, range: v };
                              setLoanChartIsPlaying(false);
                            }}
                            labels={loanBaseYears.map(String)}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[3.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">{loanBaseYears[loanEffectiveEnd]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Иргэдэд олгосон зээлийн өрийн үлдэгдэл — Үзүүлэлт filter-тэй
          if (config.id === "money-finance" && chart.id === "loan-citizens-detail") {
            if (loanViewMode !== "chart") return null;
            const citizensRows = (chartDataByChartId["loan-citizens-detail"] ?? []) as DataRow[];
            if (citizensRows.length === 0) {
              return (
                <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)] mt-10">
                  Иргэдэд олгосон зээлийн өгөгдөл татагдаж байна...
                </div>
              );
            }
            const indCodeKey = "Үзүүлэлт_code";
            const sarCodeKey = "Сар_code";
            const filtered = citizensRows
              .filter((r) => String(r[indCodeKey] ?? r["Үзүүлэлт"] ?? "") === loanCitizensIndicatorFilter)
              .map((r) => ({ Сар: String(r.Сар ?? r[sarCodeKey] ?? ""), value: Number(r.value) ?? 0 } as DataRow))
              .sort((a, b) => String(a.Сар).localeCompare(String(b.Сар)));
            const citizensOwnYears = [...new Set(filtered.map((r) => parseInt(String(r.Сар).slice(0, 4), 10)))].filter((y) => y >= 2000).sort((a, b) => a - b);
            const citizensBaseYears = moneyFinanceBaseYears.length > 0 ? moneyFinanceBaseYears : citizensOwnYears;
            const citizensNYears = citizensBaseYears.length;
            const isCitizensDefaultRange = moneyFinanceRange[0] === 0 && moneyFinanceRange[1] === 0;
            const citizensDefaultStartIdx = citizensNYears >= 2 ? citizensNYears - 2 : 0;
            const citizensEffectiveStart = citizensNYears > 0 ? (isCitizensDefaultRange ? citizensDefaultStartIdx : Math.max(0, Math.min(moneyFinanceRange[0], citizensNYears - 1))) : 0;
            const citizensEffectiveEnd = citizensNYears > 0 ? (isCitizensDefaultRange ? citizensNYears - 1 : Math.max(citizensEffectiveStart, Math.min(moneyFinanceRange[1], citizensNYears - 1))) : 0;
            const citizensDisplayYears = citizensBaseYears.slice(citizensEffectiveStart, citizensEffectiveEnd + 1);
            const citizensRangeYears: [string, string] | undefined = citizensDisplayYears.length >= 1 ? [`${citizensDisplayYears[0]}-01`, `${citizensDisplayYears[citizensDisplayYears.length - 1]}-12`] : undefined;
            const startYear = citizensRangeYears ? parseInt(citizensRangeYears[0].slice(0, 4), 10) : 0;
            const endYear = citizensRangeYears ? parseInt(citizensRangeYears[1].slice(0, 4), 10) : 9999;
            const citizensFiltered = citizensRangeYears
              ? filtered.filter((r) => {
                  const y = parseInt(String(r.Сар).slice(0, 4), 10);
                  return y >= startYear && y <= endYear;
                })
              : filtered;
            const citizensChartDataRaw = citizensFiltered;
            const citizensChartData = loanCitizensMetricMode === "growth"
              ? (() => {
                  const prevYear = startYear - 1;
                  const forGrowth = filtered.filter((r) => {
                    const y = parseInt(String(r.Сар).slice(0, 4), 10);
                    return y >= prevYear && y <= endYear;
                  });
                  const sortedAll = [...forGrowth].sort((a, b) => String(a.Сар).localeCompare(String(b.Сар)));
                  const byPeriod = new Map<string, number>();
                  for (const r of sortedAll) {
                    byPeriod.set(String(r.Сар), Number(r.value) || 0);
                  }
                  const prev12Period = (p: string) => {
                    const [y, m] = p.split("-");
                    const yr = parseInt(y ?? "0", 10);
                    const mo = m ?? "01";
                    return `${yr - 1}-${mo}`;
                  };
                  const sortedInRange = [...citizensChartDataRaw].sort((a, b) => String(a.Сар).localeCompare(String(b.Сар)));
                  return sortedInRange.map((r) => {
                    const period = String(r.Сар);
                    const curr = byPeriod.get(period) ?? 0;
                    const prev12 = prev12Period(period);
                    const val12Ago = byPeriod.get(prev12) ?? 0;
                    const growth = val12Ago ? ((curr - val12Ago) / val12Ago) * 100 : 0;
                    return { ...r, value: Math.round(growth * 10) / 10 } as DataRow;
                  });
                })()
              : citizensChartDataRaw;
            const citizensGrowthFormatter = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
            const citizensGrowthAxisFormatter = (v: number) => `${v.toFixed(0)}%`;

            return (
              <div key={chart.id} className="mt-10 border-t border-slate-100 pt-8 dark:border-slate-700">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="chart-section-title max-w-xl leading-snug text-base sm:text-lg">
                    Иргэдэд олгосон зээлийн өрийн үлдэгдэл
                  </h3>
                  <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <div className="mf-pill-wrap">
                      <button
                        type="button"
                        onClick={() => setLoanCitizensMetricMode("value")}
                        className={loanCitizensMetricMode === "value" ? "mf-pill-active" : ""}
                      >
                        Дүн
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoanCitizensMetricMode("growth")}
                        className={loanCitizensMetricMode === "growth" ? "mf-pill-active" : ""}
                      >
                        Өөрчлөлт %
                      </button>
                    </div>
                    <select
                      value={loanCitizensIndicatorFilter}
                      onChange={(e) => setLoanCitizensIndicatorFilter(e.target.value)}
                      className="mf-select-clean dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                      {LOAN_CITIZENS_INDICATOR_VALUES.filter((code) =>
                        citizensRows.some((r) => String(r[indCodeKey] ?? r["Үзүүлэлт"] ?? "") === code)
                      ).map((code) => (
                        <option key={code} value={code}>
                          {LOAN_CITIZENS_INDICATOR_LABELS[code] ?? code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="min-w-0">
                  <ChartTrend
                    data={citizensChartData}
                    xKey="Сар"
                    title=""
                    hideHeader={true}
                    showRangeSlider={false}
                    valueFormatter={loanCitizensMetricMode === "growth" ? citizensGrowthFormatter : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} тэрбум ₮`}
                    axisFormatter={loanCitizensMetricMode === "growth" ? citizensGrowthAxisFormatter : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    tooltipUnit={loanCitizensMetricMode === "growth" ? "Жилийн өөрчлөлт %" : ""}
                    latestValueFormatter={loanCitizensMetricMode === "growth" ? (v) => `${v >= 0 ? "+" : ""}${Number(v).toFixed(1)}%` : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} тэрбум ₮`}
                    forceGradientArea={loanCitizensMetricMode !== "growth"}
                    dashedSeriesLabels={loanCitizensMetricMode === "growth" ? ["value"] : undefined}
                    seriesColorMap={loanCitizensMetricMode === "growth" ? { value: "#10b981" } : { value: "#0050C3" }}
                    yGridLineStyle="dashed"
                    chartHeight={420}
                    valueAxisTitle={null}
                    noHeaderMargin
                    chartMarginTop={4}
                    latestValueMarginClass="mt-1"
                  />
                </div>
                {citizensNYears > 1 && (
                  <div className="mf-slider-row">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          loanChartPlayRef.current = { n: citizensNYears, range: [citizensEffectiveStart, citizensEffectiveEnd] };
                          if (!loanChartIsPlaying) {
                            const atEnd = citizensEffectiveEnd >= citizensNYears - 1;
                            const stuck = citizensEffectiveStart === citizensEffectiveEnd;
                            if (stuck) {
                              const defStart = citizensNYears >= 2 ? citizensNYears - 2 : 0;
                              setMoneyFinanceRange([defStart, citizensNYears - 1]);
                              loanChartPlayRef.current.range = [defStart, citizensNYears - 1];
                            } else if (atEnd) {
                              const win = Math.min(6, citizensNYears);
                              const defStart = Math.max(0, citizensNYears - win);
                              setMoneyFinanceRange([defStart, citizensNYears - 1]);
                              loanChartPlayRef.current.range = [defStart, citizensNYears - 1];
                            }
                          }
                          setLoanChartIsPlaying((p) => !p);
                        }}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-0 text-[#0050C3] shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={loanChartIsPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={loanChartIsPlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {loanChartIsPlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[3.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">{citizensBaseYears[citizensEffectiveStart]}</span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={citizensNYears - 1}
                            value={[citizensEffectiveStart, citizensEffectiveEnd]}
                            onChange={(v) => {
                              setMoneyFinanceRange(v);
                              loanChartPlayRef.current = { n: citizensNYears, range: v };
                              setLoanChartIsPlaying(false);
                            }}
                            labels={citizensBaseYears.map(String)}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[3.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">{citizensBaseYears[citizensEffectiveEnd]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Иргэдэд олгосон ипотекийн зээлийн өрийн үлдэгдэл — 2 area chart зэрэгцүүлэн
          if (config.id === "money-finance" && chart.id === "loan-ipotek-detail") {
            if (loanViewMode !== "chart") return null;
            const ipotekRows = (chartDataByChartId["loan-ipotek-detail"] ?? []) as DataRow[];
            if (ipotekRows.length === 0) {
              return (
                <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)] mt-10">
                  Ипотекийн зээлийн өгөгдөл татагдаж байна...
                </div>
              );
            }
            const indCodeKey = "Үзүүлэлт_code";
            const sarCodeKey = "Сар_code";
            const ipotekBaseYears = moneyFinanceBaseYears.length > 0 ? moneyFinanceBaseYears : [...new Set(ipotekRows.map((r) => parseInt(String(r.Сар ?? r[sarCodeKey]).slice(0, 4), 10)))].filter((y) => y >= 2000).sort((a, b) => a - b);
            const ipotekNYears = ipotekBaseYears.length;
            const isIpotekDefaultRange = moneyFinanceRange[0] === 0 && moneyFinanceRange[1] === 0;
            const ipotekDefaultStartIdx = ipotekNYears >= 2 ? ipotekNYears - 2 : 0;
            const ipotekEffectiveStart = ipotekNYears > 0 ? (isIpotekDefaultRange ? ipotekDefaultStartIdx : Math.max(0, Math.min(moneyFinanceRange[0], ipotekNYears - 1))) : 0;
            const ipotekEffectiveEnd = ipotekNYears > 0 ? (isIpotekDefaultRange ? ipotekNYears - 1 : Math.max(ipotekEffectiveStart, Math.min(moneyFinanceRange[1], ipotekNYears - 1))) : 0;
            const ipotekDisplayYears = ipotekBaseYears.slice(ipotekEffectiveStart, ipotekEffectiveEnd + 1);
            const ipotekRangeYears: [string, string] | undefined = ipotekDisplayYears.length >= 1 ? [`${ipotekDisplayYears[0]}-01`, `${ipotekDisplayYears[ipotekDisplayYears.length - 1]}-12`] : undefined;
            const startYearIpotek = ipotekRangeYears ? parseInt(ipotekRangeYears[0].slice(0, 4), 10) : 0;
            const endYearIpotek = ipotekRangeYears ? parseInt(ipotekRangeYears[1].slice(0, 4), 10) : 9999;
            const prevYearIpotek = startYearIpotek - 1;
            const buildIpotekChartData = (indCode: string, forGrowth: boolean) => {
              const filtered = ipotekRows
                .filter((r) => String(r[indCodeKey] ?? r["Үзүүлэлт"] ?? "") === indCode)
                .map((r) => ({ Сар: String(r.Сар ?? r[sarCodeKey] ?? ""), value: Number(r.value) ?? 0 } as DataRow))
                .sort((a, b) => String(a.Сар).localeCompare(String(b.Сар)));
              const inRange = ipotekRangeYears
                ? filtered.filter((r) => {
                    const y = parseInt(String(r.Сар).slice(0, 4), 10);
                    return y >= startYearIpotek && y <= endYearIpotek;
                  })
                : filtered;
              if (!forGrowth || loanIpotekMetricMode !== "growth") return inRange;
              const forGrowthData = filtered.filter((r) => {
                const y = parseInt(String(r.Сар).slice(0, 4), 10);
                return y >= prevYearIpotek && y <= endYearIpotek;
              });
              const byPeriod = new Map<string, number>();
              for (const r of forGrowthData) byPeriod.set(String(r.Сар), Number(r.value) || 0);
              const prev12Period = (p: string) => {
                const [y, m] = p.split("-");
                return `${parseInt(y ?? "0", 10) - 1}-${m ?? "01"}`;
              };
              return inRange.map((r) => {
                const period = String(r.Сар);
                const curr = byPeriod.get(period) ?? 0;
                const val12Ago = byPeriod.get(prev12Period(period)) ?? 0;
                const growth = val12Ago ? ((curr - val12Ago) / val12Ago) * 100 : 0;
                return { ...r, value: Math.round(growth * 10) / 10 } as DataRow;
              });
            };
            const ipotekCharts = LOAN_IPOTEK_INDICATOR_VALUES.filter((code) =>
              ipotekRows.some((r) => String(r[indCodeKey] ?? r["Үзүүлэлт"] ?? "") === code)
            ).map((code) => ({
              code,
              title: LOAN_IPOTEK_INDICATOR_LABELS[code] ?? code,
              data: buildIpotekChartData(code, loanIpotekMetricMode === "growth"),
              unit: code === "0" ? "тэрбум ₮" : "мян. хүн",
            }));
            const ipotekGrowthFormatter = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
            const ipotekGrowthAxisFormatter = (v: number) => `${v.toFixed(0)}%`;

            const niceIpotekYMax = (vals: number[]) => {
              const m = Math.max(0, ...vals.map((x) => Number(x) || 0));
              if (m <= 0) return 100;
              const p = m * 1.15;
              const exp = Math.floor(Math.log10(p));
              const pow10 = Math.pow(10, exp);
              const n = p / pow10;
              const top = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
              return top * pow10;
            };

            return (
              <div key={chart.id} className="mt-10 border-t border-slate-100 pt-8 dark:border-slate-700">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="chart-section-title text-base sm:text-lg">Ипотекийн зээл</h3>
                  <div className="mf-pill-wrap">
                    <button
                      type="button"
                      onClick={() => setLoanIpotekMetricMode("value")}
                      className={loanIpotekMetricMode === "value" ? "mf-pill-active" : ""}
                    >
                      Дүн
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoanIpotekMetricMode("growth")}
                      className={loanIpotekMetricMode === "growth" ? "mf-pill-active" : ""}
                    >
                      Өөрчлөлт %
                    </button>
                  </div>
                </div>
                <div className="!grid w-full min-w-0 grid-cols-2 gap-4">
                  {ipotekCharts.map((ic) => {
                    const vals = ic.data.map((r) => Number((r as DataRow).value) || 0);
                    const yMax =
                      loanIpotekMetricMode === "growth" ? undefined : niceIpotekYMax(vals);
                    return (
                      <div key={ic.code} className="min-w-0 space-y-1">
                        <h4 className="chart-section-title text-base sm:text-lg text-[var(--foreground)]">
                          {ic.title}
                        </h4>
                        <ChartTrend
                          data={ic.data}
                          xKey="Сар"
                          title=""
                          hideHeader={true}
                          showRangeSlider={false}
                          widePlot
                          valueFormatter={loanIpotekMetricMode === "growth" ? ipotekGrowthFormatter : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${ic.unit}`}
                          axisFormatter={loanIpotekMetricMode === "growth" ? ipotekGrowthAxisFormatter : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                          tooltipUnit={loanIpotekMetricMode === "growth" ? "Жилийн өөрчлөлт %" : ""}
                          latestValueFormatter={loanIpotekMetricMode === "growth" ? (v) => `${v >= 0 ? "+" : ""}${Number(v).toFixed(1)}%` : (v) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${ic.unit}`}
                          forceGradientArea={loanIpotekMetricMode !== "growth"}
                          colorVariant={loanIpotekMetricMode === "growth" ? "default" : "orange"}
                          seriesColorMap={
                            loanIpotekMetricMode === "growth"
                              ? { value: "#10b981" }
                              : { value: "#f5a623" }
                          }
                          yGridLineStyle="dashed"
                          dashedSeriesLabels={loanIpotekMetricMode === "growth" ? ["value"] : undefined}
                          yAxisMin={loanIpotekMetricMode === "growth" ? undefined : 0}
                          yAxisMax={yMax}
                          chartHeight={380}
                          valueAxisTitle={null}
                          noHeaderMargin
                          chartMarginTop={4}
                          latestValueMarginClass="mt-1"
                        />
                      </div>
                    );
                  })}
                </div>
                {ipotekNYears > 1 && (
                  <div className="mf-slider-row">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          loanChartPlayRef.current = { n: ipotekNYears, range: [ipotekEffectiveStart, ipotekEffectiveEnd] };
                          if (!loanChartIsPlaying) {
                            const atEnd = ipotekEffectiveEnd >= ipotekNYears - 1;
                            const stuck = ipotekEffectiveStart === ipotekEffectiveEnd;
                            if (stuck) {
                              const defStart = ipotekNYears >= 2 ? ipotekNYears - 2 : 0;
                              setMoneyFinanceRange([defStart, ipotekNYears - 1]);
                              loanChartPlayRef.current.range = [defStart, ipotekNYears - 1];
                            } else if (atEnd) {
                              const win = Math.min(6, ipotekNYears);
                              const defStart = Math.max(0, ipotekNYears - win);
                              setMoneyFinanceRange([defStart, ipotekNYears - 1]);
                              loanChartPlayRef.current.range = [defStart, ipotekNYears - 1];
                            }
                          }
                          setLoanChartIsPlaying((p) => !p);
                        }}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-0 text-[#0050C3] shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={loanChartIsPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={loanChartIsPlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {loanChartIsPlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[3.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">{ipotekBaseYears[ipotekEffectiveStart]}</span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={ipotekNYears - 1}
                            value={[ipotekEffectiveStart, ipotekEffectiveEnd]}
                            onChange={(v) => {
                              setMoneyFinanceRange(v);
                              loanChartPlayRef.current = { n: ipotekNYears, range: v };
                              setLoanChartIsPlaying(false);
                            }}
                            labels={ipotekBaseYears.map(String)}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[3.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">{ipotekBaseYears[ipotekEffectiveEnd]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // Түвшинээр шүүх: showOnlyForLevels байвал одоогийн түвшин тэнд багтах ёстой
          if (chart.showOnlyForLevels && chart.showOnlyForLevels.length > 0) {
            if (!chart.showOnlyForLevels.includes(selectedLevel)) return null;
          }
          
          if (chart.type === "line" || chart.type === "area" || chart.type === "combo") {
            const threeCol = config.threeColumnChartIds;
            if (threeCol?.length && threeCol.includes(chart.id) && chart.id !== threeCol[0]) return null;
            if (config.educationBottomChartId && chart.id === config.educationBottomChartId) return null;

            const twoCol = config.twoColumnLayout;
            if (twoCol) {
              const inLeft = twoCol.leftChartIds.includes(chart.id);
              const inRight = twoCol.rightChartIds.includes(chart.id);
              const inBottom = twoCol.bottomFullWidthChartIds?.includes(chart.id);
              const isFirstBottom = inBottom && chart.id === twoCol.bottomFullWidthChartIds?.[0];
              if (!isFirstBottom && (inBottom || inRight || (inLeft && chart.id !== twoCol.leftChartIds[0]))) return null;
            }
            const isComputed = (chart.computedFormula === "births-minus-deaths" || chart.computedFormula === "budget-balance" || chart.computedFormula === "budget-balance-cumulative" || chart.computedFormula === "foreign-trade-balance" || chart.computedFormula === "foreign-trade-balance-cumulative") && chart.computedSourceCharts?.length;
            const hasChartApi = !!chart.chartApiUrl || !!(config.id === "cpi" && chart.chartApiUrlByCpiMode);
            const hasFixedQuery = !!(chart as { chartFixedQuery?: unknown }).chartFixedQuery;
            const metaForChart = isComputed
              ? (metadataByChartId[chart.computedSourceCharts![0]] ?? metadata)
              : hasFixedQuery
                ? (metadataByChartId[chart.id] ?? metadata)
                : hasChartApi
                  ? metadataByChartId[chart.id]
                  : metadata;
            const rowsForChart = isComputed
              ? (computedNetGrowthByChartId[chart.id] ?? [])
              : hasFixedQuery
                ? (processedChartData[chart.id] ?? [])
                : hasChartApi
                  ? (processedChartData[chart.id] ?? [])
                  : rows;
            if (hasChartApi && !metaForChart && !hasFixedQuery) return null;
            if (!metaForChart) return null;
            const getAllowedForDim = (v: (typeof metaForChart.variables)[0]): { labels: string[]; codes: string[] } => {
              const sel = selections[v.code];
              const allCodes = (sel?.length ? sel : v.values) ?? [];
              const labels = (allCodes
                .map((val) => v.valueTexts?.[v.values.indexOf(val)] ?? v.valueTexts?.[0])
                .filter(Boolean) ?? []) as string[];

              // "Нийт дүн"/"Нийт" орсон бол давхар тоолол үүсгэхээс сэргийлж зөвхөн тэр ангиллыг үлдээнэ
              const totalLabel =
                v.valueTexts?.find((t) => t === "Нийт дүн") ??
                v.valueTexts?.find((t) => t === "Нийт") ??
                v.valueTexts?.[0];
              const totalIdx = totalLabel ? v.valueTexts?.indexOf(totalLabel) ?? -1 : -1;
              const totalCode = totalIdx >= 0 ? v.values?.[totalIdx] : v.values?.[0];
              if (totalLabel && labels.includes(totalLabel) && totalCode) {
                return { labels: [totalLabel], codes: [String(totalCode)] };
              }

              // Хэрэв эхний ангилал (ихэвчлэн нийт) сонгогдсон бол мөн зөвхөн тэрийг авна
              if (v.valueTexts?.[0] && labels.includes(v.valueTexts[0]) && v.values?.[0]) {
                return { labels: [v.valueTexts[0]], codes: [String(v.values[0])] };
              }

              return { labels, codes: allCodes.map(String) };
            };
            const seriesDim = chart.seriesDimensions?.[0];
            const selectedSeriesCodes =
              seriesDim &&
              (trendChartSeriesSelection[chart.id] ??
                chart.defaultSeriesCodes?.[seriesDim]);
            const allSeriesCodes =
              seriesDim && metaForChart
                ? (metaForChart.variables.find((v) => v.code === seriesDim)?.values ?? [])
                : [];
            const trendData =
              metaForChart && chart.seriesDimensions?.length
                ? rowsForChart
                    .filter((r) => {
                      for (const v of metaForChart.variables) {
                        if (v.code === chart.xDimension) continue;
                        if (chart.seriesDimensions?.includes(v.code)) continue;
                        const rowLabel = String(r[v.code] ?? "");
                        const rowCode = String(r[`${v.code}_code`] ?? "");
                        // CPI detailed (019V1) нийслэл/улс: Бүс-ийг dashboard-ийн selection-оор биш, графикийн өөрийн Бүс (Нийслэл 5, 511) утгуудаар шүүнэ
                        const useChartOwnBus =
                          config.id === "cpi" &&
                          chart.id === "cpi-detailed" &&
                          (selectedLevel === "нийслэл" || selectedLevel === "улс") &&
                          chart.regionFilterDimension &&
                          v.code === chart.regionFilterDimension;
                        const allowed = useChartOwnBus
                          ? {
                              codes: (v.values ?? []).map(String),
                              labels: (v.values ?? []).map((val, i) => v.valueTexts?.[i] ?? String(val)),
                            }
                          : getAllowedForDim(v);
                        const labelsMatch = allowed.labels.length > 0 && allowed.labels.includes(rowLabel);
                        const codesMatch = allowed.codes.length > 0 && allowed.codes.includes(rowCode);
                        if (!labelsMatch && !codesMatch) return false;
                      }
                      if (
                        seriesDim &&
                        selectedSeriesCodes?.length &&
                        selectedSeriesCodes.length < allSeriesCodes.length
                      ) {
                        const code = String(r[`${seriesDim}_code`] ?? r[seriesDim] ?? "");
                        if (!selectedSeriesCodes.includes(code)) return false;
                      }
                      return true;
                    })
                : rowsForChart;
            const barChartWithYear = charts.find((c) => c.type === "bar" && c.yearSlicerDimension);
            const seriesVar =
              seriesDim && metaForChart
                ? metaForChart.variables.find((v) => v.code === seriesDim)
                : undefined;
            const seriesOptions =
              seriesVar?.values?.map((val, i) => ({
                value: val,
                label: seriesVar.valueTexts?.[i] ?? val,
              })) ?? [];

            const renderTrendChart = (
              c: (typeof charts)[0],
              data: DataRow[],
              meta: PxMetadata,
              opts?: {
                showRangeSlider?: boolean;
                rangeYears?: [string, string];
                onRangeYearsChange?: (start: string, end: string) => void;
                useChartOwnRegionFilter?: boolean;
                hideHeader?: boolean;
                valueLabel?: string;
                headerExtra?: ReactNode;
                headerExtraInValueRow?: boolean;
                headerExtraTitleRow?: ReactNode;
                enableSlicers?: boolean;
                showLatestValue?: boolean;
                latestValueSeriesFilter?: string[];
                showLatestValueBySeries?: boolean;
                latestValueVertical?: boolean;
                controlledMetricMode?: "value" | "growth";
                latestValueMarginClass?: string;
                latestValueFormatter?: (value: number, period: string) => string;
                axisFormatter?: (value: number) => string;
                valueFormatter?: (value: number) => string;
                valueAxisTitle?: string | null;
                yAxisMin?: number;
                yAxisMax?: number;
                colorVariant?: "default" | "muted" | "orange";
                seriesColorMap?: Record<string, string>;
                forceGradientArea?: boolean;
                seriesStackId?: string;
                dashedSeriesLabels?: string[];
                seriesLabelMap?: Record<string, string>;
                tooltipUnit?: string;
                /** Өөрчлөлт % горимд энэ жилээс эхлэн харуулах (жишээ: 1990) */
                growthFromYear?: number;
                chartHeight?: number;
                widePlot?: boolean;
              }
            ) => {
              const sDim = c.seriesDimensions?.[0];
              const allowedForDim = (v: (typeof meta.variables)[0]) => {
                if (opts?.useChartOwnRegionFilter && c.regionFilterDimension && v.code === c.regionFilterDimension) {
                  return {
                    codes: (v.values ?? []).map(String),
                    labels: (v.values ?? []).map((val, i) => v.valueTexts?.[i] ?? String(val)),
                  };
                }
                const sel = selections[v.code];
                const allCodes = (sel?.length ? sel : v.values) ?? [];
                const labels = (allCodes
                  .map((val) => v.valueTexts?.[v.values.indexOf(val)] ?? v.valueTexts?.[0])
                  .filter(Boolean) ?? []) as string[];
                const totalLabel =
                  v.valueTexts?.find((t) => t === "Нийт дүн") ?? v.valueTexts?.find((t) => t === "Нийт") ?? v.valueTexts?.[0];
                const totalIdx = totalLabel ? v.valueTexts?.indexOf(totalLabel) ?? -1 : -1;
                const totalCode = totalIdx >= 0 ? v.values?.[totalIdx] : v.values?.[0];
                if (totalLabel && labels.includes(totalLabel) && totalCode)
                  return { labels: [totalLabel], codes: [String(totalCode)] };
                if (v.valueTexts?.[0] && labels.includes(v.valueTexts[0]) && v.values?.[0])
                  return { labels: [v.valueTexts[0]], codes: [String(v.values[0])] };
                return { labels, codes: allCodes.map(String) };
              };
              const filtered =
                meta && c.seriesDimensions?.length
                  ? data.filter((r) => {
                      for (const v of meta.variables) {
                        if (v.code === c.xDimension || c.seriesDimensions?.includes(v.code)) continue;
                        const rowLabel = String(r[v.code] ?? "");
                        const rowCode = String(r[`${v.code}_code`] ?? "");
                        const allowed = allowedForDim(v);
                        if (
                          !(allowed.labels.length > 0 && allowed.labels.includes(rowLabel)) &&
                          !(allowed.codes.length > 0 && allowed.codes.includes(rowCode))
                        )
                          return false;
                      }
                      return true;
                    })
                  : data;
              const dataToShow = filtered.length > 0 ? filtered : data;
              return (
                <ChartTrend
                  key={c.id}
                  data={dataToShow}
                  xKey={c.xDimension}
                  seriesKey={sDim}
                  showGrowth={c.showGrowth}
                  title={c.title}
                  description={c.description}
                  excludeSeriesLabels={c.excludeSeriesLabels}
                  onRangeChange={
                    barChartWithYear
                      ? (endYear) => setBarChartYear((prev) => ({ ...prev, [barChartWithYear.id]: endYear }))
                      : undefined
                  }
                  rangeYears={
                    opts?.rangeYears !== undefined
                      ? opts.rangeYears
                      : config.id === "population"
                        ? sharedRangeYears ?? undefined
                        : config.id === "cpi" && c.id === "cpi-trend"
                          ? (cpiRangeYears ?? (availableCpiPeriods.length >= 1
                              ? (() => {
                                  const last = availableCpiPeriods[availableCpiPeriods.length - 1];
                                  const startIdx = availableCpiPeriods.findIndex((p) => p.slice(0, 4) >= "2024");
                                  const start = startIdx >= 0 ? availableCpiPeriods[startIdx] : availableCpiPeriods[0];
                                  return [start, last];
                                })()
                              : undefined))
                          : config.id === "unemployment" && c.id === "unemployment-trend"
                            ? (unemploymentRange ?? (availableUnemploymentQuarters.length >= 1 ? [availableUnemploymentQuarters[0], availableUnemploymentQuarters[availableUnemploymentQuarters.length - 1]] : undefined))
                            : config.id === "ppi" && availablePpiPeriods.length >= 1
                              ? (ppiRangePeriod ?? (() => {
                                  const idx = availablePpiPeriods.findIndex((p) => parseInt(String(p).slice(0, 4), 10) >= 2025);
                                  const start = idx >= 0 ? availablePpiPeriods[idx]! : availablePpiPeriods[0]!;
                                  const end = availablePpiPeriods[availablePpiPeriods.length - 1]!;
                                  return [start, end];
                                })())
                              : undefined
                  }
                  onRangeYearsChange={
                    opts?.onRangeYearsChange
                      ? opts.onRangeYearsChange
                      : config.id === "population"
                        ? (s, e) => setSharedRangeYears([s, e])
                        : config.id === "cpi" && c.id === "cpi-trend" && availableCpiPeriods.length >= 1
                          ? (s, e) => setCpiRangeYears([s, e])
                          : config.id === "unemployment" && c.id === "unemployment-trend" && availableUnemploymentQuarters.length >= 1
                            ? (s, e) => setUnemploymentRange([s, e])
                            : config.id === "ppi" && availablePpiPeriods.length >= 1
                              ? (s, e) => setPpiRangePeriod([s, e])
                              : undefined
                  }
                  showRangeSlider={
                    opts?.showRangeSlider !== undefined
                      ? opts.showRangeSlider
                      : config.id === "population"
                        ? c.id === "population-area"
                        : config.id === "cpi"
                          ? c.id === "cpi-trend"
                          : config.id === "unemployment" && c.id === "unemployment-trend"
                            ? true
                            : config.id === "ppi"
                              ? true
                              : c.id !== "cpi-trend"
                  }
                  rangeSliderPlayFromYear={
                    config.id === "population" && c.id === "population-area"
                      ? "1989"
                      : config.id === "cpi" && c.id === "cpi-trend"
                        ? "2024-01"
                        : config.id === "ppi"
                          ? "2025-01"
                          : config.id === "business-register" && c.id === "business-register-active"
                            ? "2013-4"
                            : undefined
                  }
                  valueLabel={opts?.valueLabel ?? (config.id === "population" && c.id === "population-area" ? "Хүн ам" : undefined)}
                  valueAxisTitle={
                    opts?.valueAxisTitle !== undefined
                      ? opts.valueAxisTitle
                      : config.id === "population" && c.id === "population-area"
                        ? null
                        : config.id === "gdp"
                          ? null
                          : config.id === "business-register"
                            ? null
                            : undefined
                  }
                  colorVariant={opts?.colorVariant ?? c.colorVariant ?? (config.id === "population" && c.id === "population-deaths" ? "muted" : undefined)}
                  mutedSeriesLabels={config.id === "population" && c.id === "population-indicators-per-1000" ? ["Нас баралт"] : undefined}
                  chartHeight={
                    opts?.chartHeight ??
                    ("chartHeight" in c && typeof (c as { chartHeight?: number }).chartHeight === "number"
                      ? (c as { chartHeight: number }).chartHeight
                      : undefined)
                  }
                  hideHeader={opts?.hideHeader ?? (c.title === config.name || c.title === config.shortTitle)}
                  headerExtra={opts?.headerExtra}
                  headerExtraInValueRow={opts?.headerExtraInValueRow}
                  headerExtraTitleRow={opts?.headerExtraTitleRow}
                  enableSlicers={opts?.enableSlicers ?? (opts?.controlledMetricMode ? false : undefined)}
                  showLatestValue={opts?.showLatestValue}
                  latestValueSeriesFilter={
                    opts?.latestValueSeriesFilter ??
                    (config.id === "population" && c.id === "population-life-expectancy" ? ["Бүгд"] :
                    config.id === "population" && c.id === "population-indicators-per-1000" ? ["Ердийн цэвэр өсөлт"] :
                    undefined)
                  }
                  showLatestValueBySeries={
                    opts?.showLatestValueBySeries ??
                    (config.id === "population" && (c.id === "population-area" || c.id === "population-marriage-divorce" || c.id === "population-marriage-divorce-per-1000" || c.id === "population-life-expectancy" || c.id === "population-indicators-per-1000"))
                  }
                  seriesColorMap={
                    opts?.seriesColorMap ??
                    (config.id === "population" && c.id === "population-life-expectancy"
                      ? { "Эрэгтэй": "#0050C3", "Эмэгтэй": "#0891b2", "Бүгд": "#64748b" }
                      : config.id === "business-register"
                        ? { value: "#0050C3" }
                        : undefined)
                  }
                  yAxisMin={opts?.yAxisMin ?? (config.id === "population" && c.id === "population-life-expectancy" ? 40 : config.id === "business-register" ? 0 : undefined)}
                  yAxisMax={opts?.yAxisMax ?? (config.id === "population" && c.id === "population-life-expectancy" ? 80 : undefined)}
                  controlledMetricMode={opts?.controlledMetricMode}
                  latestValueMarginClass={opts?.latestValueMarginClass}
                  latestValueFormatter={
                    opts?.latestValueFormatter ??
                    (config.id === "housing-prices" && c.id === "housing-index"
                      ? (v: number) => `${v.toFixed(1)}%`
                      : config.id === "housing-prices" && c.id === "housing-by-district"
                        ? (v: number) => `${v.toLocaleString()} сая`
                        : config.id === "unemployment" && (c.id === "unemployment-trend" || c.id === "labour-participation")
                          ? (v: number) => `${v.toFixed(1)}%`
                          : config.id === "business-register"
                            ? (v: number) => Math.round(Number(v)).toLocaleString("en-US")
                            : undefined)
                  }
                  axisFormatter={
                    opts?.axisFormatter ??
                    (config.id === "housing-prices" && c.id === "housing-index"
                      ? (v: number) => `${v}%`
                      : config.id === "housing-prices" && c.id === "housing-by-district"
                        ? (v: number) => `${v} сая`
                        : config.id === "unemployment" && (c.id === "unemployment-trend" || c.id === "labour-participation")
                          ? (v: number) => `${v}%`
                          : config.id === "business-register"
                            ? (v: number) => Math.round(Number(v)).toLocaleString("en-US")
                            : undefined)
                  }
                  valueFormatter={
                    opts?.valueFormatter ??
                    (config.id === "housing-prices" && c.id === "housing-index"
                      ? (v: number) => `${v.toFixed(1)}%`
                      : config.id === "housing-prices" && c.id === "housing-by-district"
                        ? (v: number) => `${v.toLocaleString()} сая`
                        : config.id === "unemployment" && (c.id === "unemployment-trend" || c.id === "labour-participation")
                          ? (v: number) => `${v.toFixed(1)}%`
                          : config.id === "business-register"
                            ? (v: number) => Math.round(Number(v)).toLocaleString("en-US")
                            : undefined)
                  }
                  forceGradientArea={opts?.forceGradientArea !== undefined ? opts.forceGradientArea : config.id === "business-register"}
                  seriesStackId={opts?.seriesStackId}
                  latestValueVertical={opts?.latestValueVertical}
                  dashedSeriesLabels={
                    opts?.dashedSeriesLabels ??
                    (config.id === "population" && c.id === "population-life-expectancy" ? ["Бүгд"] :
                    config.id === "population" && c.id === "population-indicators-per-1000" ? ["Ердийн цэвэр өсөлт"] :
                    undefined)
                  }
                  seriesLabelMap={
                    opts?.seriesLabelMap ??
                    (config.id === "population" && c.id === "population-life-expectancy"
                      ? { "Бүгд": "Улсын дундаж" }
                      : undefined)
                  }
                  tooltipUnit={opts?.tooltipUnit}
                  growthFromYear={opts?.growthFromYear}
                  widePlot={opts?.widePlot}
                />
              );
            };

            if (config.id === "population" && chart.id === "population-area" && metaForChart) {
              const inlineVars = (metaForChart ?? metadata)?.variables.filter(
                (v) => v.code === "Хүм амын тоо" || v.code === "Бүс"
              ) ?? [];
              const filterNode = inlineVars.length > 0 ? (
                <div className="flex items-center gap-3">
                  <DashboardFilters
                    variables={inlineVars}
                    selections={selections}
                    onSelectionChange={handleSelectionChange}
                    loading={loading}
                    labelOverrides={{ "Хүм амын тоо": "", "Бүс": "" }}
                    slicerOnly={true}
                    busSingleSelect={true}
                  />
                </div>
              ) : undefined;
              return renderTrendChart(chart, trendData, metaForChart, { headerExtra: filterNode, growthFromYear: 1990 });
            }

            if (config.id === "business-register" && chart.id === "business-register-active" && metaForChart) {
              const activityVar = metaForChart.variables.find((v) => v.code === "Үйл ажиллагаа эрхлэлтийн байдал");
              const activityCode = selections["Үйл ажиллагаа эрхлэлтийн байдал"]?.[0] ?? "1";
              const activityIdx = activityVar?.values?.indexOf(activityCode) ?? 0;
              const activityLabel = activityVar?.valueTexts?.[activityIdx] ?? activityCode;
              const sectorVar = metaForChart.variables.find((v) => v.code === "Эдийн засгийн салбар");
              const sectors = (sectorVar?.values ?? [])
                .map((code, i) => ({
                  code: String(code),
                  label: sectorVar?.valueTexts?.[i] ?? String(code),
                }))
                .filter((s) => s.code !== "0")
                .filter((s) => !s.label.includes("Хүн хөлслөн ажиллуулдаг өрх"));
              const mainTitle = activityLabel === "Бүгд" ? "Бүртгэлтэй ААНБ-н тоо" : `${activityLabel} ААНБ-н тоо`;
              const brMainWrap =
                "min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:font-semibold [&_h3.chart-section-title]:tracking-wide [&_h3.chart-section-title]:text-[#001C44] dark:[&_h3.chart-section-title]:text-slate-100 [&_.chart-section-value]:text-2xl [&_.chart-section-value]:font-normal [&_.chart-section-value]:tabular-nums [&_.chart-section-value]:text-slate-900 dark:[&_.chart-section-value]:text-slate-50 [&_.chart-section-label]:font-normal [&_.chart-section-label]:text-[var(--muted-foreground)]";
              const brSectorWrap =
                "min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:font-semibold [&_h3.chart-section-title]:text-[11px] [&_h3.chart-section-title]:leading-snug sm:[&_h3.chart-section-title]:text-xs [&_h3.chart-section-title]:text-[#0050C3] dark:[&_h3.chart-section-title]:text-blue-300 [&_.chart-section-value]:text-lg [&_.chart-section-value]:font-normal [&_.chart-section-value]:tabular-nums [&_.chart-section-value]:text-slate-900 dark:[&_.chart-section-value]:text-slate-100 [&_.chart-section-label]:font-normal";

              /** PrimeFlex `.grid` нь display:flex — жинхэнэ grid: !grid; мөр бүр 3 багана (md+) */
              const sectorGridCols =
                "!grid w-full min-w-0 grid-cols-1 gap-6 gap-x-4 md:!grid-cols-3 md:gap-x-6 md:gap-y-8";

              const sectorsSorted = sortBusinessRegisterSectors(sectors);

              const renderSectorCell = (code: string, label: string) => {
                const sectorRows = processedChartData[`business-register-sector-${code}`] ?? [];
                const sectorTitle = businessRegisterDisplayTitle(label);
                return (
                  <div key={code} className={brSectorWrap}>
                    {renderTrendChart(
                      { ...chart, id: `business-register-sector-${code}`, title: sectorTitle, chartHeight: 260 },
                      sectorRows,
                      metaForChart,
                      { hideHeader: false, showRangeSlider: false, chartHeight: 260 }
                    )}
                  </div>
                );
              };

              return (
                <div key={chart.id} className="space-y-10">
                  <div className={brMainWrap}>
                    {renderTrendChart(
                      { ...chart, title: mainTitle, chartHeight: 400 },
                      trendData,
                      metaForChart,
                      {
                        widePlot: true,
                        chartHeight: 400,
                        latestValueMarginClass: "mt-2",
                      }
                    )}
                  </div>
                  {sectorsSorted.length > 0 && (
                    <div>
                      <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#001C44] dark:text-slate-200">
                        САЛБАРААР
                      </h3>
                      <div className={sectorGridCols}>
                        {sectorsSorted.map(({ code, label }) => renderSectorCell(code, label))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (config.id === "population" && chart.id === "population-births") {
              const birthRows = chartDataByChartId[chart.id] ?? [];
              const cbrRows = chartDataByChartId["population-birth-rate-coefficient"] ?? [];
              const deathRows = chartDataByChartId["population-deaths"] ?? [];
              const cdrRows = chartDataByChartId["population-death-rate-coefficient"] ?? [];
              const fixedRange: [string, string] = ["2010", "2099"];
              return (
                <div key="population-births-deaths" className="!grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-stretch">
                  <div className="min-w-0">
                    <h3 className="chart-section-title mb-1">Төрөлтийн тоо, Төрөлтийн ерөнхий коэффициент</h3>
                    <p className="text-xs text-slate-500 mb-2">Төрөлтийн ерөнхий коэффициент нь тухайн жилийн 1000 хүн тутамд ногдох амьд төрсөн хүүхдийн тоог илэрхийлнэ.</p>
                    <BirthsAndCBRChart
                      birthRows={birthRows}
                      cbrRows={cbrRows}
                      rangeYears={fixedRange}
                      showRangeSlider={false}
                      chartHeight={340}
                      hideHeader={true}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="chart-section-title mb-1">Нас баралтын тоо, Нас баралтын ерөнхий коэффициент</h3>
                    <p className="text-xs text-slate-500 mb-2">Нас баралтын ерөнхий коэффициент нь тухайн жилийн 1000 хүн тутамд ногдох нас баралтын тоог илэрхийлнэ.</p>
                    <BirthsAndCBRChart
                      birthRows={deathRows}
                      cbrRows={cdrRows}
                      barSeriesName="Нас баралт"
                      lineSeriesName="НЕК"
                      barColor="#94a3b8"
                      lineColor="#64748b"
                      rangeYears={fixedRange}
                      showRangeSlider={false}
                      chartHeight={340}
                      hideHeader={true}
                    />
                  </div>
                </div>
              );
            }
            if (config.id === "population" && chart.id === "population-birth-rate-coefficient") return null;
            if (config.id === "population" && chart.id === "population-deaths") return null;
            if (config.id === "population" && chart.id === "population-death-rate-coefficient") return null;
            if (config.id === "population" && chart.id === "population-net-growth") {
              const indicatorsChart = charts.find((c) => c.id === "population-indicators-per-1000");
              if (indicatorsChart && (indicatorsChart.type === "line" || indicatorsChart.type === "area")) {
                const meta2 = metadataByChartId[indicatorsChart.id];
                const rows2 = chartDataByChartId[indicatorsChart.id] ?? [];
                if (meta2 && metaForChart) {
                  return (
                    <div key="population-net-indicators" className="!grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:items-stretch">
                      <div className="min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                          <h3 className="chart-section-title min-w-0">Хүн амын цэвэр өсөлт</h3>
                          <div className="filter-btn-group shrink-0">
                            <button
                              className={netGrowthMetricMode === "value" ? "active" : ""}
                              onClick={() => setNetGrowthMetricMode("value")}
                            >
                              Тоо
                            </button>
                            <button
                              className={netGrowthMetricMode === "growth" ? "active" : ""}
                              onClick={() => setNetGrowthMetricMode("growth")}
                            >
                              Өөрчлөлт %
                            </button>
                          </div>
                        </div>
                        {renderTrendChart(chart, trendData, metaForChart, { hideHeader: true, controlledMetricMode: netGrowthMetricMode })}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-4 min-w-0">
                          <h3 className="chart-section-title">Төрөлт, Нас баралт, Ердийн цэвэр өсөлт — 1000 хүнд ногдох</h3>
                        </div>
                        {renderTrendChart(indicatorsChart, rows2, meta2, { hideHeader: true })}
                      </div>
                    </div>
                  );
                }
              }
            }
            if (config.id === "population" && chart.id === "population-indicators-per-1000") return null;
            // Гэрлэлт, цуцлалт charts-г map-н дор оруулна
            if (config.id === "population" && chart.id === "population-marriage-divorce") return null;
            if (config.id === "population" && chart.id === "population-marriage-divorce-per-1000") return null;

            if (config.id === "gdp" && config.gdpIndicatorFilter && chart.id === "gdp-total" && metaForChart) {
              const indicatorFilter = config.gdpIndicatorFilter;
              const sectorCharts = charts.filter(
                (c) => c.id.startsWith("gdp-") && c.id !== "gdp-total" && "gdpSectorCode" in c
              );
              const gdpYears = [...new Set(rows.map((r) => String(r["ОН"] ?? r["Он"] ?? r["ОН_code"] ?? r["Он_code"] ?? "")).filter(Boolean))].sort(
                (a, b) => (/^\d+$/.test(a) && /^\d+$/.test(b) ? Number(a) - Number(b) : a.localeCompare(b))
              );
              const defaultGdpRange: [string, string] = gdpYears.length > 0
                ? [gdpYears.includes("2015") ? "2015" : gdpYears[0], gdpYears[gdpYears.length - 1]]
                : ["2015", "2025"];
              const gdpRange = gdpRangeYears ?? defaultGdpRange;
              const indicatorLabel = indicatorFilter.options.find((o) => o.code === gdpIndicatorCode)?.label ?? "Утга";
              const filterByIndicator = (data: DataRow[]) =>
                data.filter((r) => String(r["Статистик үзүүлэлт_code"] ?? r["Статистик үзүүлэлт"] ?? "") === gdpIndicatorCode);
              const mainChartRows = filterByIndicator(chartDataByChartId["gdp-total"] ?? []);
              const stackedBarChart = charts.find((c) => c.id === "gdp-sector-structure");
              const stackedBarMeta = metadataByChartId["gdp-sector-structure"];
              const stackedBarRows = chartDataByChartId["gdp-sector-structure"] ?? [];
              return (
                <div key="gdp-dashboard" className="space-y-6">
                  <div className="pb-3 border-b border-slate-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                      Дотоодын нийт бүтээгдэхүүн
                    </p>
                    {config.introText && (
                      <p className="text-sm font-normal leading-snug text-[var(--muted-foreground)] mt-1">
                        {config.introText}
                      </p>
                    )}
                    <h1 className="text-head-title mt-2 tracking-tight uppercase">Дотоодын нийт бүтээгдэхүүн</h1>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 min-w-0 sm:max-w-[55%]">
                      Үйлдвэрлэлийн аргаар
                    </p>
                    <Segmented
                      size="small"
                      value={gdpIndicatorCode}
                      onChange={(val) => setGdpIndicatorCode(String(val))}
                      options={indicatorFilter.options.map((o) => ({ value: o.code, label: o.label }))}
                      className="gdp-indicator-segmented shrink-0"
                    />
                  </div>
                  <div className="w-full">
                    {(() => {
                      const latestRow = mainChartRows.length > 0 
                        ? mainChartRows.reduce((a, b) => {
                            const yearA = String(a["ОН"] ?? a["Он"] ?? "");
                            const yearB = String(b["ОН"] ?? b["Он"] ?? "");
                            return yearB > yearA ? b : a;
                          })
                        : null;
                      const latestValue = latestRow ? Number(latestRow["value"] ?? 0) : null;
                      const latestYear = latestRow ? String(latestRow["ОН"] ?? latestRow["Он"] ?? "") : "";
                      const isPercentageIndicator = indicatorLabel.includes("%") || indicatorLabel.includes("Өөрчлөлт");
                      const formatDisplayValue = (val: number) => {
                        if (isPercentageIndicator) {
                          return `${val.toFixed(1)}%`;
                        }
                        const trillions = val / 1000000;
                        return `${trillions.toFixed(1)} их наяд`;
                      };
                      return (
                        <>
                          {latestValue != null && (
                            <div className="mb-3">
                              <span className="chart-section-value tabular-nums">{formatDisplayValue(latestValue)}</span>
                              <span className="ml-2 chart-section-label text-[var(--muted-foreground)]">({latestYear})</span>
                            </div>
                          )}
                          <ChartTrend
                            data={mainChartRows}
                            xKey="ОН"
                            title=""
                            hideHeader
                            showLatestValue={false}
                            showRangeSlider
                            rangeYears={gdpRange}
                            onRangeYearsChange={(s, e) => setGdpRangeYears([s, e])}
                            chartHeight={380}
                            forceGradientArea
                            valueLabel={indicatorLabel}
                            seriesLabelMap={{ "Бүгд": indicatorLabel, "value": indicatorLabel }}
                            axisFormatter={isPercentageIndicator ? undefined : (v) => `${(v / 1000000).toFixed(0)}`}
                            valueFormatter={isPercentageIndicator ? undefined : (v) => `${(v / 1000000).toFixed(1)} их наяд`}
                          />
                        </>
                      );
                    })()}
                  </div>
                  <div className="!grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sectorCharts.map((sc) => {
                      const scMeta = metadataByChartId[sc.id];
                      const scRows = filterByIndicator(chartDataByChartId[sc.id] ?? []);
                      if (!scMeta) return null;
                      const isPercentage = indicatorLabel.includes("%") || indicatorLabel.includes("Өөрчлөлт");
                      const sectorValueFormatter = (val: number, period: string) => {
                        if (isPercentage) {
                          return `${val.toFixed(1)}%`;
                        }
                        const trillions = val / 1000000;
                        return `${trillions.toFixed(1)} их наяд`;
                      };
                      return (
                        <div key={sc.id} className="min-w-0 [&_h3.chart-section-title]:uppercase">
                          {renderTrendChart(
                            { ...sc, chartHeight: 220 },
                            scRows,
                            scMeta,
                            {
                              showRangeSlider: false,
                              rangeYears: gdpRange,
                              forceGradientArea: true,
                              valueLabel: `${indicatorLabel}:`,
                              latestValueMarginClass: "mt-2",
                              latestValueFormatter: sectorValueFormatter,
                              axisFormatter: isPercentage ? undefined : (v: number) => `${(v / 1000000).toFixed(0)}`,
                              valueFormatter: isPercentage ? undefined : (v: number) => `${(v / 1000000).toFixed(1)} их наяд`,
                            }
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* Нэг хүнд ногдох ДНБ, ам.доллар - stacked bar-н дээр */}
                  {(() => {
                    const topAreaCharts = charts.filter((c) => ["gdp-per-capita", "gdp-per-capita-usd"].includes(c.id));
                    const hasAnyData = topAreaCharts.some((c) => (chartDataByChartId[c.id]?.length ?? 0) > 0);
                    if (!hasAnyData) return null;

                    const perCapitaUsdMeta = metadataByChartId["gdp-per-capita-usd"];
                    const perCapitaUsdGdpVar = perCapitaUsdMeta?.variables.find((v) => v.code === "ДНБ");
                    const perCapitaUsdGdpOptions = perCapitaUsdGdpVar?.values.map((val, i) => ({
                      value: String(val),
                      label: perCapitaUsdGdpVar.valueTexts?.[i] ?? String(val),
                    })) ?? [];

                    return (
                      <div className="!grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6 items-start">
                        {topAreaCharts.map((areaChart) => {
                          const areaRows = chartDataByChartId[areaChart.id] ?? [];
                          if (areaRows.length === 0) return null;

                          const xDim = areaChart.xDimension;
                          const [rangeStart, rangeEnd] = gdpRange;
                          const yearFilteredRows = areaRows.filter((r) => {
                            const y = String(r[xDim] ?? "");
                            return y >= rangeStart && y <= rangeEnd;
                          });

                          let filteredRows = yearFilteredRows;

                          if (areaChart.id === "gdp-per-capita-usd") {
                            filteredRows = yearFilteredRows.filter((r) =>
                              String(r["ДНБ_code"] ?? "") === "1"
                            );
                          }

                          const displayData = filteredRows.length > 0 ? filteredRows : yearFilteredRows;
                          const years = [...new Set(displayData.map(r => String(r[areaChart.xDimension] ?? "")))].sort();
                          const latestYear = years[years.length - 1] || "";
                          const latestYearRows = displayData.filter(r => String(r[areaChart.xDimension] ?? "") === latestYear);
                          const latestValue = latestYearRows.reduce((sum, r) => sum + (Number(r.value) || 0), 0);

                          return (
                            <div key={areaChart.id} className="flex flex-col">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-1">
                                <div className="min-w-0 w-full md:w-auto">
                                  <h3 className="chart-section-title">
                                    {areaChart.id === "gdp-per-capita-usd" ? "Нэг хүнд ногдох ДНБ" : areaChart.title}
                                  </h3>
                                  {areaChart.description && (
                                    <p className="chart-section-label text-[var(--muted-foreground)]">{areaChart.description}</p>
                                  )}
                                  {latestYear && (
                                    <div className="mt-2">
                                      <div className="flex items-baseline gap-2">
                                        <span className="chart-section-value tabular-nums leading-none">
                                          {areaChart.id === "gdp-per-capita" 
                                            ? `₮${(latestValue / 1000).toFixed(1)} сая`
                                            : areaChart.id === "gdp-per-capita-usd"
                                              ? `$${latestValue.toLocaleString()}`
                                              : latestValue.toLocaleString()
                                          }
                                        </span>
                                        <span className="chart-section-label text-[var(--muted-foreground)]">
                                          ({latestYear})
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <ChartTrend
                                data={displayData}
                                xKey={areaChart.xDimension}
                                seriesKey={areaChart.seriesDimensions?.[0]}
                                title=""
                                hideHeader
                                showLatestValue={false}
                                showRangeSlider={false}
                                rangeYears={gdpRange}
                                chartHeight={260}
                                enableSlicers={false}
                                showGrowth={false}
                                forceGradientArea
                                valueLabel={
                                  areaChart.id === "gdp-per-capita" 
                                    ? "Нэг хүнд ногдох ДНБ ₮"
                                    : areaChart.id === "gdp-per-capita-usd"
                                      ? "Нэг хүнд ногдох ДНБ $"
                                      : areaChart.title
                                }
                                valueFormatter={
                                  areaChart.id === "gdp-per-capita" 
                                    ? (v) => `₮${(v / 1000).toFixed(1)} сая`
                                    : areaChart.id === "gdp-per-capita-usd"
                                      ? (v) => `$${v.toLocaleString()}`
                                      : undefined
                                }
                                axisFormatter={areaChart.id === "gdp-per-capita" ? (v) => `${(v / 1000).toFixed(0)}` : undefined}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {/* Stacked bar + Нэг ажиллагчид ногдох ДНБ - нэгтгэсэн filter-тэй */}
                  {stackedBarChart && stackedBarMeta && stackedBarRows.length > 0 && (() => {
                    const sectorDim = "Эдийн засгийн үйл ажиллагааны салбарын ангилал";
                    const sectorVar = stackedBarMeta?.variables.find((v) => v.code === sectorDim);
                    const stackedBarSectorOptions = sectorVar?.values
                      .map((val, i) => ({
                        value: String(val),
                        label: sectorVar.valueTexts?.[i] ?? String(val),
                      }))
                      .filter((opt) => opt.label !== "Бүгд") ?? [];

                    const perWorkerChart = charts.find((c) => c.id === "gdp-per-worker");
                    const perWorkerRows = chartDataByChartId["gdp-per-worker"] ?? [];
                    const perWorkerMeta = metadataByChartId["gdp-per-worker"];
                    const perWorkerSectorVar = perWorkerMeta?.variables.find((v) => v.code === "Эдийн засгийн салбар");
                    const perWorkerSectorOptions = perWorkerSectorVar?.values.map((val, i) => ({
                      value: String(val),
                      label: perWorkerSectorVar.valueTexts?.[i] ?? String(val),
                    })) ?? [];

                    const isAllSectors = gdpPerWorkerSectorCode === "all";
                    
                    const filterOptions = [
                      { value: "all", label: "Бүх салбар" },
                      ...perWorkerSectorOptions,
                    ];

                    const selectedPerWorkerOption = perWorkerSectorOptions.find(o => o.value === gdpPerWorkerSectorCode);
                    const selectedSectorCore = selectedPerWorkerOption?.label?.split(" - ")[0]?.trim() ?? "";
                    
                    const targetStackedBarSector = stackedBarSectorOptions.find(opt => 
                      opt.label === selectedSectorCore || opt.label.startsWith(selectedSectorCore)
                    )?.label ?? null;
                    
                    const filteredData = stackedBarRows.filter((r) => {
                      const year = String(r["ОН"] ?? r["ОН_code"] ?? "");
                      const [start, end] = gdpRange;
                      if (year < start || year > end) return false;
                      const sectorLabel = String(r[sectorDim] ?? "");
                      if (sectorLabel === "Бүгд") return false;
                      if (!isAllSectors && targetStackedBarSector) {
                        if (sectorLabel !== targetStackedBarSector) return false;
                      }
                      return true;
                    });
                    const years = [...new Set(filteredData.map((r) => String(r["ОН"] ?? "")))].sort((a, b) => Number(a) - Number(b));
                    const sectors = [...new Set(filteredData.map((r) => String(r[sectorDim] ?? "")))];
                    const sectorColors = [
                      "#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280", 
                      "#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280", 
                      "#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280"
                    ];
                    const seriesData = isAllSectors 
                      ? sectors.map((sector, idx) => ({
                          name: sector,
                          type: "bar" as const,
                          stack: "total",
                          data: years.map((year) => {
                            const row = filteredData.find((r) => String(r["ОН"] ?? "") === year && String(r[sectorDim] ?? "") === sector);
                            return row ? Number(row["value"] ?? 0) : 0;
                          }),
                          itemStyle: { color: sectorColors[idx % sectorColors.length] },
                        }))
                      : [{
                          name: sectors[0] ?? "Салбар",
                          type: "bar" as const,
                          data: years.map((year) => {
                            const row = filteredData.find((r) => String(r["ОН"] ?? "") === year);
                            return row ? Number(row["value"] ?? 0) : 0;
                          }),
                          itemStyle: { color: "#2563eb" },
                        }];

                    const perWorkerXDim = perWorkerChart?.xDimension ?? "Он";
                    const [rangeStart, rangeEnd] = gdpRange;
                    const perWorkerYearFiltered = perWorkerRows.filter((r) => {
                      const y = String(r[perWorkerXDim] ?? "");
                      return y >= rangeStart && y <= rangeEnd;
                    });
                    const defaultPerWorkerLabel = "Хөдөлмөрийн бүтээмжийн түвшин - улсын түвшинд";
                    const defaultPerWorkerCode = perWorkerSectorOptions.find(o => o.label === defaultPerWorkerLabel)?.value ?? perWorkerSectorOptions[0]?.value ?? "0";
                    const actualPerWorkerCode = gdpPerWorkerSectorCode === "all" ? defaultPerWorkerCode : gdpPerWorkerSectorCode;
                    const perWorkerFiltered = perWorkerYearFiltered.filter((r) => 
                      String(r["Эдийн засгийн салбар_code"] ?? "") === actualPerWorkerCode
                    );
                    const perWorkerDisplayData = perWorkerFiltered.length > 0 ? perWorkerFiltered : perWorkerYearFiltered;
                    const perWorkerYears = [...new Set(perWorkerDisplayData.map(r => String(r[perWorkerXDim] ?? "")))].sort();
                    const perWorkerLatestYear = perWorkerYears[perWorkerYears.length - 1] || "";
                    const perWorkerLatestRows = perWorkerDisplayData.filter(r => String(r[perWorkerXDim] ?? "") === perWorkerLatestYear);
                    const perWorkerLatestValue = perWorkerLatestRows.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
                    const selectedSectorLabel = perWorkerSectorOptions.find(o => o.value === actualPerWorkerCode)?.label ?? "";

                    return (
                      <div className="w-full">
                        {/* Stacked bar header - temporarily commented out
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                          <h3 className="chart-section-title min-w-0 w-full md:w-auto">{stackedBarChart.title}</h3>
                          <Select
                            value={gdpPerWorkerSectorCode}
                            onChange={(val) => setGdpPerWorkerSectorCode(val)}
                            options={filterOptions}
                            style={{ minWidth: 280 }}
                            popupMatchSelectWidth={false}
                          />
                        </div>
                        */}
                        <div className="space-y-6">
                          {/* Stacked bar chart - temporarily commented out
                          <div>
                            <ReactECharts
                              option={{
                                grid: { left: 50, right: 20, top: 20, bottom: 60 },
                                xAxis: { type: "category", data: years, axisLabel: { fontSize: 12, rotate: 45 } },
                                yAxis: { 
                                  type: "value", 
                                  min: 0, 
                                  max: 100, 
                                  axisLabel: { fontSize: 12, formatter: "{value}%" } 
                                },
                                tooltip: {
                                  trigger: "item",
                                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                                  borderColor: "#0d9488",
                                  borderWidth: 1,
                                  padding: [12, 16],
                                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                                  textStyle: { color: "#f1f5f9", fontSize: 12 },
                                  formatter: (params: { seriesName?: string; value?: number; name?: string }) => {
                                    if (params.value == null) return "";
                                    return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                                      <span style="color:#2dd4bf;font-size:14px;">◉</span>
                                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${params.name}</span>
                                    </div>
                                    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;">
                                      <span style="color:#94a3b8;font-size:12px;">${params.seriesName}</span>
                                      <span style="color:#f1f5f9;font-weight:600;">${Number(params.value).toFixed(1)}%</span>
                                    </div>`;
                                  },
                                },
                                legend: { show: false },
                                series: seriesData,
                              }}
                              style={{ height: 450, width: "100%" }}
                            />
                          </div>
                          */}
                          {perWorkerChart && perWorkerRows.length > 0 && (
                            <div>
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-2">
                                <div className="min-w-0 w-full md:w-auto">
                                  <h4 className="chart-section-title">{perWorkerChart.title}</h4>
                                  {perWorkerLatestYear && (
                                    <div className="mt-2 flex items-baseline gap-2">
                                      <span className="chart-section-value tabular-nums leading-none">{(perWorkerLatestValue / 1000).toFixed(1)} сая</span>
                                      <span className="chart-section-label text-[var(--muted-foreground)]">({perWorkerLatestYear})</span>
                                    </div>
                                  )}
                                </div>
                                <Select
                                  value={actualPerWorkerCode}
                                  onChange={(val) => setGdpPerWorkerSectorCode(val)}
                                  options={perWorkerSectorOptions}
                                  style={{ minWidth: 280 }}
                                  popupMatchSelectWidth={false}
                                />
                              </div>
                              <ChartTrend
                                data={perWorkerDisplayData}
                                xKey={perWorkerXDim}
                                title=""
                                hideHeader={true}
                                chartHeight={320}
                                showRangeSlider={false}
                                showLatestValue={false}
                                showGrowth={false}
                                enableSlicers={false}
                                forceGradientArea
                                valueLabel={selectedSectorLabel || perWorkerChart.title}
                                valueFormatter={(v) => `${(v / 1000).toFixed(1)} сая`}
                                axisFormatter={(v) => `${(v / 1000).toFixed(0)}`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  {/* GDP Quarter charts - orange */}
                  {(() => {
                    const quarterCharts = charts.filter((c) => c.id.startsWith("gdp-quarter-"));
                    if (quarterCharts.length === 0) return null;
                    const periodsSorted = gdpQuarterSliderPeriods;
                    if (periodsSorted.length === 0) return null;
                    const defaultQuarterRange: [string, string] = [
                      periodsSorted.includes("2015-1") ? "2015-1" : periodsSorted[0]!,
                      periodsSorted[periodsSorted.length - 1]!,
                    ];
                    const quarterRange = gdpQuarterRangeYears ?? defaultQuarterRange;
                    const filterByQuarterRange = (data: DataRow[]) =>
                      data.filter((r) => {
                        const p = String(r["ОН"] ?? "");
                        return p >= quarterRange[0] && p <= quarterRange[1];
                      });
                    const nQ = periodsSorted.length;
                    let lowIdx = periodsSorted.indexOf(quarterRange[0]);
                    let highIdx = periodsSorted.indexOf(quarterRange[1]);
                    if (lowIdx < 0) lowIdx = 0;
                    if (highIdx < 0) highIdx = nQ - 1;
                    if (lowIdx > highIdx) [lowIdx, highIdx] = [highIdx, lowIdx];
                    const quarterPeriodLabels = periodsSorted.map((p) => p.replace("-", " "));
                    return (
                      <div className="mt-10">
                        <hr className="border-t border-slate-200 dark:border-slate-600 mb-5" />
                        <h2 className="text-base font-bold text-[#0050C3] dark:text-blue-400 mb-5 tracking-tight">
                          Эцсийн ашиглалтын аргаар
                        </h2>
                        <div className="!grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {quarterCharts.map((qc) => {
                            const qcMeta = metadataByChartId[qc.id];
                            const qcData = filterByQuarterRange(chartDataByChartId[qc.id] ?? []);
                            if (!qcMeta || qcData.length === 0) return null;
                            return (
                              <div key={qc.id} className="min-w-0 [&_h3.chart-section-title]:uppercase">
                                {renderTrendChart(
                                  { ...qc, chartHeight: 240 },
                                  qcData,
                                  qcMeta,
                                  {
                                    showRangeSlider: false,
                                    showLatestValue: true,
                                    latestValueMarginClass: "mt-2",
                                    latestValueFormatter: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
                                    axisFormatter: (v: number) => `${v}%`,
                                    valueFormatter: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`,
                                  }
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {nQ > 1 && (
                          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <button
                              type="button"
                              onClick={() => setGdpQuarterPlaying((p) => !p)}
                              className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                              title={gdpQuarterPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                              aria-label={gdpQuarterPlaying ? "Зогсоох" : "Тоглуулах"}
                            >
                              {gdpQuarterPlaying ? (
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
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                                {quarterPeriodLabels[lowIdx] ?? ""}
                              </span>
                              <div className="min-w-0 flex-1">
                                <RangeSlider
                                  min={0}
                                  max={nQ - 1}
                                  value={[lowIdx, highIdx]}
                                  onChange={([lo, hi]) => {
                                    setGdpQuarterPlaying(false);
                                    setGdpQuarterRangeYears([periodsSorted[lo]!, periodsSorted[hi]!]);
                                  }}
                                  labels={quarterPeriodLabels}
                                  showLabels={false}
                                />
                              </div>
                              <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                                {quarterPeriodLabels[highIdx] ?? ""}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            }
            if (config.id === "gdp") return null;

            // State Budget — Жил tab: Улсын нэгдсэн төсөв (жилээр, DT_NSO_0800_001V1)
            if (config.id === "state-budget" && chart.id === "budget-balance-yearly") {
              const yearlyRows = chartDataByChartId["budget-balance-yearly"] ?? [];
              const yearlyMeta = metadataByChartId["budget-balance-yearly"];
              const onVarFromYearly = yearlyMeta?.variables?.find((v: { code: string }) => v.code === "Он");
              if (yearlyRows.length === 0) {
                return (
                  <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                    Төсвийн мэдээлэл татагдаж байна...
                  </div>
                );
              }
              const byYear = new Map<string, { income: number; expense: number; balance: number }>();
              for (const r of yearlyRows) {
                const yearStr = String(r["Он"] ?? r["Он_code"] ?? "").replace(/\D/g, "").slice(0, 4) || String(r["Он"] ?? r["Он_code"] ?? "");
                if (!yearStr) continue;
                const indCode = String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "");
                const val = Number(r.value) || 0;
                if (!byYear.has(yearStr)) byYear.set(yearStr, { income: 0, expense: 0, balance: 0 });
                const row = byYear.get(yearStr)!;
                if (indCode === "0") row.income = val;
                else if (indCode === "1") row.expense = val;
                else if (indCode === "2") row.balance = val;
              }
              const years = [...byYear.keys()].filter(Boolean).sort((a, b) => a.localeCompare(b));
              const toBillion = (v: number) => v / 1000;
              const formatBillion = (v: number) => `${Math.round(v).toLocaleString()} тэрбум ₮`;
              const chartDataYearlyAll = years.map((y) => {
                const row = byYear.get(y)!;
                return {
                  period: y,
                  income: toBillion(row.income),
                  expense: toBillion(row.expense),
                  balance: toBillion(row.balance),
                };
              });
              const onVar = onVarFromYearly ?? metadata?.variables?.find((v: { code: string }) => v.code === "Он");
              const selectedCodes = selections["Он"];
              const selectedYearLabels =
                selectedCodes?.length && onVar?.values?.length
                  ? (selectedCodes as string[]).map((code) => {
                      const idx = onVar.values!.indexOf(code);
                      const label = idx >= 0 ? onVar.valueTexts?.[idx] : null;
                      return label != null ? String(label).replace(/\D/g, "").slice(0, 4) : null;
                    }).filter(Boolean) as string[]
                  : [];
              const yearSet = new Set(selectedYearLabels.map((y) => String(y)));
              const chartDataYearly = selectedYearLabels.length > 0
                ? chartDataYearlyAll.filter((d) => yearSet.has(String(d.period)))
                : chartDataYearlyAll.filter((d) => d.period >= "2010" && d.period <= "2025");
              const from2010to2025 = chartDataYearlyAll.filter((d) => d.period >= "2010" && d.period <= "2025");
              const chartDataYearlyDisplay = (chartDataYearly.length > 0 ? chartDataYearly : from2010to2025).filter(
                (d) => d.period >= "2010" && d.period <= "2025"
              );
              const latestYearly = chartDataYearlyDisplay[chartDataYearlyDisplay.length - 1];
              const maxIncome = Math.max(...chartDataYearlyDisplay.map((d) => d.income), 1);
              const maxExpense = Math.max(...chartDataYearlyDisplay.map((d) => d.expense), 1);
              const maxBalance = Math.max(...chartDataYearlyDisplay.map((d) => Math.abs(d.balance)), 1);
              const leftMax = Math.max(maxIncome, maxExpense) * 1.1;
              const leftMin = -leftMax;
              const rightMax = maxBalance * 1.2;
              const rightMin = -rightMax;

              // Орлогын chart — Тэнцвэржүүлсэн орлогын хажууд (баруун баганад)
              const incomeRowsForGrid = chartDataByChartId["budget-unified-income-yearly"] ?? [];
              const incomeMetaForGrid = metadataByChartId["budget-unified-income-yearly"];
              const onVarIncome = incomeMetaForGrid?.variables?.find((v: { code: string }) => v.code === "Он");
              const selectedCodesIncome = selections["Он"];
              const selectedYearLabelsIncome =
                selectedCodesIncome?.length && onVarIncome?.values?.length
                  ? (selectedCodesIncome as string[]).map((code) => {
                      const idx = onVarIncome.values!.indexOf(code);
                      const label = idx >= 0 ? onVarIncome.valueTexts?.[idx] : null;
                      return label != null ? String(label).replace(/\D/g, "").slice(0, 4) : null;
                    }).filter(Boolean) as string[]
                  : [];
              const yearSetIncome = new Set(selectedYearLabelsIncome.map((y) => String(y)));
              // DT_NSO_0800_003V1: 5=Татварын орлого, 31=Татварын бус орлого, 32=Хөрөнгийн орлого, 33=Тусламжийн орлого
              const byYearIncomeGrid = new Map<string, { tax: number; nonTax: number }>();
              for (const r of incomeRowsForGrid) {
                const yearStr = String(r["Он"] ?? r["Он_code"] ?? "").replace(/\D/g, "").slice(0, 4) || String(r["Он"] ?? r["Он_code"] ?? "");
                if (!yearStr) continue;
                const indCode = String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "");
                const val = Number(r.value) || 0;
                if (!byYearIncomeGrid.has(yearStr)) byYearIncomeGrid.set(yearStr, { tax: 0, nonTax: 0 });
                const row = byYearIncomeGrid.get(yearStr)!;
                if (indCode === "5") row.tax = val;
                else if (["31", "32", "33"].includes(indCode)) row.nonTax += val;
              }
              const yearsIncomeGrid = [...byYearIncomeGrid.keys()].filter(Boolean).sort((a, b) => a.localeCompare(b));
              const toBillionGrid = (v: number) => v / 1000;
              const chartDataIncomeAllGrid = yearsIncomeGrid.map((y) => {
                const row = byYearIncomeGrid.get(y)!;
                return { period: y, tax: toBillionGrid(row.tax), nonTax: toBillionGrid(row.nonTax) };
              });
              const chartDataIncomeFilteredGrid =
                selectedYearLabelsIncome.length > 0
                  ? chartDataIncomeAllGrid.filter((d) => yearSetIncome.has(String(d.period)))
                  : chartDataIncomeAllGrid.filter((d) => d.period >= "2010" && d.period <= "2025");
              const from2010to2025IncomeGrid = chartDataIncomeAllGrid.filter((d) => d.period >= "2010" && d.period <= "2025");
              const chartDataIncomeDisplayGrid = (chartDataIncomeFilteredGrid.length > 0 ? chartDataIncomeFilteredGrid : from2010to2025IncomeGrid).filter(
                (d) => d.period >= "2010" && d.period <= "2025"
              );
              const totalIncomeLatest = chartDataIncomeDisplayGrid.length > 0
                ? (chartDataIncomeDisplayGrid[chartDataIncomeDisplayGrid.length - 1]!.tax + chartDataIncomeDisplayGrid[chartDataIncomeDisplayGrid.length - 1]!.nonTax)
                : 0;
              const optionUnifiedIncomeGrid: EChartsOption = {
                backgroundColor: "#ffffff",
                tooltip: {
                  trigger: "axis",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  confine: true,
                  padding: [12, 16],
                  extraCssText: "min-width: 160px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { color: "#f1f5f9", fontSize: 12 },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    let html = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);"><span style="color:#2dd4bf;font-size:14px;">◉</span><span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period} он</span></div>`;
                    for (const item of arr) {
                      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span><span style="color:#f1f5f9;font-weight:600;">${Math.round(item.value ?? 0).toLocaleString()} тэрбум ₮</span></div>`;
                    }
                    return html;
                  },
                },
                grid: { left: 56, right: 48, bottom: 36, top: 44 },
                xAxis: {
                  type: "category",
                  data: chartDataIncomeDisplayGrid.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b7280" },
                  axisLine: { lineStyle: { color: "#e5e7eb" } },
                  axisTick: { show: false },
                  boundaryGap: false,
                },
                yAxis: {
                  type: "value",
                  min: 0,
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b7280", formatter: (v: number) => Math.round(v).toLocaleString() },
                  splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
                  axisLine: { show: false },
                  axisTick: { show: false },
                },
                legend: { show: false },
                series: [
                  { name: "Татварын орлого", type: "line", data: chartDataIncomeDisplayGrid.map((d) => d.tax), symbol: "none", smooth: false, lineStyle: { width: 2.5, color: "#0050C3" }, itemStyle: { color: "#0050C3" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(0, 80, 195, 0.28)" }, { offset: 1, color: "rgba(0, 80, 195, 0.05)" }] } as const } },
                  { name: "Татварын бус орлого", type: "line", data: chartDataIncomeDisplayGrid.map((d) => d.nonTax), symbol: "none", smooth: false, lineStyle: { width: 2.5, color: "#0891b2" }, itemStyle: { color: "#0891b2" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(8, 145, 178, 0.28)" }, { offset: 1, color: "rgba(8, 145, 178, 0.05)" }] } as const } },
                ],
              };

              // Жил tab: ТӨСВИЙН ЗАРЛАГА — орлоготой зэрэгцүүлэн area chart болгон харуулах
              const expenseRowsForYearly = chartDataByChartId["budget-unified-expense-yearly"] ?? [];
              const expenseMetaYearly = metadataByChartId["budget-unified-expense-yearly"];
              const onVarExpY = expenseMetaYearly?.variables?.find((v: { code: string }) => v.code === "Он");
              const indVarExpY = expenseMetaYearly?.variables?.find((v: { code: string }) => v.code === "Үзүүлэлт");
              // Жил: ТӨСВИЙН ЗАРЛАГА — нэр нь одоогийнхоор; chart-ын өгөгдөл НИЙТ/Урсгал 2-ыг сольсон (1-р: код 0-ийн өгөгдөл+НЕР НИЙТ ЗАРЛАГА, 2-р: код 1-ийн өгөгдөл+НЕР Урсгал зардал)
              const indicatorCodesExpY = ["0", "1", "8", "17"];
              const indicatorLabelsExpY = ["НИЙТ ЗАРЛАГА", "Урсгал зардал", "Хөрөнгийн зардал", "Эргэж төлөгдөх цэвэр зээл"];
              const byYearExpY = new Map<string, Record<string, number>>();
              for (const r of expenseRowsForYearly) {
                const yearStr = String(r["Он"] ?? r["Он_code"] ?? "").replace(/\D/g, "").slice(0, 4) || String(r["Он"] ?? r["Он_code"] ?? "");
                if (!yearStr) continue;
                const indCode = String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "");
                const val = Number(r.value) || 0;
                if (!byYearExpY.has(yearStr)) byYearExpY.set(yearStr, { "0": 0, "1": 0, "8": 0, "17": 0 });
                const row = byYearExpY.get(yearStr)!;
                if (indicatorCodesExpY.includes(indCode)) row[indCode] = val;
              }
              const yearsExpY = [...byYearExpY.keys()].filter(Boolean).sort((a, b) => a.localeCompare(b));
              const toBillionExpY = (v: number) => v / 1000;
              const chartDataExpYAll = yearsExpY.map((y) => {
                const row = byYearExpY.get(y)!;
                return {
                  period: y,
                  ...Object.fromEntries(indicatorCodesExpY.map((c) => [c, toBillionExpY(row[c] ?? 0)])),
                };
              });
              const chartDataExpYFiltered =
                selectedYearLabelsIncome.length > 0
                  ? chartDataExpYAll.filter((d) => yearSetIncome.has(String(d.period)))
                  : chartDataExpYAll.filter((d) => d.period >= "2010" && d.period <= "2025");
              const from2010to2025ExpY = chartDataExpYAll.filter((d) => d.period >= "2010" && d.period <= "2025");
              const chartDataExpYDisplay = (chartDataExpYFiltered.length > 0 ? chartDataExpYFiltered : from2010to2025ExpY).filter(
                (d) => d.period >= "2010" && d.period <= "2025"
              );
              const colorsExpY = ["#0050C3", "#0891b2", "#64748b", "#10b981"];
              const totalExpenseLatest = chartDataExpYDisplay.length > 0
                ? indicatorCodesExpY.reduce((sum, c) => sum + ((chartDataExpYDisplay[chartDataExpYDisplay.length - 1] as unknown as Record<string, number>)[c] ?? 0), 0)
                : 0;
              const optionExpenseYearlyForGrid: EChartsOption = {
                backgroundColor: "#ffffff",
                tooltip: {
                  trigger: "axis",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  confine: true,
                  padding: [12, 16],
                  extraCssText: "min-width: 160px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { color: "#f1f5f9", fontSize: 12 },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    let html = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);"><span style="color:#2dd4bf;font-size:14px;">◉</span><span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period} он</span></div>`;
                    for (const item of arr) {
                      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span><span style="color:#f1f5f9;font-weight:600;">${Math.round(item.value ?? 0).toLocaleString()} тэрбум ₮</span></div>`;
                    }
                    return html;
                  },
                },
                grid: { left: 56, right: 48, bottom: 36, top: 44 },
                xAxis: {
                  type: "category",
                  data: chartDataExpYDisplay.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b7280" },
                  axisLine: { lineStyle: { color: "#e5e7eb" } },
                  axisTick: { show: false },
                  boundaryGap: false,
                },
                yAxis: {
                  type: "value",
                  min: 0,
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b7280", formatter: (v: number) => Math.round(v).toLocaleString() },
                  splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
                  axisLine: { show: false },
                  axisTick: { show: false },
                },
                legend: { show: false },
                series: indicatorCodesExpY.map((c, i) => ({
                  name: indicatorLabelsExpY[i] ?? c,
                  type: "line" as const,
                  data: chartDataExpYDisplay.map((d) => (d as unknown as Record<string, number>)[c] ?? 0),
                  symbol: "none",
                  smooth: false,
                  lineStyle: { width: 2.5, color: colorsExpY[i] },
                  itemStyle: { color: colorsExpY[i] },
                  areaStyle: {
                    color: { type: "linear" as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${colorsExpY[i]}47` }, { offset: 1, color: `${colorsExpY[i]}0d` }] },
                  },
                })),
              };

              const makeYearlySingleSeriesOption = (
                data: number[],
                name: string,
                color: string,
                periods: string[]
              ): EChartsOption => ({
                backgroundColor: "#ffffff",
                tooltip: {
                  trigger: "axis",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  confine: true,
                  padding: [12, 16],
                  extraCssText: "min-width: 160px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { color: "#f1f5f9", fontSize: 12 },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    const val = Math.round(arr[0].value ?? 0).toLocaleString();
                    return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);"><span style="color:#2dd4bf;font-size:14px;">◉</span><span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period} он</span></div><div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><span style="color:#94a3b8;font-size:12px;">${name}</span><span style="color:#f1f5f9;font-weight:600;">${val} тэрбум ₮</span></div>`;
                  },
                },
                grid: { left: 56, right: 48, bottom: 36, top: 44 },
                xAxis: {
                  type: "category",
                  data: periods,
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b7280" },
                  axisLine: { lineStyle: { color: "#e5e7eb" } },
                  axisTick: { show: false },
                  boundaryGap: false,
                },
                yAxis: {
                  type: "value",
                  min: 0,
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 11, color: "#6b7280", formatter: (v: number) => Math.round(v).toLocaleString() },
                  splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
                  axisLine: { show: false },
                  axisTick: { show: false },
                },
                legend: { show: false },
                series: [
                  { name, type: "line", data, symbol: "none", smooth: false, lineStyle: { width: 2.5, color }, itemStyle: { color }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${color}47` }, { offset: 1, color: `${color}0d` }] } as const } },
                ],
              });

              const optionIncomeTaxGrid = makeYearlySingleSeriesOption(chartDataIncomeDisplayGrid.map((d) => d.tax), "Татварын орлого", "#0050C3", chartDataIncomeDisplayGrid.map((d) => d.period));
              const optionIncomeNonTaxGrid = makeYearlySingleSeriesOption(chartDataIncomeDisplayGrid.map((d) => d.nonTax), "Татварын бус орлого", "#0050C3", chartDataIncomeDisplayGrid.map((d) => d.period));
              const expenseYearlyOptions = indicatorCodesExpY.map((c, i) =>
                makeYearlySingleSeriesOption(
                  chartDataExpYDisplay.map((d) => (d as unknown as Record<string, number>)[c] ?? 0),
                  indicatorLabelsExpY[i] ?? c,
                  "#10b981",
                  chartDataExpYDisplay.map((d) => d.period)
                )
              );
              const lastYearIncome = chartDataIncomeDisplayGrid.length > 0 ? chartDataIncomeDisplayGrid[chartDataIncomeDisplayGrid.length - 1]!.period : "";
              const taxBreakdownCodes = ["6", "11", "14", "18"];
              const taxBreakdownLabels = ["Орлогын албан татвар", "Нийгмийн даатгалын шимтгэл", "НӨАТ", "Онцгой албан татвар"];
              const incomeTaxBreakdownRows = chartDataByChartId["budget-income-tax-breakdown-yearly"] ?? [];
              const byYearTaxBreakdown = new Map<string, Record<string, number>>();
              for (const r of incomeTaxBreakdownRows) {
                const yearStr = String(r["Он"] ?? r["Он_code"] ?? "").replace(/\D/g, "").slice(0, 4) || String(r["Он"] ?? r["Он_code"] ?? "");
                if (!yearStr) continue;
                const indCode = String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "");
                const val = Number(r.value) || 0;
                if (!byYearTaxBreakdown.has(yearStr)) byYearTaxBreakdown.set(yearStr, { "6": 0, "11": 0, "14": 0, "18": 0 });
                const row = byYearTaxBreakdown.get(yearStr)!;
                if (taxBreakdownCodes.includes(indCode)) row[indCode] = val;
              }
              const taxBreakdownPeriods = chartDataIncomeDisplayGrid.map((d) => d.period);
              const toBillionTaxBreakdown = (v: number) => v / 1000;
              const taxBreakdownOptions = chartDataIncomeDisplayGrid.length > 0 && incomeTaxBreakdownRows.length > 0 ? taxBreakdownCodes.map((c, i) =>
                makeYearlySingleSeriesOption(
                  taxBreakdownPeriods.map((p) => toBillionTaxBreakdown(byYearTaxBreakdown.get(p)?.[c] ?? 0)),
                  taxBreakdownLabels[i] ?? c,
                  "#0050C3",
                  taxBreakdownPeriods
                )
              ) : [];
              const taxBreakdownLatest = chartDataIncomeDisplayGrid.length > 0 && incomeTaxBreakdownRows.length > 0 ? taxBreakdownCodes.map((c) => byYearTaxBreakdown.get(lastYearIncome)?.[c] ?? 0).map((v) => toBillionTaxBreakdown(v)) : [];
              const lastYearExpense = chartDataExpYDisplay.length > 0 ? chartDataExpYDisplay[chartDataExpYDisplay.length - 1]!.period : "";
              const taxLatest = chartDataIncomeDisplayGrid.length > 0 ? chartDataIncomeDisplayGrid[chartDataIncomeDisplayGrid.length - 1]!.tax : 0;
              const nonTaxLatest = chartDataIncomeDisplayGrid.length > 0 ? chartDataIncomeDisplayGrid[chartDataIncomeDisplayGrid.length - 1]!.nonTax : 0;
              const expenseLatestByIndicator = chartDataExpYDisplay.length > 0 ? indicatorCodesExpY.map((c) => (chartDataExpYDisplay[chartDataExpYDisplay.length - 1] as unknown as Record<string, number>)[c] ?? 0) : [];

              const budgetYearlyOption: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  confine: true,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { color: "#f1f5f9", fontSize: 12 },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    let html = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#2dd4bf;font-size:14px;">◉</span>
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period} он</span>
                    </div>`;
                    for (const item of arr) {
                      const val = Math.round(Math.abs(item.value ?? 0)).toLocaleString();
                      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span>
                        <span style="color:#f1f5f9;font-weight:600;">${val} тэрбум ₮</span>
                      </div>`;
                    }
                    return html;
                  },
                },
                grid: { left: 50, right: 50, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartDataYearlyDisplay.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: [
                  {
                    type: "value",
                    position: "left",
                    min: leftMin,
                    max: leftMax,
                    axisLabel: {
                      formatter: (v: number) => Math.round(Math.abs(v)).toLocaleString(),
                      fontFamily: "Arial, sans-serif",
                      fontSize: 10,
                      color: "#64748b",
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: true, lineStyle: { color: "#f1f5f9", type: "dashed" } },
                  },
                  {
                    type: "value",
                    position: "right",
                    min: rightMin,
                    max: rightMax,
                    axisLabel: {
                      formatter: (v: number) => `${v.toFixed(0)}`,
                      fontFamily: "Arial, sans-serif",
                      fontSize: 10,
                      color: "#6b7280",
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                  },
                ],
                graphic: [
                  {
                    type: "text",
                    left: 10,
                    top: 10,
                    style: {
                      text: "тэрбум ₮",
                      fontSize: 12,
                      fontFamily: "Arial, sans-serif",
                      fill: "#6b7280",
                    },
                  },
                ],
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [
                  {
                    name: "Тэнцвэржүүлсэн орлого",
                    type: "bar",
                    data: chartDataYearlyDisplay.map((d) => d.income),
                    itemStyle: { color: "rgba(165, 180, 252, 0.55)", borderColor: "#6366f1", borderWidth: 1 },
                    barGap: "-100%",
                    label: { show: false },
                  },
                  {
                    name: "Нийт зарлага",
                    type: "bar",
                    data: chartDataYearlyDisplay.map((d) => -d.expense),
                    itemStyle: { color: "rgba(153, 246, 228, 0.55)", borderColor: "#14b8a6", borderWidth: 1 },
                    label: { show: false },
                  },
                  {
                    name: "Тэнцэл",
                    type: "line",
                    yAxisIndex: 1,
                    data: chartDataYearlyDisplay.map((d) => d.balance),
                    symbol: "none",
                    itemStyle: { color: "#475569" },
                    lineStyle: { width: 2, color: "#475569" },
                    label: { show: false },
                  },
                ],
              };
              const n = onVar?.values?.length ?? 0;
              const yearLabels = ((onVar?.valueTexts ?? onVar?.values) ?? []) as string[];
              let defaultStart = 0;
              let defaultEnd = n - 1;
              if (n > 0 && onVar?.valueTexts?.length) {
                let idx2010 = -1;
                let idx2025 = -1;
                for (let i = 0; i < n; i++) {
                  const label = String(onVar.valueTexts?.[i] ?? "").replace(/\D/g, "").slice(0, 4);
                  const y = label.length === 4 ? parseInt(label, 10) : 0;
                  if (y === 2010) idx2010 = i;
                  if (y === 2025) idx2025 = i;
                }
                if (idx2010 >= 0 || idx2025 >= 0) {
                  const s = idx2010 >= 0 ? idx2010 : 0;
                  const e = idx2025 >= 0 ? idx2025 : n - 1;
                  defaultStart = Math.min(s, e);
                  defaultEnd = Math.max(s, e);
                }
              }
              const rangeValue = budgetYearlyRange ?? [defaultStart, defaultEnd];
              const [low, high] = [Math.max(0, Math.min(rangeValue[0], n - 1)), Math.min(n - 1, Math.max(rangeValue[1], 0))];
              const y0 = Number(String(onVar?.valueTexts?.[0] ?? "").replace(/\D/g, "").slice(0, 4)) || 0;
              const yLast = Number(String(onVar?.valueTexts?.[n - 1] ?? "").replace(/\D/g, "").slice(0, 4)) || 0;
              const ascendingLabels = y0 > yLast ? [...yearLabels].reverse() : yearLabels;
              const sliderValue: [number, number] = y0 > yLast ? [n - 1 - high, n - 1 - low] : [low, high];
              const sliderOnChange = y0 > yLast
                ? ([a, b]: [number, number]) => {
                    const origLow = n - 1 - b;
                    const origHigh = n - 1 - a;
                    setBudgetYearlyRange([origLow, origHigh]);
                    setSelections((prev) => ({ ...prev, Он: (onVar!.values as string[]).slice(origLow, origHigh + 1).map(String) }));
                  }
                : ([a, b]: [number, number]) => {
                    setBudgetYearlyRange([a, b]);
                    setSelections((prev) => ({ ...prev, Он: (onVar!.values as string[]).slice(a, b + 1).map(String) }));
                  };

              const sliderLo = sliderValue[0] ?? 0;
              const sliderHi = sliderValue[1] ?? 0;
              const yearlySliderStartLabel = String(ascendingLabels[sliderLo] ?? "").trim();
              const yearlySliderEndLabel = String(ascendingLabels[sliderHi] ?? "").trim();

              return (
                <div key={chart.id} className="space-y-6 w-full">
                  {/* МОНГОЛ УЛСЫН НЭГДСЭН ТӨСВИЙН ТЭНЦЭЛ (жилээр) — томоороо бүтэн өргөн */}
                  <div className="space-y-4 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>
                        Монгол улсын нэгдсэн төсөв
                      </h3>
                    </div>
                    {latestYearly && (
                      <div className="flex flex-wrap gap-6 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: "#6366f1" }}>Тэнцвэржүүлсэн орлого: </span>
                          <span className="text-lg font-semibold" style={{ color: "#6366f1" }}>{formatBillion(latestYearly.income)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium" style={{ color: "#14b8a6" }}>Нийт зарлага: </span>
                          <span className="text-lg font-semibold" style={{ color: "#14b8a6" }}>{formatBillion(latestYearly.expense)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Тэнцэл: </span>
                          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {latestYearly.balance >= 0 ? formatBillion(latestYearly.balance) : `- ${formatBillion(Math.abs(latestYearly.balance))}`}
                          </span>
                        </div>
                      </div>
                    )}
                    <ReactECharts
                      option={budgetYearlyOption}
                      style={{ height: 520, width: "100%" }}
                      notMerge={true}
                      lazyUpdate={true}
                    />
                  </div>
                  {n > 0 && (
                    <div className="w-full pt-2 pb-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setBudgetYearlyPlaying((p) => !p)}
                          className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                          title={budgetYearlyPlaying ? "Зогсоох" : "Тоглуулах"}
                          aria-label={budgetYearlyPlaying ? "Зогсоох" : "Тоглуулах"}
                        >
                          {budgetYearlyPlaying ? (
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
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {yearlySliderStartLabel}
                          </span>
                          <div className="min-w-0 flex-1">
                            <RangeSlider
                              min={0}
                              max={n - 1}
                              value={sliderValue}
                              onChange={sliderOnChange}
                              labels={ascendingLabels}
                              showLabels={false}
                            />
                          </div>
                          <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                            {yearlySliderEndLabel}
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                        <span>{ascendingLabels[0] ?? ""}</span>
                        <span>{ascendingLabels[n - 1] ?? ""}</span>
                      </div>
                    </div>
                  )}
                  {/* Орлого 2 цэнхэр chart, доор зарлага 4 ногоон chart (ерөнхий гарчиггүй) */}
                  <div className="w-full">
                    <div className="!grid grid-cols-1 gap-6 lg:grid-cols-2 w-full">
                      <div className="space-y-2">
                        <p className="text-base font-bold uppercase text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>Татварын орлого</p>
                        {lastYearIncome && chartDataIncomeDisplayGrid.length > 0 && (
                          <p className="chart-section-title mt-0.5 mb-0" style={{ fontFamily: "Arial, sans-serif" }}>{Math.round(taxLatest).toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 normal-case">тэрбум ₮</span> <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">({lastYearIncome})</span></p>
                        )}
                        {chartDataIncomeDisplayGrid.length > 0 ? (
                          <div className="h-[320px] w-full">
                            <ReactECharts option={optionIncomeTaxGrid} style={{ height: "100%", width: "100%" }} />
                          </div>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-bold uppercase text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>Татварын бус орлого</p>
                        {lastYearIncome && chartDataIncomeDisplayGrid.length > 0 && (
                          <p className="chart-section-title mt-0.5 mb-0" style={{ fontFamily: "Arial, sans-serif" }}>{Math.round(nonTaxLatest).toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 normal-case">тэрбум ₮</span> <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">({lastYearIncome})</span></p>
                        )}
                        {chartDataIncomeDisplayGrid.length > 0 ? (
                          <div className="h-[320px] w-full">
                            <ReactECharts option={optionIncomeNonTaxGrid} style={{ height: "100%", width: "100%" }} />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {taxBreakdownOptions.length > 0 && (
                    <div className="w-full mt-6">
                      <div className="!grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
                        {taxBreakdownOptions.map((opt, i) => (
                          <div key={i} className="space-y-2">
                            <p className="text-base font-bold uppercase text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>{taxBreakdownLabels[i] ?? ""}</p>
                            {lastYearIncome && taxBreakdownLatest[i] != null && (
                              <p className="chart-section-title mt-0.5 mb-0" style={{ fontFamily: "Arial, sans-serif" }}>{Math.round(taxBreakdownLatest[i]!).toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 normal-case">тэрбум ₮</span> <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">({lastYearIncome})</span></p>
                            )}
                            <div className="h-[280px] w-full">
                              <ReactECharts option={opt} style={{ height: "100%", width: "100%" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="w-full mt-8">
                    <h3 className="mb-3 text-base font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>Төсвийн зарлага</h3>
                    <div className="!grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
                      {chartDataExpYDisplay.length > 0 && expenseYearlyOptions.map((opt, i) => (
                        <div key={i} className="space-y-2">
                          <p className="text-base font-bold uppercase text-[#0f766e] dark:text-teal-400" style={{ fontFamily: "Arial, sans-serif" }}>{indicatorLabelsExpY[i] ?? ""}</p>
                          {lastYearExpense && (
                            <p className="chart-section-title mt-0.5 mb-0" style={{ fontFamily: "Arial, sans-serif" }}>{Math.round(expenseLatestByIndicator[i] ?? 0).toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 normal-case">тэрбум ₮</span> <span className="text-slate-500 dark:text-slate-400 text-sm font-normal">({lastYearExpense})</span></p>
                          )}
                          <div className="h-[280px] w-full">
                            <ReactECharts option={opt} style={{ height: "100%", width: "100%" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // Орлого chart нь Тэнцэл chart-тай хажууд grid-д байрласан тул тусад блокгүй
            if (config.id === "state-budget" && chart.id === "budget-unified-income-yearly") return null;

            // ТӨСВИЙН ЗАРЛАГА — Жил tab-д budget-balance-yearly блоконд орлоготой зэрэгцүүлэн area chart болгон харуулсан тул энд буцаахгүй
            if (config.id === "state-budget" && chart.id === "budget-unified-expense-yearly") return null;

            // Татварын дэлгэрэнгүй — Жил tab-д budget-balance-yearly блоконд 4 цэнхэр chart болгон харуулна
            if (config.id === "state-budget" && chart.id === "budget-income-tax-breakdown-yearly") return null;

            // State Budget combined chart rendering - Monthly (сараар)
            if (config.id === "state-budget" && chart.id === "budget-balance") {
              const incomeRows = chartDataByChartId["budget-income"] ?? [];
              const expenseRows = chartDataByChartId["budget-expense"] ?? [];
              const isCumulative = false;

              if (incomeRows.length === 0 || expenseRows.length === 0) {
                return (
                  <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                    Төсвийн мэдээлэл татагдаж байна...
                  </div>
                );
              }

              const extractPeriod = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) {
                  return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                }
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) {
                  return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                }
                const matchMonth3 = period.match(/(\d{4})\s*оны\s*(\d{1,2})/i);
                if (matchMonth3) {
                  return `${matchMonth3[1]}-${matchMonth3[2].padStart(2, "0")}`;
                }
                const matchMonth4 = period.match(/(\d{1,2})\s*сар.*?(\d{4})/i);
                if (matchMonth4) {
                  return `${matchMonth4[2]}-${matchMonth4[1].padStart(2, "0")}`;
                }
                const matchMonth5 = period.match(/^(\d{4})\/(\d{1,2})$/);
                if (matchMonth5) {
                  return `${matchMonth5[1]}-${matchMonth5[2].padStart(2, "0")}`;
                }
                const matchQuarter = period.match(/(\d{4}).*?(I{1,3}V?|IV|1|2|3|4)\s*улирал/i);
                if (matchQuarter) {
                  const year = matchQuarter[1];
                  const q = matchQuarter[2];
                  let qNum = "1";
                  if (q === "I" || q === "1") qNum = "Q1";
                  else if (q === "II" || q === "2") qNum = "Q2";
                  else if (q === "III" || q === "3") qNum = "Q3";
                  else if (q === "IV" || q === "4") qNum = "Q4";
                  return `${year}-${qNum}`;
                }
                const matchYearOnly = period.match(/^(\d{4})$/);
                if (matchYearOnly) {
                  return `${matchYearOnly[1]}-01`;
                }
                return null;
              };

              const incomeByPeriod = new Map<string, number>();
              for (const r of incomeRows) {
                const periodStr = String(r["Он"] ?? r["Он_code"] ?? "");
                const key = extractPeriod(periodStr);
                if (key) {
                  incomeByPeriod.set(key, Number(r.value) || 0);
                }
              }

              const expenseByPeriod = new Map<string, number>();
              for (const r of expenseRows) {
                const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                const key = extractPeriod(periodStr);
                if (key) {
                  expenseByPeriod.set(key, Number(r.value) || 0);
                }
              }

              const allPeriods = [...new Set([...incomeByPeriod.keys(), ...expenseByPeriod.keys()])]
                .sort((a, b) => a.localeCompare(b));

              const toBillion = (v: number) => v / 1000;
              const formatBillion = (v: number) => `${Math.round(v).toLocaleString()} тэрбум ₮`;

              const allChartData = allPeriods.map((p) => ({
                period: p,
                income: toBillion(incomeByPeriod.get(p) ?? 0),
                expense: toBillion(expenseByPeriod.get(p) ?? 0),
                balance: toBillion((incomeByPeriod.get(p) ?? 0) - (expenseByPeriod.get(p) ?? 0)),
              }));

              const n = allChartData.length;
              budgetMonthlyNRef.current = n;
              const defaultStartIndex = allChartData.findIndex((d) => d.period >= "2021-01");
              const defaultStart = defaultStartIndex >= 0 ? defaultStartIndex : 0;
              const currentRange = budgetMonthlyRange ?? [defaultStart, n - 1];
              const [rangeStart, rangeEnd] = [
                Math.min(currentRange[0], Math.max(0, n - 1)),
                Math.min(currentRange[1], Math.max(0, n - 1))
              ];
              const chartData = allChartData.slice(rangeStart, rangeEnd + 1);

              const latestData = chartData[chartData.length - 1];
              const latestPeriodLabel = latestData ? `${latestData.period.replace("-", " оны ")} сар` : "";

              // Calculate axis ranges to align 0 on both axes
              const maxIncome = Math.max(...chartData.map((d) => d.income));
              const maxExpense = Math.max(...chartData.map((d) => d.expense));
              const maxBalance = Math.max(...chartData.map((d) => Math.abs(d.balance)));
              
              // Left axis: from -maxExpense to +maxIncome
              const leftMax = Math.max(maxIncome, maxExpense) * 1.1;
              const leftMin = -leftMax;
              
              // Right axis: proportional to left axis to align 0
              const rightMax = maxBalance * 1.2;
              const rightMin = -rightMax;

              const budgetChartOption: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  confine: true,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { color: "#f1f5f9", fontSize: 12 },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string; color: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    let html = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#2dd4bf;font-size:14px;">◉</span>
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                    </div>`;
                    for (const item of arr) {
                      const val = Math.round(Math.abs(item.value ?? 0)).toLocaleString();
                      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span>
                        <span style="color:#f1f5f9;font-weight:600;">${val} тэрбум ₮</span>
                      </div>`;
                    }
                    return html;
                  },
                },
                grid: { left: 50, right: 50, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartData.map((d) => d.period),
                  axisLabel: { 
                    fontFamily: "Arial, sans-serif", 
                    fontSize: 10,
                    color: "#64748b",
                  },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: [
                  {
                    type: "value",
                    position: "left",
                    min: leftMin,
                    max: leftMax,
                    axisLabel: {
                      formatter: (v: number) => Math.round(Math.abs(v)).toLocaleString(),
                      fontFamily: "Arial, sans-serif",
                      fontSize: 10,
                      color: "#64748b",
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: true, lineStyle: { color: "#f1f5f9", type: "dashed" } },
                  },
                  {
                    type: "value",
                    position: "right",
                    min: rightMin,
                    max: rightMax,
                    axisLabel: { 
                      formatter: (v: number) => `${v.toFixed(0)}`, 
                      fontFamily: "Arial, sans-serif",
                      fontSize: 10,
                      color: "#6b7280",
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                  },
                ],
                graphic: [
                  {
                    type: "text",
                    left: 10,
                    top: 10,
                    style: {
                      text: "тэрбум ₮",
                      fontSize: 12,
                      fontFamily: "Arial, sans-serif",
                      fill: "#6b7280",
                    },
                  },
                ],
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [
                  {
                    name: "Тэнцвэржүүлсэн орлого",
                    type: "bar",
                    data: chartData.map((d) => d.income),
                    itemStyle: {
                      color: "rgba(165, 180, 252, 0.55)",
                      borderColor: "#6366f1",
                      borderWidth: 1,
                    },
                    barGap: "-100%",
                    label: { show: false },
                  },
                  {
                    name: "Нийт зарлага",
                    type: "bar",
                    data: chartData.map((d) => -d.expense),
                    itemStyle: {
                      color: "rgba(153, 246, 228, 0.55)",
                      borderColor: "#14b8a6",
                      borderWidth: 1,
                    },
                    label: { show: false },
                  },
                  {
                    name: "Тэнцэл",
                    type: "line",
                    yAxisIndex: 1,
                    data: chartData.map((d) => d.balance),
                    symbol: "none",
                    itemStyle: { color: "#475569" },
                    lineStyle: { width: 2, color: "#475569" },
                    label: { show: false },
                  },
                ],
              };

              return (
                <div key={chart.id} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>
                      Монгол улсын нэгдсэн төсөв (сараар)
                    </h3>
                  </div>
                  {latestData && (
                    <div className="flex flex-wrap gap-6 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                      <div>
                        <span className="text-sm font-medium" style={{ color: "#6366f1" }}>Тэнцвэржүүлсэн орлого: </span>
                        <span className="text-lg font-semibold" style={{ color: "#6366f1" }}>{formatBillion(latestData.income)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: "#14b8a6" }}>Нийт зарлага: </span>
                        <span className="text-lg font-semibold" style={{ color: "#14b8a6" }}>{formatBillion(latestData.expense)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Тэнцэл: </span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {latestData.balance >= 0 ? formatBillion(latestData.balance) : `- ${formatBillion(Math.abs(latestData.balance))}`}
                        </span>
                      </div>
                    </div>
                  )}
                  <ReactECharts
                    option={budgetChartOption}
                    style={{ height: 400, width: "100%" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                  {n > 1 && (
                    <div className="mt-3 pt-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setBudgetMonthlyPlaying((p) => !p)}
                          className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                          title={budgetMonthlyPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                          aria-label={budgetMonthlyPlaying ? "Зогсоох" : "Тоглуулах"}
                        >
                          {budgetMonthlyPlaying ? (
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
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {allChartData[rangeStart]?.period ?? ""}
                          </span>
                          <div className="min-w-0 flex-1">
                            <RangeSlider
                              min={0}
                              max={n - 1}
                              value={[rangeStart, rangeEnd]}
                              onChange={(val) => {
                                setBudgetMonthlyPlaying(false);
                                setBudgetMonthlyRange(val);
                              }}
                              labels={allChartData.map((d) => d.period)}
                              showLabels={false}
                            />
                          </div>
                          <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                            {allChartData[rangeEnd]?.period ?? ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            // State Budget combined chart rendering - Cumulative (өссөн дүнгээр)
            if (config.id === "state-budget" && chart.id === "budget-balance-cumulative") {
              const incomeRows = chartDataByChartId["budget-income-cumulative"] ?? [];
              const expenseRows = chartDataByChartId["budget-expense-cumulative"] ?? [];

              if (incomeRows.length === 0 || expenseRows.length === 0) {
                return (
                  <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                    Төсвийн мэдээлэл татагдаж байна...
                  </div>
                );
              }

              const extractPeriodCum = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                const matchMonth3 = period.match(/(\d{4})\s*оны\s*(\d{1,2})/i);
                if (matchMonth3) return `${matchMonth3[1]}-${matchMonth3[2].padStart(2, "0")}`;
                const matchMonth4 = period.match(/(\d{1,2})\s*сар.*?(\d{4})/i);
                if (matchMonth4) return `${matchMonth4[2]}-${matchMonth4[1].padStart(2, "0")}`;
                const matchMonth5 = period.match(/^(\d{4})\/(\d{1,2})$/);
                if (matchMonth5) return `${matchMonth5[1]}-${matchMonth5[2].padStart(2, "0")}`;
                const matchYearOnly = period.match(/^(\d{4})$/);
                if (matchYearOnly) return `${matchYearOnly[1]}-01`;
                return null;
              };

              const incomeByPeriodCum = new Map<string, number>();
              for (const r of incomeRows) {
                const periodStr = String(r["Он"] ?? r["Он_code"] ?? "");
                const key = extractPeriodCum(periodStr);
                if (key) incomeByPeriodCum.set(key, Number(r.value) || 0);
              }

              const expenseByPeriodCum = new Map<string, number>();
              for (const r of expenseRows) {
                const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                const key = extractPeriodCum(periodStr);
                if (key) expenseByPeriodCum.set(key, Number(r.value) || 0);
              }

              const allPeriodsCum = [...new Set([...incomeByPeriodCum.keys(), ...expenseByPeriodCum.keys()])]
                .sort((a, b) => a.localeCompare(b));

              const toBillionCum = (v: number) => v / 1000;
              const formatBillionCum = (v: number) => `${Math.round(v).toLocaleString()} тэрбум ₮`;

              // Month filter options
              const monthOptionsCum = [...new Set(allPeriodsCum.map((p) => p.split("-")[1]))].filter(Boolean).sort();
              const monthNamesCum: Record<string, string> = {
                "01": "1 сар", "02": "2 сар", "03": "3 сар", "04": "4 сар",
                "05": "5 сар", "06": "6 сар", "07": "7 сар", "08": "8 сар",
                "09": "9 сар", "10": "10 сар", "11": "11 сар", "12": "12 сар",
              };

              // Filter by selected month
              const monthFilteredPeriodsCum = budgetMonthFilter === "all" 
                ? allPeriodsCum 
                : allPeriodsCum.filter((p) => p.split("-")[1] === budgetMonthFilter);

              const allChartDataCum = monthFilteredPeriodsCum.map((p) => ({
                period: p,
                income: toBillionCum(incomeByPeriodCum.get(p) ?? 0),
                expense: toBillionCum(expenseByPeriodCum.get(p) ?? 0),
                balance: toBillionCum((incomeByPeriodCum.get(p) ?? 0) - (expenseByPeriodCum.get(p) ?? 0)),
              }));

              const nCum = allChartDataCum.length;
              budgetPlayMaxRef.current = nCum;
              const defaultStartIndexCum = allChartDataCum.findIndex((d) => d.period >= "2021-01");
              const defaultStartCum = defaultStartIndexCum >= 0 ? defaultStartIndexCum : 0;
              const currentRangeCum = budgetRange ?? [defaultStartCum, nCum - 1];
              const [rangeStartCum, rangeEndCum] = [
                Math.min(currentRangeCum[0], Math.max(0, nCum - 1)),
                Math.min(currentRangeCum[1], Math.max(0, nCum - 1))
              ];
              const chartDataCum = allChartDataCum.slice(rangeStartCum, rangeEndCum + 1);

              const latestDataCum = chartDataCum[chartDataCum.length - 1];
              const latestPeriodLabelCum = latestDataCum ? `${latestDataCum.period.replace("-", " оны ")} сар` : "";

              // Calculate axis ranges
              const maxIncomeCum = Math.max(...chartDataCum.map((d) => d.income), 1);
              const maxExpenseCum = Math.max(...chartDataCum.map((d) => d.expense), 1);
              const maxBalanceCum = Math.max(...chartDataCum.map((d) => Math.abs(d.balance)), 1);
              const leftMaxCum = Math.max(maxIncomeCum, maxExpenseCum) * 1.1;
              const leftMinCum = -leftMaxCum;
              const rightMaxCum = maxBalanceCum * 1.2;
              const rightMinCum = -rightMaxCum;

              const budgetChartOptionCum: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  confine: true,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { color: "#f1f5f9", fontSize: 12 },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string; color: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    let html = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#2dd4bf;font-size:14px;">◉</span>
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                    </div>`;
                    for (const item of arr) {
                      const val = Math.round(Math.abs(item.value ?? 0)).toLocaleString();
                      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span>
                        <span style="color:#f1f5f9;font-weight:600;">${val} тэрбум ₮</span>
                      </div>`;
                    }
                    return html;
                  },
                },
                grid: { left: 50, right: 50, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartDataCum.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: [
                  {
                    type: "value",
                    position: "left",
                    min: leftMinCum,
                    max: leftMaxCum,
                    axisLabel: { formatter: (v: number) => Math.round(Math.abs(v)).toLocaleString(), fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: true, lineStyle: { color: "#f1f5f9", type: "dashed" } },
                  },
                  {
                    type: "value",
                    position: "right",
                    min: rightMinCum,
                    max: rightMaxCum,
                    axisLabel: { formatter: (v: number) => `${v.toFixed(0)}`, fontFamily: "Arial, sans-serif", fontSize: 10, color: "#6b7280" },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                  },
                ],
                graphic: [{ type: "text", left: 10, top: 10, style: { text: "тэрбум ₮", fontSize: 12, fontFamily: "Arial, sans-serif", fill: "#6b7280" } }],
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [
                  {
                    name: "Тэнцвэржүүлсэн орлого",
                    type: "bar",
                    data: chartDataCum.map((d) => d.income),
                    itemStyle: { color: "rgba(165, 180, 252, 0.55)", borderColor: "#6366f1", borderWidth: 1 },
                    barGap: "-100%",
                    label: { show: false },
                  },
                  {
                    name: "Нийт зарлага",
                    type: "bar",
                    data: chartDataCum.map((d) => -d.expense),
                    itemStyle: { color: "rgba(153, 246, 228, 0.55)", borderColor: "#14b8a6", borderWidth: 1 },
                    label: { show: false },
                  },
                  {
                    name: "Тэнцэл",
                    type: "line",
                    yAxisIndex: 1,
                    data: chartDataCum.map((d) => d.balance),
                    symbol: "none",
                    itemStyle: { color: "#475569" },
                    lineStyle: { width: 2, color: "#475569" },
                    label: { show: false },
                  },
                ],
              };

              return (
                <div key={chart.id} className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-4">
                    <div className="min-w-0 w-full md:w-auto">
                      <h3 className="text-base font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>
                        Монгол улсын нэгдсэн төсөв (өссөн дүнгээр)
                      </h3>
                    </div>
                    <div style={{ fontFamily: "Arial, sans-serif" }}>
                      <select
                        value={budgetMonthFilter}
                        onChange={(e) => {
                          setBudgetMonthFilter(e.target.value);
                          setBudgetRange(null);
                        }}
                        className="px-3 py-1.5 rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] text-sm"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {monthOptionsCum.map((m) => (
                          <option key={m} value={m}>{monthNamesCum[m] || m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {latestDataCum && (
                    <div className="flex flex-wrap gap-6 mb-2" style={{ fontFamily: "Arial, sans-serif" }}>
                      <div>
                        <span className="text-sm font-medium" style={{ color: "#6366f1" }}>Тэнцвэржүүлсэн орлого: </span>
                        <span className="text-lg font-semibold" style={{ color: "#6366f1" }}>{formatBillionCum(latestDataCum.income)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: "#14b8a6" }}>Нийт зарлага: </span>
                        <span className="text-lg font-semibold" style={{ color: "#14b8a6" }}>{formatBillionCum(latestDataCum.expense)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Тэнцэл: </span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {latestDataCum.balance >= 0 ? formatBillionCum(latestDataCum.balance) : `- ${formatBillionCum(Math.abs(latestDataCum.balance))}`}
                        </span>
                      </div>
                    </div>
                  )}
                  <ReactECharts
                    option={budgetChartOptionCum}
                    style={{ height: 400, width: "100%" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                  {nCum > 1 && (
                    <div className="mt-3 pt-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!budgetIsPlaying) {
                              const atEnd = rangeEndCum >= nCum - 1;
                              if (atEnd) {
                                setBudgetRange([0, Math.min(Math.floor(nCum * 0.3), nCum - 1)]);
                              }
                            }
                            setBudgetIsPlaying((p) => !p);
                          }}
                          className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                          title={budgetIsPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                          aria-label={budgetIsPlaying ? "Зогсоох" : "Тоглуулах"}
                        >
                          {budgetIsPlaying ? (
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
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {allChartDataCum[rangeStartCum]?.period ?? ""}
                          </span>
                          <div className="min-w-0 flex-1">
                            <RangeSlider
                              min={0}
                              max={nCum - 1}
                              value={[rangeStartCum, rangeEndCum]}
                              onChange={(val) => setBudgetRange(val)}
                              labels={allChartDataCum.map((d) => d.period)}
                              showLabels={false}
                            />
                          </div>
                          <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                            {allChartDataCum[rangeEndCum]?.period ?? ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            // Сар tab: ТӨСВИЙН ОРЛОГО / ТӨСВИЙН ЗАРЛАГА-г Тэнцэл (сараар)-ийн доор budget-balance блоконд харуулна, энд рендер хийхгүй
            if (config.id === "state-budget" && budgetPeriodTab === "Сар" && chart.id === "budget-income") {
              return null;
            }
            if (config.id === "state-budget" && budgetPeriodTab === "Сар" && chart.id === "budget-expense") return null;
            if (config.id === "state-budget" && (chart.id === "budget-income" || chart.id === "budget-expense" || chart.id === "budget-income-cumulative" || chart.id === "budget-expense-cumulative")) {
              return null;
            }

            // Budget Income Category Charts - Row 1 (Татварын орлого + Татварын бус орлого)
            if (config.id === "state-budget" && chart.id === "budget-tax-income") {
              const row1Charts = [
                { id: "budget-tax-income", title: "Татварын орлого", color: "#0050C3" },
                { id: "budget-other-income", title: "Татварын бус орлого", color: "#0050C3" },
              ];

              const extractPeriodCat = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                const matchYearOnly = period.match(/^(\d{4})$/);
                if (matchYearOnly) return `${matchYearOnly[1]}-01`;
                return null;
              };

              const toBillionCat = (v: number) => v / 1000;

              const renderCategoryChart = (chartDef: { id: string; title: string; color: string }) => {
                const categoryRows = chartDataByChartId[chartDef.id] ?? [];
                
                if (categoryRows.length === 0) {
                  return (
                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                      {chartDef.title} мэдээлэл татагдаж байна...
                    </div>
                  );
                }

                const dataByPeriod = new Map<string, number>();
                for (const r of categoryRows) {
                  const periodStr = String(r["Он"] ?? r["Он_code"] ?? "");
                  const period = extractPeriodCat(periodStr);
                  if (!period) continue;
                  dataByPeriod.set(period, (dataByPeriod.get(period) ?? 0) + (Number(r.value) || 0));
                }

                const allPeriodsCatRaw = [...dataByPeriod.keys()].sort();
                
                // Apply same month filter as cumulative chart
                const monthFilteredPeriods = budgetMonthFilter === "all" 
                  ? allPeriodsCatRaw 
                  : allPeriodsCatRaw.filter((p) => p.split("-")[1] === budgetMonthFilter);

                // Apply same range as cumulative chart
                const nCat = monthFilteredPeriods.length;
                const defaultStartCat = Math.max(0, monthFilteredPeriods.findIndex((d) => d >= "2021-01"));
                const currentRangeCat = budgetRange ?? [defaultStartCat, nCat - 1];
                const [rangeStartCat, rangeEndCat] = [
                  Math.min(currentRangeCat[0], Math.max(0, nCat - 1)),
                  Math.min(currentRangeCat[1], Math.max(0, nCat - 1))
                ];
                const allPeriodsCat = monthFilteredPeriods.slice(rangeStartCat, rangeEndCat + 1);
                const labelSkipRow1 = Math.max(0, Math.ceil(allPeriodsCat.length / 8) - 1);

                const categoryChartOption: EChartsOption = {
                  tooltip: {
                    trigger: "axis",
                    borderColor: "#0d9488",
                    borderWidth: 1,
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    confine: true,
                    padding: [12, 16],
                    extraCssText: "min-width: 160px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                    textStyle: { color: "#f1f5f9", fontSize: 12 },
                    formatter: (params: unknown) => {
                      const arr = params as { value: number; axisValueLabel: string }[];
                      if (!arr?.length) return "";
                      const period = arr[0].axisValueLabel;
                      const raw = arr[0].value ?? 0;
                      const val =
                        raw < 0 ? `- ${Math.round(Math.abs(raw)).toLocaleString()}` : Math.round(raw).toLocaleString();
                      return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);"><span style="color:#2dd4bf;font-size:14px;">◉</span><span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span></div><div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><span style="color:#94a3b8;font-size:12px;">${chartDef.title}</span><span style="color:#f1f5f9;font-weight:600;">${val} тэрбум ₮</span></div>`;
                    },
                  },
                  grid: { left: 50, right: 10, bottom: 30, top: 30 },
                  xAxis: {
                    type: "category",
                    data: allPeriodsCat,
                    axisLabel: {
                      fontFamily: "Arial, sans-serif",
                      fontSize: 9,
                      color: "#64748b",
                      interval: labelSkipRow1,
                    },
                    axisLine: { lineStyle: { color: "#e2e8f0" } },
                    axisTick: { show: false },
                  },
                  yAxis: {
                    type: "value",
                    axisLabel: { 
                      formatter: (v: number) =>
                        v < 0 ? `- ${Math.round(Math.abs(v)).toLocaleString()}` : Math.round(v).toLocaleString(),
                      fontFamily: "Arial, sans-serif", 
                      fontSize: 9, 
                      color: "#64748b" 
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { lineStyle: { color: "#e2e8f0", type: "dashed" } },
                  },
                  textStyle: { fontFamily: "Arial, sans-serif" },
                  series: [
                    {
                      name: chartDef.title,
                      type: "line",
                      data: allPeriodsCat.map((p) => toBillionCat(dataByPeriod.get(p) ?? 0)),
                      symbol: "none",
                      itemStyle: { color: chartDef.color },
                      lineStyle: { width: 2, color: chartDef.color },
                      areaStyle: { 
                        color: {
                          type: "linear",
                          x: 0, y: 0, x2: 0, y2: 1,
                          colorStops: [
                            { offset: 0, color: `${chartDef.color}40` },
                            { offset: 1, color: `${chartDef.color}05` },
                          ],
                        },
                      },
                    },
                  ],
                };

                const latestValue = allPeriodsCat.length > 0 ? toBillionCat(dataByPeriod.get(allPeriodsCat[allPeriodsCat.length - 1]) ?? 0) : 0;
                const latestPeriod = allPeriodsCat[allPeriodsCat.length - 1] ?? "";

                const fmtVal = (v: number) =>
                  v < 0 ? `- ${Math.round(Math.abs(v)).toLocaleString()}` : Math.round(v).toLocaleString();

                return (
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>
                        {chartDef.title.toUpperCase()}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-2" style={{ fontFamily: "Arial, sans-serif" }}>
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{fmtVal(latestValue)}</span>
                      <span className="text-xs text-slate-500">тэрбум ₮ ({latestPeriod})</span>
                    </div>
                    <ReactECharts
                      option={categoryChartOption}
                      style={{ height: 200, width: "100%" }}
                      notMerge={true}
                      lazyUpdate={true}
                    />
                  </div>
                );
              };

              return (
                <div key={chart.id} className="space-y-4">
                  <div className="!grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
                    {row1Charts.map((c) => (
                      <div key={c.id}>{renderCategoryChart(c)}</div>
                    ))}
                  </div>
                </div>
              );
            }

            // Budget Income Category Charts - Row 2 (4 charts)
            if (config.id === "state-budget" && chart.id === "budget-income-tax") {
              const row2Charts = [
                { id: "budget-income-tax", title: "Орлогын албан татвар", color: "#0050C3" },
                { id: "budget-social-insurance", title: "Нийгмийн даатгалын орлого", color: "#0050C3" },
                { id: "budget-vat", title: "НӨАТ", color: "#0050C3" },
                { id: "budget-excise-tax", title: "Онцгой албан татвар", color: "#0050C3" },
              ];

              const extractPeriodCat = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                const matchYearOnly = period.match(/^(\d{4})$/);
                if (matchYearOnly) return `${matchYearOnly[1]}-01`;
                return null;
              };

              const toBillionCat = (v: number) => v / 1000;

              const renderCategoryChart = (chartDef: { id: string; title: string; color: string }) => {
                const categoryRows = chartDataByChartId[chartDef.id] ?? [];
                
                if (categoryRows.length === 0) {
                  return (
                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                      {chartDef.title} мэдээлэл татагдаж байна...
                    </div>
                  );
                }

                const dataByPeriod = new Map<string, number>();
                for (const r of categoryRows) {
                  const periodStr = String(r["Он"] ?? r["Он_code"] ?? "");
                  const period = extractPeriodCat(periodStr);
                  if (!period) continue;
                  dataByPeriod.set(period, (dataByPeriod.get(period) ?? 0) + (Number(r.value) || 0));
                }

                const allPeriodsCatRaw = [...dataByPeriod.keys()].sort();
                
                // Apply same month filter as cumulative chart
                const monthFilteredPeriods = budgetMonthFilter === "all" 
                  ? allPeriodsCatRaw 
                  : allPeriodsCatRaw.filter((p) => p.split("-")[1] === budgetMonthFilter);

                // Apply same range as cumulative chart
                const nCat = monthFilteredPeriods.length;
                const defaultStartCat = Math.max(0, monthFilteredPeriods.findIndex((d) => d >= "2021-01"));
                const currentRangeCat = budgetRange ?? [defaultStartCat, nCat - 1];
                const [rangeStartCat, rangeEndCat] = [
                  Math.min(currentRangeCat[0], Math.max(0, nCat - 1)),
                  Math.min(currentRangeCat[1], Math.max(0, nCat - 1))
                ];
                const allPeriodsCat = monthFilteredPeriods.slice(rangeStartCat, rangeEndCat + 1);

                const labelSkip = Math.max(0, Math.ceil(allPeriodsCat.length / 8) - 1);

                const categoryChartOption: EChartsOption = {
                  tooltip: {
                    trigger: "axis",
                    borderColor: "#0d9488",
                    borderWidth: 1,
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    confine: true,
                    padding: [12, 16],
                    extraCssText: "min-width: 160px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                    textStyle: { color: "#f1f5f9", fontSize: 12 },
                    formatter: (params: unknown) => {
                      const arr = params as { value: number; axisValueLabel: string }[];
                      if (!arr?.length) return "";
                      const period = arr[0].axisValueLabel;
                      const raw = arr[0].value ?? 0;
                      const val =
                        raw < 0 ? `- ${Math.round(Math.abs(raw)).toLocaleString()}` : Math.round(raw).toLocaleString();
                      return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);"><span style="color:#2dd4bf;font-size:14px;">◉</span><span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span></div><div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><span style="color:#94a3b8;font-size:12px;">${chartDef.title}</span><span style="color:#f1f5f9;font-weight:600;">${val} тэрбум ₮</span></div>`;
                    },
                  },
                  grid: { left: 45, right: 10, bottom: 30, top: 30 },
                  xAxis: {
                    type: "category",
                    data: allPeriodsCat,
                    axisLabel: {
                      fontFamily: "Arial, sans-serif",
                      fontSize: 8,
                      color: "#64748b",
                      interval: labelSkip,
                    },
                    axisLine: { lineStyle: { color: "#e2e8f0" } },
                    axisTick: { show: false },
                  },
                  yAxis: {
                    type: "value",
                    axisLabel: { 
                      formatter: (v: number) =>
                        v < 0 ? `- ${Math.round(Math.abs(v)).toLocaleString()}` : Math.round(v).toLocaleString(),
                      fontFamily: "Arial, sans-serif", 
                      fontSize: 8, 
                      color: "#64748b" 
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { lineStyle: { color: "#e2e8f0", type: "dashed" } },
                  },
                  textStyle: { fontFamily: "Arial, sans-serif" },
                  series: [
                    {
                      name: chartDef.title,
                      type: "line",
                      data: allPeriodsCat.map((p) => toBillionCat(dataByPeriod.get(p) ?? 0)),
                      symbol: "none",
                      itemStyle: { color: chartDef.color },
                      lineStyle: { width: 2, color: chartDef.color },
                      areaStyle: { 
                        color: {
                          type: "linear",
                          x: 0, y: 0, x2: 0, y2: 1,
                          colorStops: [
                            { offset: 0, color: `${chartDef.color}40` },
                            { offset: 1, color: `${chartDef.color}05` },
                          ],
                        },
                      },
                    },
                  ],
                };

                const latestValue = allPeriodsCat.length > 0 ? toBillionCat(dataByPeriod.get(allPeriodsCat[allPeriodsCat.length - 1]) ?? 0) : 0;
                const latestPeriod = allPeriodsCat[allPeriodsCat.length - 1] ?? "";
                const fmtVal = (v: number) =>
                  v < 0 ? `- ${Math.round(Math.abs(v)).toLocaleString()}` : Math.round(v).toLocaleString();

                return (
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>
                        {chartDef.title.toUpperCase()}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-2" style={{ fontFamily: "Arial, sans-serif" }}>
                      <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{fmtVal(latestValue)}</span>
                      <span className="text-xs text-slate-500">тэрбум ₮ ({latestPeriod})</span>
                    </div>
                    <ReactECharts
                      option={categoryChartOption}
                      style={{ height: 160, width: "100%" }}
                      notMerge={true}
                      lazyUpdate={true}
                    />
                  </div>
                );
              };

              return (
                <div key={chart.id} className="space-y-4">
                  <div className="!grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {row2Charts.map((c) => (
                      <div key={c.id}>{renderCategoryChart(c)}</div>
                    ))}
                  </div>
                </div>
              );
            }

            // Budget Expense Category Charts — ТӨСВИЙН ЗАРЛАГА: Нийт зарлага, Эргэж төлөгдөх цэвэр зээл урд, дараа нь Урсгал/Хөрөнгийн зардал
            if (config.id === "state-budget" && chart.id === "budget-total-expense") {
              const expenseChartsBase = [
                { id: "budget-total-expense", title: "Нийт зарлага", color: "#10b981" },
                { id: "budget-net-loan", title: "Эргэж төлөгдөх цэвэр зээл", color: "#10b981" },
                { id: "budget-current-expense", title: "Урсгал зардал", color: "#10b981" },
                { id: "budget-capital-expense", title: "Хөрөнгийн зардал", color: "#10b981" },
              ];
              const expenseCharts = expenseChartsBase;

              const extractPeriodExp = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                const matchMonth3 = period.match(/(\d{4})\s*оны\s*(\d{1,2})/i);
                if (matchMonth3) return `${matchMonth3[1]}-${matchMonth3[2].padStart(2, "0")}`;
                const matchMonth4 = period.match(/(\d{1,2})\s*сар.*?(\d{4})/i);
                if (matchMonth4) return `${matchMonth4[2]}-${matchMonth4[1].padStart(2, "0")}`;
                const matchMonth5 = period.match(/^(\d{4})\/(\d{1,2})$/);
                if (matchMonth5) return `${matchMonth5[1]}-${matchMonth5[2].padStart(2, "0")}`;
                const matchYearOnly = period.match(/^(\d{4})$/);
                if (matchYearOnly) return `${matchYearOnly[1]}-01`;
                return null;
              };

              const renderExpenseChart = (chartDef: { id: string; title: string; color: string }) => {
                const expenseRows = chartDataByChartId[chartDef.id] ?? [];
                
                if (expenseRows.length === 0) {
                  return (
                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                      {chartDef.title} мэдээлэл татагдаж байна...
                    </div>
                  );
                }

                const dataByPeriod = new Map<string, number>();
                for (const row of expenseRows) {
                  const periodRaw = String(row["Сар"] ?? row["Сар_code"] ?? "");
                  const period = extractPeriodExp(periodRaw);
                  if (!period) continue;
                  const val = Number(row.value);
                  if (!Number.isFinite(val)) continue;
                  dataByPeriod.set(period, (dataByPeriod.get(period) ?? 0) + val);
                }

                const allPeriodsExpRaw = Array.from(dataByPeriod.keys()).sort();
                
                // Apply same month filter as cumulative chart
                const monthFilteredPeriodsExp = budgetMonthFilter === "all" 
                  ? allPeriodsExpRaw 
                  : allPeriodsExpRaw.filter((p) => p.split("-")[1] === budgetMonthFilter);

                // Apply same range as cumulative chart
                const nExp = monthFilteredPeriodsExp.length;
                const defaultStartExp = Math.max(0, monthFilteredPeriodsExp.findIndex((d) => d >= "2021-01"));
                const currentRangeExp = budgetRange ?? [defaultStartExp, nExp - 1];
                const [rangeStartExp, rangeEndExp] = [
                  Math.min(currentRangeExp[0], Math.max(0, nExp - 1)),
                  Math.min(currentRangeExp[1], Math.max(0, nExp - 1))
                ];
                const allPeriodsExp = monthFilteredPeriodsExp.slice(rangeStartExp, rangeEndExp + 1);

                if (allPeriodsExp.length === 0) return null;

                const toBillionExp = (v: number) => v / 1000;
                const latestValue = allPeriodsExp.length > 0 ? toBillionExp(dataByPeriod.get(allPeriodsExp[allPeriodsExp.length - 1]) ?? 0) : 0;
                const latestPeriod = allPeriodsExp[allPeriodsExp.length - 1] ?? "";

                const expLabelSkip = Math.max(0, Math.ceil(allPeriodsExp.length / 8) - 1);

                const expenseChartOption: EChartsOption = {
                  tooltip: {
                    trigger: "axis",
                    borderColor: "#0d9488",
                    borderWidth: 1,
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    confine: true,
                    padding: [12, 16],
                    extraCssText: "min-width: 160px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                    textStyle: { color: "#f1f5f9", fontSize: 12 },
                    formatter: (params: unknown) => {
                      const p = params as { name: string; value: number; color: string }[];
                      if (!p.length) return "";
                      const period = p[0].name;
                      const raw = p[0].value ?? 0;
                      const val =
                        raw < 0 ? `- ${Math.round(Math.abs(raw)).toLocaleString()}` : Math.round(raw).toLocaleString();
                      return `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);"><span style="color:#2dd4bf;font-size:14px;">◉</span><span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span></div><div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><span style="color:#94a3b8;font-size:12px;">${chartDef.title}</span><span style="color:#f1f5f9;font-weight:600;">${val} тэрбум ₮</span></div>`;
                    },
                  },
                  grid: { top: 30, right: 10, bottom: 30, left: 50 },
                  xAxis: {
                    type: "category",
                    data: allPeriodsExp,
                    axisLine: { lineStyle: { color: "#e5e7eb" } },
                    axisTick: { show: false },
                    axisLabel: {
                      color: "#6b7280",
                      fontSize: 9,
                      fontFamily: "Arial, sans-serif",
                      interval: expLabelSkip,
                    },
                  },
                  yAxis: {
                    type: "value",
                    scale: true,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
                    axisLabel: {
                      color: "#6b7280",
                      fontSize: 9,
                      fontFamily: "Arial, sans-serif",
                      formatter: (v: number) =>
                        v < 0 ? `- ${Math.round(Math.abs(v)).toLocaleString()}` : Math.round(v).toLocaleString(),
                    },
                  },
                  series: [
                    {
                      type: "line",
                      data: allPeriodsExp.map((p) => toBillionExp(dataByPeriod.get(p) ?? 0)),
                      smooth: true,
                      symbol: "none",
                      lineStyle: { color: chartDef.color, width: 2 },
                      areaStyle: {
                        color: {
                          type: "linear",
                          x: 0, y: 0, x2: 0, y2: 1,
                          colorStops: [
                            { offset: 0, color: `${chartDef.color}40` },
                            { offset: 1, color: `${chartDef.color}05` },
                          ],
                        },
                      },
                    },
                  ],
                };

                const fmtValExp = (v: number) =>
                  v < 0 ? `- ${Math.round(Math.abs(v)).toLocaleString()}` : Math.round(v).toLocaleString();

                return (
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-tight text-[#0f766e] dark:text-teal-400" style={{ fontFamily: "Arial, sans-serif" }}>
                        {chartDef.title.toUpperCase()}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-2" style={{ fontFamily: "Arial, sans-serif" }}>
                      <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{fmtValExp(latestValue)}</span>
                      <span className="text-xs text-slate-500">тэрбум ₮ ({latestPeriod})</span>
                    </div>
                    <ReactECharts
                      option={expenseChartOption}
                      style={{ height: 160, width: "100%" }}
                      notMerge={true}
                      lazyUpdate={true}
                    />
                  </div>
                );
              };

              return (
                <div key={chart.id} className="mt-6 space-y-4">
                  <h3 className="mb-1 text-base font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400" style={{ fontFamily: "Arial, sans-serif" }}>
                    Төсвийн зарлага
                  </h3>
                  <div
                    className={
                      expenseCharts.length === 3
                        ? "!grid w-full grid-cols-1 gap-6 sm:grid-cols-3"
                        : "!grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    }
                  >
                    {expenseCharts.map((c) => (
                      <div key={c.id}>{renderExpenseChart(c)}</div>
                    ))}
                  </div>
                </div>
              );
            }

            // Hide individual budget category charts that are rendered in rows
            if (config.id === "state-budget" && ["budget-social-insurance", "budget-vat", "budget-excise-tax", "budget-other-income", "budget-current-expense", "budget-capital-expense", "budget-net-loan"].includes(chart.id)) {
              return null;
            }

            // Foreign Trade combined chart - Export/Import bars + Balance line (Сар tab: monthly; Жил tab: yearly from DT_NSO_1400_001V1_year.px)
            if (config.id === "foreign-trade" && chart.id === "foreign-trade-balance") {
              const exportRows = chartDataByChartId["foreign-trade-export"] ?? [];
              const importRows = chartDataByChartId["foreign-trade-import"] ?? [];
              const yearlyRows = chartDataByChartId["foreign-trade-yearly"] ?? [];

              const extractPeriodTrade = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                const matchMonth3 = period.match(/(\d{4})\s*оны\s*(\d{1,2})/i);
                if (matchMonth3) return `${matchMonth3[1]}-${matchMonth3[2].padStart(2, "0")}`;
                return null;
              };

              // Жил tab: жилийн API-аас (Экспорт=1, Импорт=2, Тэнцэл=3)
              if (tradePeriodTab === "Жил") {
                let allYearsTrade: string[];
                let chartDataTradeYearlyAll: { period: string; export: number; import: number; balance: number }[];

                if (yearlyRows.length > 0) {
                  const indKey = "Гадаад худалдааны үндсэн үзүүлэлт_code";
                  const yearKey = "Он";
                  const exportByYear = new Map<string, number>();
                  const importByYear = new Map<string, number>();
                  const balanceByYear = new Map<string, number>();
                  for (const r of yearlyRows) {
                    const yearStr = String(r[yearKey] ?? r["Он_code"] ?? "").trim();
                    const ind = String(r[indKey] ?? r["Гадаад худалдааны үндсэн үзүүлэлт"] ?? "");
                    const val = Number(r.value) || 0;
                    if (!yearStr) continue;
                    if (ind === "1") exportByYear.set(yearStr, (exportByYear.get(yearStr) ?? 0) + val);
                    else if (ind === "2") importByYear.set(yearStr, (importByYear.get(yearStr) ?? 0) + val);
                    else if (ind === "3") balanceByYear.set(yearStr, (balanceByYear.get(yearStr) ?? 0) + val);
                  }
                  allYearsTrade = [...new Set([...exportByYear.keys(), ...importByYear.keys(), ...balanceByYear.keys()])].sort((a, b) => a.localeCompare(b));
                  const toMillionY = (v: number) => v;
                  chartDataTradeYearlyAll = allYearsTrade.map((y) => ({
                    period: y,
                    export: toMillionY(exportByYear.get(y) ?? 0),
                    import: toMillionY(importByYear.get(y) ?? 0),
                    balance: toMillionY(balanceByYear.get(y) ?? (exportByYear.get(y) ?? 0) - (importByYear.get(y) ?? 0)),
                  }));
                } else {
                  if (exportRows.length === 0 || importRows.length === 0) {
                    return (
                      <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                        Гадаад худалдааны мэдээлэл татагдаж байна...
                      </div>
                    );
                  }
                  const exportByYear = new Map<string, number>();
                  for (const r of exportRows) {
                    const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                    const key = extractPeriodTrade(periodStr);
                    if (key) {
                      const year = key.slice(0, 4);
                      exportByYear.set(year, (exportByYear.get(year) ?? 0) + (Number(r.value) || 0));
                    }
                  }
                  const importByYear = new Map<string, number>();
                  for (const r of importRows) {
                    const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                    const key = extractPeriodTrade(periodStr);
                    if (key) {
                      const year = key.slice(0, 4);
                      importByYear.set(year, (importByYear.get(year) ?? 0) + (Number(r.value) || 0));
                    }
                  }
                  allYearsTrade = [...new Set([...exportByYear.keys(), ...importByYear.keys()])].sort((a, b) => a.localeCompare(b));
                  const toMillionY = (v: number) => v;
                  chartDataTradeYearlyAll = allYearsTrade.map((y) => ({
                    period: y,
                    export: toMillionY(exportByYear.get(y) ?? 0),
                    import: toMillionY(importByYear.get(y) ?? 0),
                    balance: toMillionY((exportByYear.get(y) ?? 0) - (importByYear.get(y) ?? 0)),
                  }));
                }
                if (allYearsTrade.length === 0) {
                  return (
                    <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                      Гадаад худалдааны жилийн мэдээлэл татагдаж байна...
                    </div>
                  );
                }
                const formatMillionY = (v: number) => `${Math.round(v).toLocaleString()} сая $`;
                // RangeSlider: эхлэх он (default 2021) → сүүлийн жил
                const nYearsTrade = allYearsTrade.length;
                const defaultStartIdxTrade = Math.max(0, allYearsTrade.findIndex((y) => y === "2021"));
                const currentRangeTradeYearly = tradeYearlyRange ?? [defaultStartIdxTrade, Math.max(0, nYearsTrade - 1)];
                const [rangeStartTradeYearly, rangeEndTradeYearly] = [
                  Math.min(currentRangeTradeYearly[0], Math.max(0, nYearsTrade - 1)),
                  Math.min(currentRangeTradeYearly[1], Math.max(0, nYearsTrade - 1)),
                ];
                tradeYearlyPlayRef.current = { n: nYearsTrade, defaultStart: defaultStartIdxTrade };
                tradeYearlyYearRangeRef.current = { start: allYearsTrade[rangeStartTradeYearly] ?? "2021", end: allYearsTrade[rangeEndTradeYearly] ?? String(new Date().getFullYear()) };
                const chartDataTradeYearly = chartDataTradeYearlyAll.slice(rangeStartTradeYearly, rangeEndTradeYearly + 1);
                const latestYearly = chartDataTradeYearly[chartDataTradeYearly.length - 1];
                const maxExpY = Math.max(...chartDataTradeYearly.map((d) => d.export), 1);
                const maxImpY = Math.max(...chartDataTradeYearly.map((d) => d.import), 1);
                const maxBalAbsY = Math.max(...chartDataTradeYearly.map((d) => Math.abs(d.balance)), 1);
                const leftMaxY = Math.max(maxExpY, maxImpY) * 1.1;
                const rightMaxY = maxBalAbsY * 1.2;
                const tradeYearlyOption: EChartsOption = {
                  tooltip: {
                    trigger: "axis",
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "#0d9488",
                    borderWidth: 1,
                    padding: [12, 16],
                    extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                    textStyle: { fontFamily: "Arial, sans-serif", fontSize: 12, color: "#f1f5f9" },
                    formatter: (params: unknown) => {
                      const arr = params as { seriesName: string; value: number; axisValueLabel: string }[];
                      if (!arr?.length) return "";
                      const period = arr[0].axisValueLabel;
                      let html = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                        <span style="color:#2dd4bf;font-size:14px;">◉</span>
                        <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                      </div>`;
                      for (const item of arr) {
                        const val = Math.round(Math.abs(item.value ?? 0)).toLocaleString();
                        html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                          <span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span>
                          <span style="color:#f1f5f9;font-weight:600;">${val} сая $</span>
                        </div>`;
                      }
                      return html;
                    },
                  },
                  grid: { left: 50, right: 50, bottom: 30, top: 40 },
                  xAxis: {
                    type: "category",
                    data: chartDataTradeYearly.map((d) => d.period),
                    axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                    axisLine: { lineStyle: { color: "#e2e8f0" } },
                    axisTick: { show: false },
                  },
                  yAxis: [
                    {
                      type: "value",
                      position: "left",
                      min: -leftMaxY,
                      max: leftMaxY,
                      axisLabel: {
                        formatter: (v: number) => Math.round(Math.abs(v)).toLocaleString(),
                        fontFamily: "Arial, sans-serif",
                        fontSize: 10,
                        color: "#64748b",
                      },
                      axisLine: { show: false },
                      axisTick: { show: false },
                      splitLine: { show: true, lineStyle: { color: "#f1f5f9", type: "dashed" } },
                    },
                    {
                      type: "value",
                      position: "right",
                      min: -rightMaxY,
                      max: rightMaxY,
                      axisLabel: {
                        formatter: (v: number) => Math.round(v).toLocaleString(),
                        fontFamily: "Arial, sans-serif",
                        fontSize: 10,
                        color: "#6b7280",
                      },
                      axisLine: { show: false },
                      axisTick: { show: false },
                      splitLine: { show: false },
                    },
                  ],
                  textStyle: { fontFamily: "Arial, sans-serif" },
                  series: [
                    {
                      name: "Экспорт",
                      type: "bar",
                      data: chartDataTradeYearly.map((d) => d.export),
                      itemStyle: { color: "rgba(165, 180, 252, 0.55)", borderColor: "#6366f1", borderWidth: 1 },
                      barGap: "-100%",
                      label: { show: false },
                    },
                    {
                      name: "Импорт",
                      type: "bar",
                      data: chartDataTradeYearly.map((d) => -d.import),
                      itemStyle: { color: "rgba(153, 246, 228, 0.55)", borderColor: "#14b8a6", borderWidth: 1 },
                      label: { show: false },
                    },
                    {
                      name: "Тэнцэл",
                      type: "line",
                      yAxisIndex: 1,
                      data: chartDataTradeYearly.map((d) => d.balance),
                      lineStyle: { color: "#475569", width: 2 },
                      symbol: "none",
                      itemStyle: { color: "#475569" },
                      label: { show: false },
                    },
                  ],
                };
                return (
                  <div key={chart.id} className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: "Arial, sans-serif" }}>
                        Жилийн гүйцэтгэл
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-6" style={{ fontFamily: "Arial, sans-serif" }}>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium" style={{ color: "#6366f1" }}>Экспорт:</span>
                        <span className="text-lg font-semibold" style={{ color: "#6366f1" }}>{formatMillionY(latestYearly?.export ?? 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium" style={{ color: "#14b8a6" }}>Импорт:</span>
                        <span className="text-lg font-semibold" style={{ color: "#14b8a6" }}>{formatMillionY(latestYearly?.import ?? 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Тэнцэл:</span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatMillionY(latestYearly?.balance ?? 0)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-slate-500">({latestYearly?.period ?? ""})</span>
                      </div>
                    </div>
                    <ReactECharts
                      option={tradeYearlyOption}
                      style={{ height: 480, width: "100%" }}
                      notMerge={true}
                      lazyUpdate={true}
                    />
                    {nYearsTrade > 1 && (
                      <div className="mt-3 pt-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3" style={{ fontFamily: "Arial, sans-serif" }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (!tradeYearlyIsPlaying) {
                                const atEnd = rangeEndTradeYearly >= nYearsTrade - 1;
                                if (atEnd) {
                                  setTradeYearlyRange([defaultStartIdxTrade, defaultStartIdxTrade]);
                                }
                              }
                              setTradeYearlyIsPlaying((p) => !p);
                            }}
                            className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                            title={tradeYearlyIsPlaying ? "Зогсоох" : "Тоглуулах"}
                            aria-label={tradeYearlyIsPlaying ? "Зогсоох" : "Тоглуулах"}
                          >
                            {tradeYearlyIsPlaying ? (
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
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                              {allYearsTrade[rangeStartTradeYearly] ?? ""}
                            </span>
                            <div className="min-w-0 flex-1">
                              <RangeSlider
                                min={0}
                                max={nYearsTrade - 1}
                                value={[rangeStartTradeYearly, rangeEndTradeYearly]}
                                onChange={(val) => {
                                  setTradeYearlyIsPlaying(false);
                                  setTradeYearlyRange(val);
                                }}
                                labels={allYearsTrade}
                                showLabels={false}
                              />
                            </div>
                            <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                              {allYearsTrade[rangeEndTradeYearly] ?? ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              const exportByPeriod = new Map<string, number>();
              for (const r of exportRows) {
                const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                const key = extractPeriodTrade(periodStr);
                if (key) exportByPeriod.set(key, Number(r.value) || 0);
              }

              const importByPeriod = new Map<string, number>();
              for (const r of importRows) {
                const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                const key = extractPeriodTrade(periodStr);
                if (key) importByPeriod.set(key, Number(r.value) || 0);
              }

              const allPeriodsTrade = [...new Set([...exportByPeriod.keys(), ...importByPeriod.keys()])]
                .sort((a, b) => a.localeCompare(b));

              const toMillion = (v: number) => v;
              const formatMillion = (v: number) => `${Math.round(v).toLocaleString()} сая $`;

              const allChartDataTrade = allPeriodsTrade.map((p) => ({
                period: p,
                export: toMillion(exportByPeriod.get(p) ?? 0),
                import: toMillion(importByPeriod.get(p) ?? 0),
                balance: toMillion((exportByPeriod.get(p) ?? 0) - (importByPeriod.get(p) ?? 0)),
              }));

              // Apply range filter
              const nTrade = allChartDataTrade.length;
              tradeMonthlyBalanceNRef.current = nTrade;
              const defaultStartTrade = Math.max(0, allChartDataTrade.findIndex((d) => d.period >= "2021-01"));
              const currentRangeTrade = tradeMonthlyRange ?? [defaultStartTrade, nTrade - 1];
              const [rangeStartTrade, rangeEndTrade] = [
                Math.min(currentRangeTrade[0], Math.max(0, nTrade - 1)),
                Math.min(currentRangeTrade[1], Math.max(0, nTrade - 1))
              ];
              const chartDataTrade = allChartDataTrade.slice(rangeStartTrade, rangeEndTrade + 1);

              const latestDataTrade = chartDataTrade[chartDataTrade.length - 1];

              // Calculate axis ranges to align 0 on both axes
              const maxExport = Math.max(...chartDataTrade.map((d) => d.export), 1);
              const maxImport = Math.max(...chartDataTrade.map((d) => d.import), 1);
              const maxBalanceAbs = Math.max(...chartDataTrade.map((d) => Math.abs(d.balance)), 1);

              const leftMaxTrade = Math.max(maxExport, maxImport) * 1.1;
              const leftMinTrade = -leftMaxTrade;
              const rightMaxTrade = maxBalanceAbs * 1.2;
              const rightMinTrade = -rightMaxTrade;

              const tradeChartOption: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { fontFamily: "Arial, sans-serif", fontSize: 12, color: "#f1f5f9" },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string; color: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    let html = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#2dd4bf;font-size:14px;">◉</span>
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                    </div>`;
                    for (const item of arr) {
                      const val = Math.round(Math.abs(item.value ?? 0)).toLocaleString();
                      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span>
                        <span style="color:#f1f5f9;font-weight:600;">${val} сая $</span>
                      </div>`;
                    }
                    return html;
                  },
                },
                grid: { left: 50, right: 50, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartDataTrade.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: [
                  {
                    type: "value",
                    position: "left",
                    min: leftMinTrade,
                    max: leftMaxTrade,
                    axisLabel: {
                      formatter: (v: number) => Math.round(Math.abs(v)).toLocaleString(),
                      fontFamily: "Arial, sans-serif",
                      fontSize: 10,
                      color: "#64748b",
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: true, lineStyle: { color: "#f1f5f9", type: "dashed" } },
                  },
                  {
                    type: "value",
                    position: "right",
                    min: rightMinTrade,
                    max: rightMaxTrade,
                    axisLabel: {
                      formatter: (v: number) => Math.round(v).toLocaleString(),
                      fontFamily: "Arial, sans-serif",
                      fontSize: 10,
                      color: "#6b7280",
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                  },
                ],
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [
                  {
                    name: "Экспорт",
                    type: "bar",
                    data: chartDataTrade.map((d) => d.export),
                    itemStyle: { color: "rgba(165, 180, 252, 0.55)", borderColor: "#6366f1", borderWidth: 1 },
                    barGap: "-100%",
                    label: { show: false },
                  },
                  {
                    name: "Импорт",
                    type: "bar",
                    data: chartDataTrade.map((d) => -d.import),
                    itemStyle: { color: "rgba(153, 246, 228, 0.55)", borderColor: "#14b8a6", borderWidth: 1 },
                    label: { show: false },
                  },
                  {
                    name: "Тэнцэл",
                    type: "line",
                    yAxisIndex: 1,
                    data: chartDataTrade.map((d) => d.balance),
                    lineStyle: { color: "#475569", width: 2 },
                    symbol: "none",
                    itemStyle: { color: "#475569" },
                    label: { show: false },
                  },
                ],
              };

              return (
                <div key={chart.id} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: "Arial, sans-serif" }}>
                      Сарын гүйцэтгэл
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-6" style={{ fontFamily: "Arial, sans-serif" }}>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Экспорт:</span>
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatMillion(latestDataTrade?.export ?? 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Импорт:</span>
                      <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatMillion(latestDataTrade?.import ?? 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Тэнцэл:</span>
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatMillion(latestDataTrade?.balance ?? 0)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-slate-500">({latestDataTrade?.period ?? ""})</span>
                    </div>
                  </div>
                  <ReactECharts
                    option={tradeChartOption}
                    style={{ height: 440, width: "100%" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                  {nTrade > 1 && (
                    <div className="mt-3 pt-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!tradeMonthlyIsPlaying) {
                              const atEnd = rangeEndTrade >= nTrade - 1;
                              if (atEnd) {
                                setTradeMonthlyRange([0, Math.min(Math.floor(nTrade * 0.3), nTrade - 1)]);
                              }
                            }
                            setTradeMonthlyIsPlaying((p) => !p);
                          }}
                          className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                          title={tradeMonthlyIsPlaying ? "Зогсоох" : "Тоглуулах"}
                          aria-label={tradeMonthlyIsPlaying ? "Зогсоох" : "Тоглуулах"}
                        >
                          {tradeMonthlyIsPlaying ? (
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
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {allChartDataTrade[rangeStartTrade]?.period ?? ""}
                          </span>
                          <div className="min-w-0 flex-1">
                            <RangeSlider
                              min={0}
                              max={nTrade - 1}
                              value={[rangeStartTrade, rangeEndTrade]}
                              onChange={(val) => {
                                setTradeMonthlyIsPlaying(false);
                                setTradeMonthlyRange(val);
                              }}
                              labels={allChartDataTrade.map((d) => d.period)}
                              showLabels={false}
                            />
                          </div>
                          <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                            {allChartDataTrade[rangeEndTrade]?.period ?? ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Hide foreign trade source charts (yearly is data source for Жилийн гүйцэтгэл only)
            if (config.id === "foreign-trade" && ["foreign-trade-export", "foreign-trade-import", "foreign-trade-export-cumulative", "foreign-trade-import-cumulative", "foreign-trade-yearly"].includes(chart.id)) {
              return null;
            }

            // Foreign Trade cumulative chart - Export/Import bars + Balance line with month filter (зөвхөн Сар tab)
            if (config.id === "foreign-trade" && chart.id === "foreign-trade-balance-cumulative") {
              if (tradePeriodTab === "Жил") return null;
              const exportRowsCum = chartDataByChartId["foreign-trade-export-cumulative"] ?? [];
              const importRowsCum = chartDataByChartId["foreign-trade-import-cumulative"] ?? [];

              if (exportRowsCum.length === 0 || importRowsCum.length === 0) {
                return (
                  <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                    Гадаад худалдааны мэдээлэл татагдаж байна...
                  </div>
                );
              }

              const extractPeriodTradeCum = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                const matchMonth3 = period.match(/(\d{4})\s*оны\s*(\d{1,2})/i);
                if (matchMonth3) return `${matchMonth3[1]}-${matchMonth3[2].padStart(2, "0")}`;
                const matchMonth4 = period.match(/(\d{1,2})\s*сар.*?(\d{4})/i);
                if (matchMonth4) return `${matchMonth4[2]}-${matchMonth4[1].padStart(2, "0")}`;
                const matchMonth5 = period.match(/^(\d{4})\/(\d{1,2})$/);
                if (matchMonth5) return `${matchMonth5[1]}-${matchMonth5[2].padStart(2, "0")}`;
                return null;
              };

              const exportByPeriodCum = new Map<string, number>();
              for (const r of exportRowsCum) {
                const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                const key = extractPeriodTradeCum(periodStr);
                if (key) exportByPeriodCum.set(key, Number(r.value) || 0);
              }

              const importByPeriodCum = new Map<string, number>();
              for (const r of importRowsCum) {
                const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                const key = extractPeriodTradeCum(periodStr);
                if (key) importByPeriodCum.set(key, Number(r.value) || 0);
              }

              const allPeriodsTradeCum = [...new Set([...exportByPeriodCum.keys(), ...importByPeriodCum.keys()])]
                .sort((a, b) => a.localeCompare(b));

              // Month filter options
              const monthOptionsTrade = [
                { value: "01", label: "1 сар" },
                { value: "02", label: "2 сар" },
                { value: "03", label: "3 сар" },
                { value: "04", label: "4 сар" },
                { value: "05", label: "5 сар" },
                { value: "06", label: "6 сар" },
                { value: "07", label: "7 сар" },
                { value: "08", label: "8 сар" },
                { value: "09", label: "9 сар" },
                { value: "10", label: "10 сар" },
                { value: "11", label: "11 сар" },
                { value: "12", label: "12 сар" },
              ];

              // Filter by selected month
              const monthFilteredPeriodsTrade = allPeriodsTradeCum.filter((p) => p.endsWith(`-${tradeMonthFilter}`));

              const toMillionCum = (v: number) => v;
              const formatMillionCum = (v: number) => `${Math.round(v).toLocaleString()} сая $`;

              const allChartDataTradeCum = monthFilteredPeriodsTrade.map((p) => ({
                period: p,
                export: toMillionCum(exportByPeriodCum.get(p) ?? 0),
                import: toMillionCum(importByPeriodCum.get(p) ?? 0),
                balance: toMillionCum((exportByPeriodCum.get(p) ?? 0) - (importByPeriodCum.get(p) ?? 0)),
              }));

              // Apply range filter
              const nTradeCum = allChartDataTradeCum.length;
              tradeCumulativeNRef.current = nTradeCum;
              const defaultStartTradeCum = Math.max(0, allChartDataTradeCum.findIndex((d) => d.period >= "2021-01"));
              const currentRangeTradeCum = tradeRange ?? [defaultStartTradeCum, nTradeCum - 1];
              const [rangeStartTradeCum, rangeEndTradeCum] = [
                Math.min(currentRangeTradeCum[0], Math.max(0, nTradeCum - 1)),
                Math.min(currentRangeTradeCum[1], Math.max(0, nTradeCum - 1))
              ];
              const chartDataTradeCum = allChartDataTradeCum.slice(rangeStartTradeCum, rangeEndTradeCum + 1);

              const latestDataTradeCum = chartDataTradeCum[chartDataTradeCum.length - 1];

              // Calculate axis ranges
              const maxExportCum = Math.max(...chartDataTradeCum.map((d) => d.export), 1);
              const maxImportCum = Math.max(...chartDataTradeCum.map((d) => d.import), 1);
              const maxBalanceAbsCum = Math.max(...chartDataTradeCum.map((d) => Math.abs(d.balance)), 1);

              const leftMaxTradeCum = Math.max(maxExportCum, maxImportCum) * 1.1;
              const leftMinTradeCum = -leftMaxTradeCum;
              const rightMaxTradeCum = maxBalanceAbsCum * 1.2;
              const rightMinTradeCum = -rightMaxTradeCum;

              const tradeChartOptionCum: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { fontFamily: "Arial, sans-serif", fontSize: 12, color: "#f1f5f9" },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string; color: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    let html = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#2dd4bf;font-size:14px;">◉</span>
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                    </div>`;
                    for (const item of arr) {
                      const val = Math.round(Math.abs(item.value ?? 0)).toLocaleString();
                      html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
                        <span style="color:#94a3b8;font-size:12px;">${item.seriesName}</span>
                        <span style="color:#f1f5f9;font-weight:600;">${val} сая $</span>
                      </div>`;
                    }
                    return html;
                  },
                },
                grid: { left: 50, right: 50, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartDataTradeCum.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: [
                  {
                    type: "value",
                    position: "left",
                    min: leftMinTradeCum,
                    max: leftMaxTradeCum,
                    axisLabel: {
                      formatter: (v: number) => Math.round(Math.abs(v)).toLocaleString(),
                      fontFamily: "Arial, sans-serif",
                      fontSize: 10,
                      color: "#64748b",
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: true, lineStyle: { color: "#f1f5f9", type: "dashed" } },
                  },
                  {
                    type: "value",
                    position: "right",
                    min: rightMinTradeCum,
                    max: rightMaxTradeCum,
                    axisLabel: {
                      formatter: (v: number) => Math.round(v).toLocaleString(),
                      fontFamily: "Arial, sans-serif",
                      fontSize: 10,
                      color: "#6b7280",
                    },
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { show: false },
                  },
                ],
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [
                  {
                    name: "Экспорт",
                    type: "bar",
                    data: chartDataTradeCum.map((d) => d.export),
                    itemStyle: { color: "rgba(165, 180, 252, 0.55)", borderColor: "#6366f1", borderWidth: 1 },
                    barGap: "-100%",
                    label: { show: false },
                  },
                  {
                    name: "Импорт",
                    type: "bar",
                    data: chartDataTradeCum.map((d) => -d.import),
                    itemStyle: { color: "rgba(153, 246, 228, 0.55)", borderColor: "#14b8a6", borderWidth: 1 },
                    label: { show: false },
                  },
                  {
                    name: "Тэнцэл",
                    type: "line",
                    yAxisIndex: 1,
                    data: chartDataTradeCum.map((d) => d.balance),
                    lineStyle: { color: "#475569", width: 2 },
                    symbol: "none",
                    itemStyle: { color: "#475569" },
                    label: { show: false },
                  },
                ],
              };

              return (
                <div key={chart.id} className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Arial, sans-serif", margin: 0 }}>
                      Өссөн дүнгийн гүйцэтгэл
                    </h3>
                    <select
                      value={tradeMonthFilter}
                      onChange={(e) => setTradeMonthFilter(e.target.value)}
                      className="w-full shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 sm:w-auto"
                      style={{ fontFamily: "Arial, sans-serif" }}
                    >
                      {monthOptionsTrade.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-6" style={{ fontFamily: "Arial, sans-serif" }}>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Экспорт:</span>
                      <span className="text-lg font-semibold" style={{ color: "#6366f1" }}>{formatMillionCum(latestDataTradeCum?.export ?? 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Импорт:</span>
                      <span className="text-lg font-semibold" style={{ color: "#14b8a6" }}>{formatMillionCum(latestDataTradeCum?.import ?? 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Тэнцэл:</span>
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatMillionCum(latestDataTradeCum?.balance ?? 0)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-slate-500">({latestDataTradeCum?.period ?? ""})</span>
                    </div>
                  </div>
                  <ReactECharts
                    option={tradeChartOptionCum}
                    style={{ height: 440, width: "100%" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                  {nTradeCum > 1 && (
                    <div className="mt-3 pt-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!tradeIsPlaying) {
                              const atEnd = rangeEndTradeCum >= nTradeCum - 1;
                              if (atEnd) {
                                setTradeRange([0, Math.min(Math.floor(nTradeCum * 0.3), nTradeCum - 1)]);
                              }
                            }
                            setTradeIsPlaying((p) => !p);
                          }}
                          className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                          title={tradeIsPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                          aria-label={tradeIsPlaying ? "Зогсоох" : "Тоглуулах"}
                        >
                          {tradeIsPlaying ? (
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
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {allChartDataTradeCum[rangeStartTradeCum]?.period ?? ""}
                          </span>
                          <div className="min-w-0 flex-1">
                            <RangeSlider
                              min={0}
                              max={nTradeCum - 1}
                              value={[rangeStartTradeCum, rangeEndTradeCum]}
                              onChange={(val) => {
                                setTradeIsPlaying(false);
                                setTradeRange(val);
                              }}
                              labels={allChartDataTradeCum.map((d) => d.period)}
                              showLabels={false}
                            />
                          </div>
                          <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                            {allChartDataTradeCum[rangeEndTradeCum]?.period ?? ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Foreign Trade - Export Products Chart (зөвхөн Сар tab)
            if (config.id === "foreign-trade" && chart.id === "foreign-trade-export-products") {
              if (tradePeriodTab === "Жил") return null;
              const productRows = chartDataByChartId["foreign-trade-export-products"] ?? [];

              if (productRows.length === 0) {
                return (
                  <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                    Экспортын барааны мэдээлэл татагдаж байна...
                  </div>
                );
              }

              // Extract unique indicators and products
              const indicatorOptions = [...new Set(productRows.map((r) => String(r["Статистик үзүүлэлт"] ?? r["Статистик үзүүлэлт_code"] ?? "")))].filter(Boolean);
              const productOptions = [...new Set(productRows.map((r) => String(r["Гол нэр төрлийн бараа"] ?? r["Гол нэр төрлийн бараа_code"] ?? "")))].filter(Boolean);

              // Filter rows by selected indicator and product
              const filteredProductRows = productRows.filter((r) => {
                const indicator = String(r["Статистик үзүүлэлт"] ?? r["Статистик үзүүлэлт_code"] ?? "");
                const product = String(r["Гол нэр төрлийн бараа"] ?? r["Гол нэр төрлийн бараа_code"] ?? "");
                const selectedIndicatorLabel = indicatorOptions[Number(tradeProductIndicator)] ?? indicatorOptions[0] ?? "";
                const selectedProductLabel = productOptions[Number(tradeProductFilter)] ?? productOptions[0] ?? "";
                return indicator === selectedIndicatorLabel && product === selectedProductLabel;
              });

              // Extract period
              const extractPeriodProduct = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                const matchMonth3 = period.match(/(\d{4})\s*оны\s*(\d{1,2})/i);
                if (matchMonth3) return `${matchMonth3[1]}-${matchMonth3[2].padStart(2, "0")}`;
                const matchMonth4 = period.match(/(\d{1,2})\s*сар.*?(\d{4})/i);
                if (matchMonth4) return `${matchMonth4[2]}-${matchMonth4[1].padStart(2, "0")}`;
                const matchMonth5 = period.match(/^(\d{4})\/(\d{1,2})$/);
                if (matchMonth5) return `${matchMonth5[1]}-${matchMonth5[2].padStart(2, "0")}`;
                return null;
              };

              const dataByPeriodProduct = new Map<string, number>();
              for (const r of filteredProductRows) {
                const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                const key = extractPeriodProduct(periodStr);
                if (key) dataByPeriodProduct.set(key, Number(r.value) || 0);
              }

              const allPeriodsProduct = [...dataByPeriodProduct.keys()].sort((a, b) => a.localeCompare(b));
              const allChartDataProduct = allPeriodsProduct.map((p) => ({
                period: p,
                value: dataByPeriodProduct.get(p) ?? 0,
              }));

              const selectedIndicatorLabel = indicatorOptions[Number(tradeProductIndicator)] ?? indicatorOptions[0] ?? "";
              const selectedProductLabel = productOptions[Number(tradeProductFilter)] ?? productOptions[0] ?? "";

              // Determine unit based on indicator
              const isQuantity = selectedIndicatorLabel.includes("тоо") || selectedIndicatorLabel.includes("Тоо");
              const unitLabel = isQuantity ? "" : "мян.ам.долл";
              const shouldDivideBy1m =
                !isQuantity &&
                ["Нүүрс (мян.тн)", "Зэсийн хүдэр, баяжмал (мян.тн)"].includes(String(selectedProductLabel).trim());
              const displayUnitLabel = shouldDivideBy1m ? "тэрбум ам.долл" : unitLabel;

              // Month filter options for export products
              const monthOptionsProduct = [
                { value: "01", label: "1 сар" },
                { value: "02", label: "2 сар" },
                { value: "03", label: "3 сар" },
                { value: "04", label: "4 сар" },
                { value: "05", label: "5 сар" },
                { value: "06", label: "6 сар" },
                { value: "07", label: "7 сар" },
                { value: "08", label: "8 сар" },
                { value: "09", label: "9 сар" },
                { value: "10", label: "10 сар" },
                { value: "11", label: "11 сар" },
                { value: "12", label: "12 сар" },
              ];

              // Filter by selected month (shared with cumulative chart)
              const monthFilteredPeriodsProduct = allPeriodsProduct.filter((p) => p.endsWith(`-${tradeMonthFilter}`));
              const monthFilteredChartDataProduct = monthFilteredPeriodsProduct.map((p) => ({
                period: p,
                value: dataByPeriodProduct.get(p) ?? 0,
              }));

              // Apply range filter on month-filtered data
              const nProductFiltered = monthFilteredChartDataProduct.length;
              const defaultStartProductFiltered = Math.max(0, monthFilteredChartDataProduct.findIndex((d) => d.period >= "2021-01"));
              const currentRangeProductFiltered = tradeRange ?? [defaultStartProductFiltered, nProductFiltered - 1];
              const [rangeStartProductFiltered, rangeEndProductFiltered] = [
                Math.min(currentRangeProductFiltered[0], Math.max(0, nProductFiltered - 1)),
                Math.min(currentRangeProductFiltered[1], Math.max(0, nProductFiltered - 1))
              ];
              const chartDataProductFiltered = monthFilteredChartDataProduct.slice(rangeStartProductFiltered, rangeEndProductFiltered + 1);

              const latestDataProductFiltered = chartDataProductFiltered[chartDataProductFiltered.length - 1];

              const productChartOption: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { fontFamily: "Arial, sans-serif", fontSize: 12, color: "#f1f5f9" },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    const val = Math.round(arr[0].value ?? 0).toLocaleString();
                    return `<div style="padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
                      <span style="color:#94a3b8;font-size:12px;">${selectedProductLabel}</span>
                      <span style="color:#f1f5f9;font-weight:600;">${val} ${unitLabel}</span>
                    </div>`;
                  },
                },
                grid: { left: 70, right: 30, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartDataProductFiltered.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: {
                  type: "value",
                  axisLabel: {
                    formatter: (v: number) => Math.round(v).toLocaleString(),
                    fontFamily: "Arial, sans-serif",
                    fontSize: 10,
                    color: "#64748b",
                  },
                  axisLine: { show: false },
                  axisTick: { show: false },
                  splitLine: { show: true, lineStyle: { color: "#e5e7eb", type: "dashed" } },
                },
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [
                  {
                    name: selectedProductLabel,
                    type: "line",
                    data: chartDataProductFiltered.map((d) => d.value),
                    lineStyle: { color: "#0050C3", width: 2 },
                    symbol: "none",
                    smooth: true,
                    itemStyle: { color: "#0050C3" },
                    areaStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: "rgba(0, 80, 195, 0.32)" },
                          { offset: 1, color: "rgba(0, 80, 195, 0.04)" },
                        ],
                      },
                    },
                  },
                ],
              };

              return (
                <div key={chart.id} className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" style={{ fontFamily: "Arial, sans-serif" }}>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400 lg:max-w-[min(100%,28rem)]" style={{ margin: 0 }}>
                      Экспортын зарим гол нэрийн бараа
                    </h3>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                      <div className="filter-btn-group flex shrink-0 flex-wrap rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
                        {indicatorOptions.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={tradeProductIndicator === String(idx) ? "active" : ""}
                            onClick={() => setTradeProductIndicator(String(idx))}
                          >
                            {idx === 0 ? "Тоо хэмжээ" : "Үнийн дүн (мян.ам.долл)"}
                          </button>
                        ))}
                      </div>
                      <select
                        value={tradeProductFilter}
                        onChange={(e) => setTradeProductFilter(e.target.value)}
                        className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 sm:min-w-[12rem]"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {productOptions.map((opt, idx) => (
                          <option key={idx} value={String(idx)}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2" style={{ fontFamily: "Arial, sans-serif" }}>
                    <span className="text-sm font-medium text-sky-600 dark:text-sky-400">{selectedProductLabel}:</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {(shouldDivideBy1m ? (Number(latestDataProductFiltered?.value ?? 0) / 1_000_000) : Math.round(Number(latestDataProductFiltered?.value ?? 0)))
                        .toLocaleString(undefined, { maximumFractionDigits: shouldDivideBy1m ? 1 : 0 })}{" "}
                      <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{displayUnitLabel}</span>
                    </span>
                    <span className="text-sm text-slate-500">({latestDataProductFiltered?.period ?? ""})</span>
                  </div>
                  <ReactECharts
                    option={productChartOption}
                    style={{ height: 400, width: "100%" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                </div>
              );
            }

            // Foreign Trade - Import Products Chart (зөвхөн Сар tab)
            if (config.id === "foreign-trade" && chart.id === "foreign-trade-import-products") {
              if (tradePeriodTab === "Жил") return null;
              const importProductRows = chartDataByChartId["foreign-trade-import-products"] ?? [];

              if (importProductRows.length === 0) {
                return (
                  <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                    Импортын барааны мэдээлэл татагдаж байна...
                  </div>
                );
              }

              // Extract unique indicators and products
              const importIndicatorOptions = [...new Set(importProductRows.map((r) => String(r["Статистик үзүүлэлт"] ?? r["Статистик үзүүлэлт_code"] ?? "")))].filter(Boolean);
              const importProductOptions = [...new Set(importProductRows.map((r) => String(r["Гол нэр төрлийн бараа"] ?? r["Гол нэр төрлийн бараа_code"] ?? "")))].filter(Boolean);

              // Filter rows by selected indicator and product
              const filteredImportProductRows = importProductRows.filter((r) => {
                const indicator = String(r["Статистик үзүүлэлт"] ?? r["Статистик үзүүлэлт_code"] ?? "");
                const product = String(r["Гол нэр төрлийн бараа"] ?? r["Гол нэр төрлийн бараа_code"] ?? "");
                const selectedIndicatorLabel = importIndicatorOptions[Number(tradeImportProductIndicator)] ?? importIndicatorOptions[0] ?? "";
                const selectedProductLabel = importProductOptions[Number(tradeImportProductFilter)] ?? importProductOptions[0] ?? "";
                return indicator === selectedIndicatorLabel && product === selectedProductLabel;
              });

              // Extract period
              const extractPeriodImportProduct = (period: string): string | null => {
                const matchMonth1 = period.match(/(\d{4}).*?(\d{1,2})\s*сар/i);
                if (matchMonth1) return `${matchMonth1[1]}-${matchMonth1[2].padStart(2, "0")}`;
                const matchMonth2 = period.match(/(\d{4})-(\d{1,2})/);
                if (matchMonth2) return `${matchMonth2[1]}-${matchMonth2[2].padStart(2, "0")}`;
                const matchMonth3 = period.match(/(\d{4})\s*оны\s*(\d{1,2})/i);
                if (matchMonth3) return `${matchMonth3[1]}-${matchMonth3[2].padStart(2, "0")}`;
                const matchMonth4 = period.match(/(\d{1,2})\s*сар.*?(\d{4})/i);
                if (matchMonth4) return `${matchMonth4[2]}-${matchMonth4[1].padStart(2, "0")}`;
                const matchMonth5 = period.match(/^(\d{4})\/(\d{1,2})$/);
                if (matchMonth5) return `${matchMonth5[1]}-${matchMonth5[2].padStart(2, "0")}`;
                return null;
              };

              const dataByPeriodImportProduct = new Map<string, number>();
              for (const r of filteredImportProductRows) {
                const periodStr = String(r["Сар"] ?? r["Сар_code"] ?? "");
                const key = extractPeriodImportProduct(periodStr);
                if (key) dataByPeriodImportProduct.set(key, Number(r.value) || 0);
              }

              const allPeriodsImportProduct = [...dataByPeriodImportProduct.keys()].sort((a, b) => a.localeCompare(b));
              const allChartDataImportProduct = allPeriodsImportProduct.map((p) => ({
                period: p,
                value: dataByPeriodImportProduct.get(p) ?? 0,
              }));

              const selectedImportIndicatorLabel = importIndicatorOptions[Number(tradeImportProductIndicator)] ?? importIndicatorOptions[0] ?? "";
              const selectedImportProductLabel = importProductOptions[Number(tradeImportProductFilter)] ?? importProductOptions[0] ?? "";

              // Determine unit based on indicator
              const isImportQuantity = selectedImportIndicatorLabel.includes("тоо") || selectedImportIndicatorLabel.includes("Тоо");
              const importUnitLabel = isImportQuantity ? "" : "мян.ам.долл";

              // Month filter options for import products
              const monthOptionsImportProduct = [
                { value: "01", label: "1 сар" },
                { value: "02", label: "2 сар" },
                { value: "03", label: "3 сар" },
                { value: "04", label: "4 сар" },
                { value: "05", label: "5 сар" },
                { value: "06", label: "6 сар" },
                { value: "07", label: "7 сар" },
                { value: "08", label: "8 сар" },
                { value: "09", label: "9 сар" },
                { value: "10", label: "10 сар" },
                { value: "11", label: "11 сар" },
                { value: "12", label: "12 сар" },
              ];

              // Filter by selected month (shared with cumulative chart)
              const monthFilteredPeriodsImportProduct = allPeriodsImportProduct.filter((p) => p.endsWith(`-${tradeMonthFilter}`));
              const monthFilteredChartDataImportProduct = monthFilteredPeriodsImportProduct.map((p) => ({
                period: p,
                value: dataByPeriodImportProduct.get(p) ?? 0,
              }));

              // Apply range filter on month-filtered data
              const nImportProductFiltered = monthFilteredChartDataImportProduct.length;
              const defaultStartImportProductFiltered = Math.max(0, monthFilteredChartDataImportProduct.findIndex((d) => d.period >= "2021-01"));
              const currentRangeImportProductFiltered = tradeRange ?? [defaultStartImportProductFiltered, nImportProductFiltered - 1];
              const [rangeStartImportProductFiltered, rangeEndImportProductFiltered] = [
                Math.min(currentRangeImportProductFiltered[0], Math.max(0, nImportProductFiltered - 1)),
                Math.min(currentRangeImportProductFiltered[1], Math.max(0, nImportProductFiltered - 1))
              ];
              const chartDataImportProductFiltered = monthFilteredChartDataImportProduct.slice(rangeStartImportProductFiltered, rangeEndImportProductFiltered + 1);

              const latestDataImportProductFiltered = chartDataImportProductFiltered[chartDataImportProductFiltered.length - 1];

              const importProductChartOption: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { fontFamily: "Arial, sans-serif", fontSize: 12, color: "#f1f5f9" },
                  formatter: (params: unknown) => {
                    const arr = params as { seriesName: string; value: number; axisValueLabel: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    const val = Math.round(arr[0].value ?? 0).toLocaleString();
                    return `<div style="padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
                      <span style="color:#94a3b8;font-size:12px;">${selectedImportProductLabel}</span>
                      <span style="color:#f1f5f9;font-weight:600;">${val} ${importUnitLabel}</span>
                    </div>`;
                  },
                },
                grid: { left: 70, right: 30, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartDataImportProductFiltered.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: {
                  type: "value",
                  axisLabel: {
                    formatter: (v: number) => Math.round(v).toLocaleString(),
                    fontFamily: "Arial, sans-serif",
                    fontSize: 10,
                    color: "#64748b",
                  },
                  axisLine: { show: false },
                  axisTick: { show: false },
                  splitLine: { show: true, lineStyle: { color: "#e5e7eb", type: "dashed" } },
                },
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [
                  {
                    name: selectedImportProductLabel,
                    type: "line",
                    data: chartDataImportProductFiltered.map((d) => d.value),
                    lineStyle: { color: "#14b8a6", width: 2 },
                    symbol: "none",
                    smooth: true,
                    itemStyle: { color: "#14b8a6" },
                    areaStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: "rgba(20, 184, 166, 0.35)" },
                          { offset: 1, color: "rgba(20, 184, 166, 0.05)" },
                        ],
                      },
                    },
                  },
                ],
              };

              return (
                <div key={chart.id} className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" style={{ fontFamily: "Arial, sans-serif" }}>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100 lg:max-w-[min(100%,28rem)]" style={{ margin: 0 }}>
                      Импортын зарим гол нэрийн бараа
                    </h3>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                      <div className="filter-btn-group flex shrink-0 flex-wrap rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
                        {importIndicatorOptions.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={tradeImportProductIndicator === String(idx) ? "active" : ""}
                            onClick={() => setTradeImportProductIndicator(String(idx))}
                          >
                            {idx === 0 ? "Тоо хэмжээ" : "Үнийн дүн (мян.ам.долл)"}
                          </button>
                        ))}
                      </div>
                      <select
                        value={tradeImportProductFilter}
                        onChange={(e) => setTradeImportProductFilter(e.target.value)}
                        className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 sm:min-w-[12rem]"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {importProductOptions.map((opt, idx) => (
                          <option key={idx} value={String(idx)}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2" style={{ fontFamily: "Arial, sans-serif" }}>
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">{selectedImportProductLabel}:</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {Math.round(latestDataImportProductFiltered?.value ?? 0).toLocaleString()}{" "}
                      <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{importUnitLabel}</span>
                    </span>
                    <span className="text-sm text-slate-500">({latestDataImportProductFiltered?.period ?? ""})</span>
                  </div>
                  <ReactECharts
                    option={importProductChartOption}
                    style={{ height: 400, width: "100%" }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                </div>
              );
            }

            // Foreign Trade - Export Products Yearly (зөвхөн Жил tab)
            if (config.id === "foreign-trade" && chart.id === "foreign-trade-export-products-yearly") {
              if (tradePeriodTab !== "Жил") return null;
              const productRowsY = chartDataByChartId["foreign-trade-export-products-yearly"] ?? [];
              if (productRowsY.length === 0) {
                return (
                  <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                    Экспортын барааны мэдээлэл татагдаж байна...
                  </div>
                );
              }
              const indicatorOptionsY = [...new Set(productRowsY.map((r) => String(r["Статистик үзүүлэлт"] ?? r["Статистик үзүүлэлт_code"] ?? "")))].filter(Boolean);
              const productOptionsY = [...new Set(productRowsY.map((r) => String(r["Гол нэр төрлийн бараа"] ?? r["Гол нэр төрлийн бараа_code"] ?? "")))].filter(Boolean);
              const filteredProductRowsY = productRowsY.filter((r) => {
                const indicator = String(r["Статистик үзүүлэлт"] ?? r["Статистик үзүүлэлт_code"] ?? "");
                const product = String(r["Гол нэр төрлийн бараа"] ?? r["Гол нэр төрлийн бараа_code"] ?? "");
                const selInd = indicatorOptionsY[Number(tradeProductIndicator)] ?? indicatorOptionsY[0] ?? "";
                const selProd = productOptionsY[Number(tradeProductFilter)] ?? productOptionsY[0] ?? "";
                return indicator === selInd && product === selProd;
              });
              const dataByYearExport = new Map<string, number>();
              for (const r of filteredProductRowsY) {
                const yearStr = String(r["Он"] ?? r["Он_code"] ?? "").trim();
                if (yearStr) dataByYearExport.set(yearStr, Number(r.value) || 0);
              }
              const allYearsExport = [...dataByYearExport.keys()].sort((a, b) => a.localeCompare(b));
              const chartDataExportY = allYearsExport.map((y) => ({ period: y, value: dataByYearExport.get(y) ?? 0 }));
              const { start: yearStart, end: yearEnd } = tradeYearlyYearRangeRef.current;
              const chartDataExportYFiltered = chartDataExportY.filter((d) => d.period >= yearStart && d.period <= yearEnd);
              const selectedIndicatorLabelY = indicatorOptionsY[Number(tradeProductIndicator)] ?? indicatorOptionsY[0] ?? "";
              const selectedProductLabelY = productOptionsY[Number(tradeProductFilter)] ?? productOptionsY[0] ?? "";
              const isQuantityY = selectedIndicatorLabelY.includes("тоо") || selectedIndicatorLabelY.includes("Тоо");
              const unitLabelY = isQuantityY ? "" : "мян.ам.долл";
              const shouldDivideBy1mY =
                !isQuantityY &&
                ["Нүүрс (мян.тн)", "Зэсийн хүдэр, баяжмал (мян.тн)"].includes(String(selectedProductLabelY).trim());
              const displayUnitLabelY = shouldDivideBy1mY ? "тэрбум ам.долл" : unitLabelY;
              const latestExportY = chartDataExportYFiltered[chartDataExportYFiltered.length - 1];
              const exportYearlyOption: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { fontFamily: "Arial, sans-serif", fontSize: 12, color: "#f1f5f9" },
                  formatter: (params: unknown) => {
                    const arr = params as { value: number; axisValueLabel: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    const val = Math.round(arr[0].value ?? 0).toLocaleString();
                    return `<div style="padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
                      <span style="color:#94a3b8;font-size:12px;">${selectedProductLabelY}</span>
                      <span style="color:#f1f5f9;font-weight:600;">${val} ${unitLabelY}</span>
                    </div>`;
                  },
                },
                grid: { left: 70, right: 30, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartDataExportYFiltered.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: {
                  type: "value",
                  axisLabel: {
                    formatter: (v: number) => Math.round(v).toLocaleString(),
                    fontFamily: "Arial, sans-serif",
                    fontSize: 10,
                    color: "#64748b",
                  },
                  axisLine: { show: false },
                  axisTick: { show: false },
                  splitLine: { show: true, lineStyle: { color: "#e5e7eb", type: "dashed" } },
                },
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [{
                  name: selectedProductLabelY,
                  type: "line",
                  data: chartDataExportYFiltered.map((d) => d.value),
                  lineStyle: { color: "#0050C3", width: 2 },
                  symbol: "none",
                  smooth: true,
                  itemStyle: { color: "#0050C3" },
                  areaStyle: {
                    color: {
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: "rgba(0, 80, 195, 0.32)" },
                        { offset: 1, color: "rgba(0, 80, 195, 0.04)" },
                      ],
                    },
                  },
                }],
              };
              return (
                <div key={chart.id} className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" style={{ fontFamily: "Arial, sans-serif" }}>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400 lg:max-w-[min(100%,28rem)]" style={{ margin: 0 }}>
                      Экспортын зарим гол нэрийн бараа
                    </h3>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                      <div className="filter-btn-group flex shrink-0 flex-wrap rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
                        {indicatorOptionsY.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={tradeProductIndicator === String(idx) ? "active" : ""}
                            onClick={() => setTradeProductIndicator(String(idx))}
                          >
                            {idx === 0 ? "Тоо хэмжээ" : "Үнийн дүн (мян.ам.долл)"}
                          </button>
                        ))}
                      </div>
                      <select
                        value={tradeProductFilter}
                        onChange={(e) => setTradeProductFilter(e.target.value)}
                        className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 sm:min-w-[12rem]"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {productOptionsY.map((opt, idx) => (
                          <option key={idx} value={String(idx)}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2" style={{ fontFamily: "Arial, sans-serif" }}>
                    <span className="text-sm font-medium text-sky-600 dark:text-sky-400">{selectedProductLabelY}:</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {(shouldDivideBy1mY ? (Number(latestExportY?.value ?? 0) / 1_000_000) : Math.round(Number(latestExportY?.value ?? 0)))
                        .toLocaleString(undefined, { maximumFractionDigits: shouldDivideBy1mY ? 1 : 0 })}{" "}
                      <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{displayUnitLabelY}</span>
                    </span>
                    <span className="text-sm text-slate-500">({latestExportY?.period ?? ""})</span>
                  </div>
                  <ReactECharts option={exportYearlyOption} style={{ height: 400, width: "100%" }} notMerge={true} lazyUpdate={true} />
                </div>
              );
            }

            // Foreign Trade - Import Products Yearly (зөвхөн Жил tab)
            if (config.id === "foreign-trade" && chart.id === "foreign-trade-import-products-yearly") {
              if (tradePeriodTab !== "Жил") return null;
              const importProductRowsY = chartDataByChartId["foreign-trade-import-products-yearly"] ?? [];
              if (importProductRowsY.length === 0) {
                return (
                  <div key={chart.id} className="text-center py-8 text-[var(--muted-foreground)]">
                    Импортын барааны мэдээлэл татагдаж байна...
                  </div>
                );
              }
              const importIndicatorOptionsY = [...new Set(importProductRowsY.map((r) => String(r["Статистик үзүүлэлт"] ?? r["Статистик үзүүлэлт_code"] ?? "")))].filter(Boolean);
              const importProductOptionsY = [...new Set(importProductRowsY.map((r) => String(r["Гол нэр төрлийн бараа"] ?? r["Гол нэр төрлийн бараа_code"] ?? "")))].filter(Boolean);
              const filteredImportProductRowsY = importProductRowsY.filter((r) => {
                const indicator = String(r["Статистик үзүүлэлт"] ?? r["Статистик үзүүлэлт_code"] ?? "");
                const product = String(r["Гол нэр төрлийн бараа"] ?? r["Гол нэр төрлийн бараа_code"] ?? "");
                const selInd = importIndicatorOptionsY[Number(tradeImportProductIndicator)] ?? importIndicatorOptionsY[0] ?? "";
                const selProd = importProductOptionsY[Number(tradeImportProductFilter)] ?? importProductOptionsY[0] ?? "";
                return indicator === selInd && product === selProd;
              });
              const dataByYearImport = new Map<string, number>();
              for (const r of filteredImportProductRowsY) {
                const yearStr = String(r["Он"] ?? r["Он_code"] ?? "").trim();
                if (yearStr) dataByYearImport.set(yearStr, Number(r.value) || 0);
              }
              const allYearsImport = [...dataByYearImport.keys()].sort((a, b) => a.localeCompare(b));
              const chartDataImportY = allYearsImport.map((y) => ({ period: y, value: dataByYearImport.get(y) ?? 0 }));
              const { start: yearStartImport, end: yearEndImport } = tradeYearlyYearRangeRef.current;
              const chartDataImportYFiltered = chartDataImportY.filter((d) => d.period >= yearStartImport && d.period <= yearEndImport);
              const selectedImportIndicatorLabelY = importIndicatorOptionsY[Number(tradeImportProductIndicator)] ?? importIndicatorOptionsY[0] ?? "";
              const selectedImportProductLabelY = importProductOptionsY[Number(tradeImportProductFilter)] ?? importProductOptionsY[0] ?? "";
              const isImportQuantityY = selectedImportIndicatorLabelY.includes("тоо") || selectedImportIndicatorLabelY.includes("Тоо");
              const importUnitLabelY = isImportQuantityY ? "" : "мян.ам.долл";
              const latestImportY = chartDataImportYFiltered[chartDataImportYFiltered.length - 1];
              const importYearlyOption: EChartsOption = {
                tooltip: {
                  trigger: "axis",
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  borderColor: "#0d9488",
                  borderWidth: 1,
                  padding: [12, 16],
                  extraCssText: "min-width: 180px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
                  textStyle: { fontFamily: "Arial, sans-serif", fontSize: 12, color: "#f1f5f9" },
                  formatter: (params: unknown) => {
                    const arr = params as { value: number; axisValueLabel: string }[];
                    if (!arr?.length) return "";
                    const period = arr[0].axisValueLabel;
                    const val = Math.round(arr[0].value ?? 0).toLocaleString();
                    return `<div style="padding-bottom:8px;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.15);">
                      <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${period}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
                      <span style="color:#94a3b8;font-size:12px;">${selectedImportProductLabelY}</span>
                      <span style="color:#f1f5f9;font-weight:600;">${val} ${importUnitLabelY}</span>
                    </div>`;
                  },
                },
                grid: { left: 70, right: 30, bottom: 30, top: 40 },
                xAxis: {
                  type: "category",
                  data: chartDataImportYFiltered.map((d) => d.period),
                  axisLabel: { fontFamily: "Arial, sans-serif", fontSize: 10, color: "#64748b" },
                  axisLine: { lineStyle: { color: "#e2e8f0" } },
                  axisTick: { show: false },
                },
                yAxis: {
                  type: "value",
                  axisLabel: {
                    formatter: (v: number) => Math.round(v).toLocaleString(),
                    fontFamily: "Arial, sans-serif",
                    fontSize: 10,
                    color: "#64748b",
                  },
                  axisLine: { show: false },
                  axisTick: { show: false },
                  splitLine: { show: true, lineStyle: { color: "#e5e7eb", type: "dashed" } },
                },
                textStyle: { fontFamily: "Arial, sans-serif" },
                series: [{
                  name: selectedImportProductLabelY,
                  type: "line",
                  data: chartDataImportYFiltered.map((d) => d.value),
                  lineStyle: { color: "#14b8a6", width: 2 },
                  symbol: "none",
                  smooth: true,
                  itemStyle: { color: "#14b8a6" },
                  areaStyle: {
                    color: {
                      type: "linear",
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: "rgba(20, 184, 166, 0.35)" },
                        { offset: 1, color: "rgba(20, 184, 166, 0.05)" },
                      ],
                    },
                  },
                }],
              };
              return (
                <div key={chart.id} className="space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" style={{ fontFamily: "Arial, sans-serif" }}>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-slate-100 lg:max-w-[min(100%,28rem)]" style={{ margin: 0 }}>
                      Импортын зарим гол нэрийн бараа
                    </h3>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                      <div className="filter-btn-group flex shrink-0 flex-wrap rounded-full bg-slate-100 p-0.5 dark:bg-slate-800">
                        {importIndicatorOptionsY.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={tradeImportProductIndicator === String(idx) ? "active" : ""}
                            onClick={() => setTradeImportProductIndicator(String(idx))}
                          >
                            {idx === 0 ? "Тоо хэмжээ" : "Үнийн дүн (мян.ам.долл)"}
                          </button>
                        ))}
                      </div>
                      <select
                        value={tradeImportProductFilter}
                        onChange={(e) => setTradeImportProductFilter(e.target.value)}
                        className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 sm:min-w-[12rem]"
                        style={{ fontFamily: "Arial, sans-serif" }}
                      >
                        {importProductOptionsY.map((opt, idx) => (
                          <option key={idx} value={String(idx)}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-2" style={{ fontFamily: "Arial, sans-serif" }}>
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">{selectedImportProductLabelY}:</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {Math.round(latestImportY?.value ?? 0).toLocaleString()}{" "}
                      <span className="text-sm font-normal text-slate-600 dark:text-slate-400">{importUnitLabelY}</span>
                    </span>
                    <span className="text-sm text-slate-500">({latestImportY?.period ?? ""})</span>
                  </div>
                  <ReactECharts option={importYearlyOption} style={{ height: 400, width: "100%" }} notMerge={true} lazyUpdate={true} />
                </div>
              );
            }

            if (config.id === "cpi" && chart.id === "cpi-trend" && metaForChart) {
              const bulagVar = metaForChart.variables.find((v) => v.code === "Бүлэг");
              if (!bulagVar?.values?.length) {
                return (
                  <div key={chart.id}>
                    {renderTrendChart(chart, trendData, metaForChart)}
                  </div>
                );
              }
              // CPI (Аймаг/Нийслэл): trend өгөгдлийг сонгосон бүс/дүүргээр шүүнэ.
              // Нийслэл API (012V1/003V4) нь "Дүүрэг" ашиглаж "Бүс" байхгүй — regionVar байхгүй бол бүх мөр ашиглана.
              const busVar = metaForChart.variables.find((v) => v.code === "Бүс");
              const duuregVar = metaForChart.variables.find((v) => v.code === "Дүүрэг");
              const regionVar = busVar ?? duuregVar;
              let trendRowsScoped = rowsForChart;
              if (selectedLevel && selectedLevel !== "улс" && selectedBusCodes.length > 0 && regionVar) {
                const filtered = rowsForChart.filter((r) =>
                  selectedBusCodes.some((code) => {
                    const dim = regionVar.code;
                    const idx = regionVar.values?.indexOf(code);
                    const label = idx != null && idx >= 0 ? regionVar.valueTexts?.[idx] : undefined;
                    const codeVal = r[`${dim}_code`] ?? r[dim];
                    const labelVal = r[dim];
                    if (codeVal === code || String(codeVal) === String(code)) return true;
                    if (labelVal === code || String(labelVal) === String(code)) return true;
                    if (label != null && (labelVal === label || String(labelVal) === String(label))) return true;
                    return false;
                  })
                );
                // Нийслэл: шүүлт хоосон бол (Дүүрэг кодын систем өөр) бүх мөр харуулна.
                trendRowsScoped = filtered.length > 0 ? filtered : rowsForChart;
              }
              const eronhiiCode = bulagVar.values[0];
              const eronhiiLabel = bulagVar.valueTexts?.[0] ?? String(eronhiiCode);
              const eronhiiRows = trendRowsScoped.filter(
                (r) => String(r["Бүлэг_code"] ?? r["Бүлэг"] ?? "") === String(eronhiiCode)
              );
              const otherGroups = bulagVar.values.slice(1).map((code, idx) => ({
                code,
                label: bulagVar.valueTexts?.[idx + 1] ?? String(code),
                rows: trendRowsScoped.filter(
                  (r) => String(r["Бүлэг_code"] ?? r["Бүлэг"] ?? "") === String(code)
                ),
              })).filter((g) => g.rows.length > 0);
              const hasAnyTrendData = eronhiiRows.length > 0 || otherGroups.length > 0;
              const cpiTrendFirstRow = otherGroups.slice(0, 3);
              const cpiTrendTail = otherGroups.slice(3);
              const cpiTrendTailChunks: typeof otherGroups[] = [];
              for (let i = 0; i < cpiTrendTail.length; i += 3) cpiTrendTailChunks.push(cpiTrendTail.slice(i, i + 3));
              return (
                <div key={chart.id} className="space-y-6">
                  {hasAnyTrendData ? (
                    <>
                      {eronhiiRows.length > 0 && (
                        <div className="w-full min-w-0 [&_h3.chart-section-title]:uppercase">
                          {renderTrendChart(
                            { ...chart, title: eronhiiLabel, description: undefined, chartHeight: 360 },
                            eronhiiRows,
                            metaForChart,
                            { showRangeSlider: false, forceGradientArea: true }
                          )}
                        </div>
                      )}
                      {cpiTrendFirstRow.length > 0 && (
                        <div className="!grid grid-cols-1 gap-6 sm:grid-cols-3">
                          {cpiTrendFirstRow.map((g) => (
                            <div key={String(g.code)} className="min-w-0 [&_h3.chart-section-title]:uppercase">
                              {renderTrendChart(
                                { ...chart, title: g.label, description: undefined, chartHeight: 260 },
                                g.rows,
                                metaForChart,
                                { showRangeSlider: false, forceGradientArea: true }
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {cpiTrendTailChunks.map((chunk, ri) => (
                        <div key={`cpi-trend-row-${ri}`} className="!grid grid-cols-1 gap-6 sm:grid-cols-3">
                          {chunk.map((g) => (
                            <div key={String(g.code)} className="min-w-0 [&_h3.chart-section-title]:uppercase">
                              {renderTrendChart(
                                { ...chart, title: g.label, description: undefined, chartHeight: 260 },
                                g.rows,
                                metaForChart,
                                { showRangeSlider: false, forceGradientArea: true }
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="py-4 chart-section-label text-[var(--muted-foreground)]">Өгөгдөл ачаалж байна…</p>
                  )}
                </div>
              );
            }

            if (config.id === "cpi" && chart.id === "cpi-detailed" && seriesDim && metaForChart) {
              const barilgaVar = metaForChart.variables.find((v) => v.code === seriesDim);
              const selectedCodes: string[] = (
                selectedSeriesCodes?.length ? selectedSeriesCodes : (barilgaVar?.values?.length ? [String(barilgaVar.values[0])] : [])
              ) as string[];
              const cpiDetailedFilter = barilgaVar?.values?.length ? (
                <Select
                  size="small"
                  value={selectedCodes[0] ?? barilgaVar.values[0]}
                  onChange={(val) => {
                    setTrendChartSeriesSelection((prev) => ({ ...prev, [chart.id]: [String(val)] }));
                  }}
                  options={(barilgaVar?.values ?? []).map((val, i) => ({
                    value: val,
                    label: barilgaVar?.valueTexts?.[i] ?? val,
                  }))}
                  style={{ minWidth: 200 }}
                />
              ) : null;
              return (
                <div key={chart.id} className="min-w-0 [&_h3.chart-section-title]:uppercase">
                  {renderTrendChart(
                    { ...chart, title: (chart.title ?? "").toUpperCase() },
                    trendData,
                    metaForChart,
                    {
                      useChartOwnRegionFilter: selectedLevel === "нийслэл" || selectedLevel === "улс",
                      showLatestValue: false,
                      headerExtraTitleRow: cpiDetailedFilter,
                      colorVariant: "orange",
                      forceGradientArea: true,
                    }
                  )}
                </div>
              );
            }

            if (config.id === "housing-prices" && chart.id === "housing-index" && metaForChart && housingIndexMode === "change") {
              const defaultHousingRange: [string, string] | undefined =
                availableHousingIndexMonths.length >= 1
                  ? (() => {
                      const last = availableHousingIndexMonths[availableHousingIndexMonths.length - 1]!;
                      const startIdx = availableHousingIndexMonths.findIndex((m) => m >= "2022-01");
                      const start = startIdx >= 0 ? availableHousingIndexMonths[startIdx]! : availableHousingIndexMonths[0]!;
                      return [start, last];
                    })()
                  : undefined;
              const rangePair = housingIndexMonthRange ?? defaultHousingRange;
              const nH = availableHousingIndexMonths.length;
              const hiLabels = availableHousingIndexMonths;
              const hLoHi = (() => {
                if (!rangePair || nH < 1) return { lo: 0, hi: 0 };
                let lo = hiLabels.indexOf(rangePair[0]);
                let hi = hiLabels.indexOf(rangePair[1]);
                if (lo < 0) lo = 0;
                if (hi < 0) hi = nH - 1;
                if (lo > hi) return { lo: hi, hi: lo };
                return { lo, hi };
              })();
              return (
                <div key={chart.id} className="space-y-4">
                  <div className="min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:text-[#0050C3]">
                    {renderTrendChart(
                      {
                        ...chart,
                        title: (chart.title ?? "").toUpperCase(),
                        description: undefined,
                        chartHeight: 400,
                      },
                      trendData,
                      metaForChart,
                      {
                        showRangeSlider: false,
                        rangeYears: rangePair ?? defaultHousingRange,
                        forceGradientArea: true,
                        yAxisMin: 0,
                        yAxisMax: 25,
                        valueAxisTitle: null,
                      }
                    )}
                  </div>
                  {nH > 1 && rangePair != null && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setHousingIndexRangePlaying((p) => !p)}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={housingIndexRangePlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={housingIndexRangePlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {housingIndexRangePlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {hiLabels[hLoHi.lo] ?? ""}
                        </span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={nH - 1}
                            value={[hLoHi.lo, hLoHi.hi]}
                            onChange={([a, b]) => {
                              setHousingIndexRangePlaying(false);
                              setHousingIndexMonthRange([hiLabels[a]!, hiLabels[b]!]);
                            }}
                            labels={hiLabels}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                          {hiLabels[hLoHi.hi] ?? ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (config.id === "housing-prices" && chart.id === "housing-by-district" && metaForChart) {
              const districtVar = metaForChart.variables.find((v) => v.code === "Дүүрэг");
              const allRows = chartDataByChartId[chart.id] ?? [];
              const rowsByIndicator = allRows.filter(
                (r) => String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "") === housingIndicatorMode
              );
              const districtCodes = districtVar?.values ?? ["0", "1", "2", "3", "4", "5", "6"];
              const districts = districtCodes.map((code) => {
                const idx = districtVar?.values?.indexOf(code) ?? -1;
                const label = idx >= 0 && districtVar?.valueTexts ? (districtVar.valueTexts[idx] ?? code) : code;
                const districtRows = rowsByIndicator.filter(
                  (r) => String(r["Дүүрэг_code"] ?? r["Дүүрэг"] ?? "") === String(code)
                );
                return { code, label, rows: districtRows };
              }).filter((d) => d.rows.length > 0);
              const dunja = districts.find((d) => d.label === "Дундаж");
              const others = districts.filter((d) => d.label !== "Дундаж");
              const housingIndicatorToggle = (
                <div className="filter-btn-group flex shrink-0 rounded-full bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setHousingIndicatorMode("0")}
                    className={housingIndicatorMode === "0" ? "active" : ""}
                  >
                    Шинэ
                  </button>
                  <button
                    type="button"
                    onClick={() => setHousingIndicatorMode("1")}
                    className={housingIndicatorMode === "1" ? "active" : ""}
                  >
                    Хуучин
                  </button>
                </div>
              );
              const districtChartOpts = {
                showRangeSlider: false as const,
                forceGradientArea: true,
                latestValueFormatter: (v: number) =>
                  `${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} сая`,
              };
              const mainTitle = "1 М2 ТАЛБАЙН ДУНДАЖ ҮНЭ";
              const otherChunks: (typeof others)[] = [];
              for (let i = 0; i < others.length; i += 3) otherChunks.push(others.slice(i, i + 3));
              return (
                <div key={chart.id} className="space-y-6">
                  {districts.length > 0 ? (
                    <>
                      {dunja && (
                        <div className="min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:text-[#0050C3]">
                          {renderTrendChart(
                            { ...chart, title: mainTitle, description: undefined, chartHeight: 400 },
                            dunja.rows,
                            metaForChart,
                            {
                              ...districtChartOpts,
                              headerExtraTitleRow: housingIndicatorToggle,
                            }
                          )}
                        </div>
                      )}
                      {otherChunks.map((chunk, ri) => (
                        <div key={`housing-duureg-${ri}`} className="!grid grid-cols-1 gap-6 sm:grid-cols-3">
                          {chunk.map((d) => (
                            <div key={String(d.code)} className="min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:text-[#0050C3]">
                              {renderTrendChart(
                                { ...chart, title: d.label, description: undefined, chartHeight: 280 },
                                d.rows,
                                metaForChart,
                                districtChartOpts
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="py-4 chart-section-label text-[var(--muted-foreground)]">Өгөгдөл ачаалж байна…</p>
                  )}
                </div>
              );
            }

            if (config.id === "unemployment" && chart.id === "unemployment-trend" && metaForChart) {
              const labourParticipation = charts.find((c) => c.id === "labour-participation");
              const bottomCharts = [
                charts.find((c) => c.id === "outside-labour-force"),
                charts.find((c) => c.id === "unemployed"),
                charts.find((c) => c.id === "employment"),
              ].filter(Boolean) as (typeof charts)[0][];
              const defaultRange =
                availableUnemploymentQuarters.length >= 1
                  ? ([availableUnemploymentQuarters[0], availableUnemploymentQuarters[availableUnemploymentQuarters.length - 1]] as [string, string])
                  : undefined;
              const labourMeta = labourParticipation ? metadataByChartId[labourParticipation.id] : null;
              const labourData = labourParticipation ? (chartDataByChartId[labourParticipation.id] ?? []) : [];
              const periods = availableUnemploymentQuarters;
              const nU = periods.length;
              const r0 = unemploymentRange?.[0];
              const r1 = unemploymentRange?.[1];
              let lo = r0 != null ? periods.indexOf(r0) : 0;
              let hi = r1 != null ? periods.indexOf(r1) : nU - 1;
              if (lo < 0) lo = 0;
              if (hi < 0) hi = Math.max(0, nU - 1);
              if (lo > hi) [lo, hi] = [hi, lo];
              const periodLabels = periods.map((p) => p.replace("-", " "));
              return (
                <div key={chart.id} className="space-y-8">
                  <div className="pb-3 border-b border-slate-200 dark:border-slate-600">
                    <h1 className="text-head-title">{config.shortTitle ?? config.name}</h1>
                  </div>
                  <div className="!grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="min-w-0 [&_h3.chart-section-title]:text-[#0050C3] [&_h3.chart-section-title]:uppercase">
                      {renderTrendChart({ ...chart, chartHeight: 300 }, trendData, metaForChart, {
                        showRangeSlider: false,
                        rangeYears: unemploymentRange ?? defaultRange,
                        forceGradientArea: true,
                      })}
                    </div>
                    <div className="min-w-0 [&_h3.chart-section-title]:text-[#0050C3] [&_h3.chart-section-title]:uppercase">
                      {labourParticipation && labourMeta ? (
                        renderTrendChart(
                          { ...labourParticipation, chartHeight: 300 },
                          labourData,
                          labourMeta,
                          {
                            showRangeSlider: false,
                            rangeYears: unemploymentRange ?? defaultRange,
                            forceGradientArea: true,
                          }
                        )
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-sm text-slate-400">Уншиж байна...</div>
                      )}
                    </div>
                  </div>
                  {bottomCharts.length > 0 && (
                    <div className="!grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {bottomCharts.map((c) => {
                        const meta = metadataByChartId[c.id];
                        const data = chartDataByChartId[c.id] ?? [];
                        if (!meta) return null;
                        return (
                          <div key={c.id} className="min-w-0 [&_h3.chart-section-title]:text-[#0050C3] [&_h3.chart-section-title]:uppercase">
                            {renderTrendChart(
                              { ...c, chartHeight: 260 },
                              data,
                              meta,
                              {
                                showRangeSlider: false,
                                rangeYears: unemploymentRange ?? defaultRange,
                                forceGradientArea: true,
                                latestValueFormatter: (v: number) =>
                                  `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} мянга`,
                                axisFormatter: (v: number) => (v / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }),
                                valueFormatter: (v: number) =>
                                  `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} мянга`,
                                valueAxisTitle: "мянга",
                              }
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {nU > 1 && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setUnemploymentRangePlaying((p) => !p)}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={unemploymentRangePlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={unemploymentRangePlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {unemploymentRangePlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {periodLabels[lo] ?? ""}
                        </span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={nU - 1}
                            value={[lo, hi]}
                            onChange={([a, b]) => {
                              setUnemploymentRangePlaying(false);
                              setUnemploymentRange([periods[a]!, periods[b]!]);
                            }}
                            labels={periodLabels}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                          {periodLabels[hi] ?? ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (
              config.id === "unemployment" &&
              ["labour-participation", "outside-labour-force", "unemployed", "employment"].includes(chart.id)
            ) {
              return null;
            }

            // Average-salary dashboard - эхний chart (Бүс-р)
            if (config.id === "average-salary" && chart.id === "wages-region-area" && metaForChart) {
              const busVar = metaForChart?.variables.find((v) => v.code === "Бүс") 
                ?? metadata?.variables.find((v) => v.code === "Бүс");
              const busFilter = busVar?.values?.length ? (() => {
                const values = busVar.values.map(String);
                const REGION_LABELS: Record<string, string> = {
                  "1": "Баруун бүс",
                  "2": "Хангайн бүс",
                  "3": "Төвийн бүс",
                  "4": "Зүүн бүс",
                  "5": "Улаанбаатар бүс",
                };
                const texts = (busVar.valueTexts ?? values).map((t, i) => {
                  const v = values[i] ?? "";
                  if (REGION_LABELS[v]) return REGION_LABELS[v]!;
                  return String(t);
                });
                const { treeData } = buildBusTreeData(values, texts);
                const treeDataSingle = treeData.map((n) => ({
                  ...n,
                  selectable: !(n.children && n.children.length > 0),
                  children: n.children?.map((c) => ({ ...c, selectable: true })),
                }));

                return (
                  <TreeSelect
                    size="small"
                    treeData={treeDataSingle as unknown as object[]}
                    value={selections["Бүс"]?.[0] ?? "0"}
                    onChange={(key) => handleSelectionChange("Бүс", [String(key)])}
                    treeCheckable={false}
                    allowClear={false}
                    treeDefaultExpandAll={false}
                    placeholder="Улсын дүн"
                    style={{ minWidth: 220 }}
                    popupMatchSelectWidth={false}
                    disabled={loading}
                  />
                );
              })() : null;
              const salaryFormatter = (v: number) => `${v.toLocaleString()} мянган ₮`;
              const salaryAxisFormatter = (v: number) => `${v.toLocaleString()}`;
              // Салбараар chart болон Бодит цалингийн индекс chart-уудыг олох
              const sectorChart = charts.find((c) => c.id === "wages-sector-area");
              const realIndexChart = charts.find((c) => c.id === "wages-real-index-area");
              const sectorMeta = metadataByChartId["wages-sector-area"];
              const realIndexMeta = metadataByChartId["wages-real-index-area"];
              const sectorData = chartDataByChartId["wages-sector-area"] ?? [];
              const realIndexData = chartDataByChartId["wages-real-index-area"] ?? [];
              const salbarVar = sectorMeta?.variables.find((v) => v.code === "Салбар") 
                ?? realIndexMeta?.variables.find((v) => v.code === "Салбар");
              const salbarOptionsAll = (salbarVar?.values ?? []).map((val, i) => ({
                value: val,
                label: salbarVar?.valueTexts?.[i] ?? val,
              }));
              const salbarOptionsFiltered = salbarOptionsAll.filter((o) => o.label !== "Улсын дундаж");
              const effectiveSalbarCode = salbarOptionsFiltered.some((o) => o.value === (selections["Салбар"]?.[0] ?? "0"))
                ? (selections["Салбар"]?.[0] ?? "0")
                : (salbarOptionsFiltered[0]?.value ?? "0");
              const selectedSalbarIdx = salbarVar?.values?.indexOf(effectiveSalbarCode) ?? 0;
              const selectedSalbarLabel = salbarVar?.valueTexts?.[selectedSalbarIdx] ?? "";
              const salbarFilter = salbarOptionsFiltered.length > 0 ? (
                <Select
                  size="small"
                  value={effectiveSalbarCode}
                  onChange={(val) => handleSelectionChange("Салбар", [String(val)])}
                  options={salbarOptionsFiltered}
                  style={{ minWidth: 200 }}
                />
              ) : null;
              // Slicer-р шүүх helper
              const filterByRange = (data: DataRow[], range: [string, string] | null): DataRow[] => {
                if (!range) return data;
                const [start, end] = range;
                return data.filter((r) => {
                  const p = String(r["Улирал"] ?? "");
                  return p >= start && p <= end;
                });
              };
              const realIndexIsMonthly = realIndexMeta?.variables?.some((v) => v.code === "Сар") ?? false;
              const sectorDataBySalbar = sectorData.filter((r) => String(r["Салбар_code"] ?? r["Салбар"] ?? "") === effectiveSalbarCode);
              const realIndexDataBySalbar = realIndexData.filter((r) => String(r["Салбар_code"] ?? r["Салбар"] ?? "") === effectiveSalbarCode);
              const filteredSectorData = filterByRange(sectorDataBySalbar, salaryRangeYears);
              // Улиралын range slider нь зөвхөн улиралын цуваатай таарна; 036V3 сарын индексэд бүх сарыг харуулна
              const filteredRealIndexData = realIndexIsMonthly
                ? realIndexDataBySalbar
                : filterByRange(realIndexDataBySalbar, salaryRangeYears);
              // Жилийн өсөлтийн цуваа тооцох helper (жишээ: 2025-4 vs 2024-4)
              const calcYoYGrowthSeries = (data: DataRow[], valueKey: string = "value"): DataRow[] => {
                const sorted = [...data].sort((a, b) => String(a["Улирал"] ?? "").localeCompare(String(b["Улирал"] ?? "")));
                const periodMap = new Map<string, DataRow>();
                for (const row of sorted) {
                  const period = String(row["Улирал"] ?? "");
                  periodMap.set(period, row);
                }
                const result: DataRow[] = [];
                for (const row of sorted) {
                  const period = String(row["Улирал"] ?? "");
                  const match = period.match(/^(\d+)-(\d+)$/);
                  if (!match) continue;
                  const year = parseInt(match[1], 10);
                  const quarter = match[2];
                  const prevPeriod = `${year - 1}-${quarter}`;
                  const prevRow = periodMap.get(prevPeriod);
                  if (!prevRow) continue;
                  const currVal = row[valueKey] ?? row["value"];
                  const prevVal = prevRow[valueKey] ?? prevRow["value"];
                  const curr = Number(currVal);
                  const prev = Number(prevVal);
                  if (prev && !isNaN(curr) && !isNaN(prev)) {
                    const growth = ((curr - prev) / prev) * 100;
                    result.push({ ...row, value: growth });
                  }
                }
                return result;
              };
              const calcYoYGrowthMonthSeries = (data: DataRow[], valueKey: string = "value"): DataRow[] => {
                const sorted = [...data].sort((a, b) => String(a["Сар"] ?? "").localeCompare(String(b["Сар"] ?? "")));
                const periodMap = new Map<string, DataRow>();
                for (const row of sorted) {
                  const p = String(row["Сар"] ?? "");
                  if (/^\d{4}-\d{2}$/.test(p)) periodMap.set(p, row);
                }
                const result: DataRow[] = [];
                for (const row of sorted) {
                  const period = String(row["Сар"] ?? "");
                  const match = period.match(/^(\d{4})-(\d{2})$/);
                  if (!match) continue;
                  const year = parseInt(match[1], 10);
                  const mo = match[2];
                  const prevPeriod = `${year - 1}-${mo}`;
                  const prevRow = periodMap.get(prevPeriod);
                  if (!prevRow) continue;
                  const currVal = row[valueKey] ?? row["value"];
                  const prevVal = prevRow[valueKey] ?? prevRow["value"];
                  const curr = Number(currVal);
                  const prev = Number(prevVal);
                  if (prev && !isNaN(curr) && !isNaN(prev)) {
                    result.push({ ...row, value: ((curr - prev) / prev) * 100 });
                  }
                }
                return result;
              };
              // Өсөлт тооцохдоо сонгосон салбарын data ашиглана, дараа нь range шүүнэ
              const sectorGrowthDataFull = calcYoYGrowthSeries(sectorDataBySalbar, "value");
              const realIndexGrowthDataFull = realIndexIsMonthly
                ? calcYoYGrowthMonthSeries(realIndexDataBySalbar, "value")
                : calcYoYGrowthSeries(realIndexDataBySalbar, "value");
              const sectorGrowthData = salaryMetricMode === "growth" ? filterByRange(sectorGrowthDataFull, salaryRangeYears) : filteredSectorData;
              const realIndexGrowthData =
                salaryMetricMode === "growth"
                  ? realIndexIsMonthly
                    ? realIndexGrowthDataFull
                    : filterByRange(realIndexGrowthDataFull, salaryRangeYears)
                  : filteredRealIndexData;
              const growthFormatter = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
              const growthAxisFormatter = (v: number) => `${v.toFixed(0)}%`;
              const salaryMetricToggle = (
                <Segmented
                  size="small"
                  value={salaryMetricMode}
                  onChange={(val) => setSalaryMetricMode((val ?? "value") as "value" | "growth")}
                  options={[
                    { label: "Дундаж", value: "value" },
                    { label: "Жилийн өөрчлөлт", value: "growth" },
                  ]}
                />
              );
              return (
                <div key={chart.id} className="col-span-full space-y-6">
                  {/* Эхний chart: Бүс-р */}
                  <div className="w-full">
                    {renderTrendChart(chart, trendData, metaForChart, {
                      showRangeSlider: true,
                      rangeYears: salaryRangeYears ?? undefined,
                      onRangeYearsChange: (s, e) => setSalaryRangeYears([s, e]),
                      headerExtra: busFilter,
                      dashedSeriesLabels: ["Бүгд"],
                      seriesLabelMap: { "Бүгд": "Дундаж" },
                      showLatestValue: true,
                      showLatestValueBySeries: true,
                      latestValueSeriesFilter: ["Бүгд"],
                      latestValueFormatter: salaryFormatter,
                      axisFormatter: salaryAxisFormatter,
                      valueFormatter: salaryFormatter,
                      valueAxisTitle: "мянган ₮",
                    })}
                  </div>
                  {/* Нэг toggle — Салбараар, Бодит цалингийн индекс chart-уудын гарчигуудын дээр */}
                  <div className="flex justify-end w-full">
                    {salaryMetricToggle}
                  </div>
                  {/* Хоёр chart: Салбараар + Бодит цалингийн индекс */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sectorChart && sectorMeta && (
                      <div className="w-full">
                        {renderTrendChart(
                          sectorChart,
                          sectorGrowthData,
                          sectorMeta,
                          {
                            ...(salaryMetricMode === "growth"
                              ? {
                                  showRangeSlider: false,
                                  showLatestValue: true,
                                  latestValueFormatter: growthFormatter,
                                  axisFormatter: growthAxisFormatter,
                                  valueFormatter: growthFormatter,
                                  valueAxisTitle: "%",
                                  tooltipUnit: selectedSalbarLabel,
                                }
                              : {
                                  showRangeSlider: false,
                                  showLatestValue: true,
                                  latestValueFormatter: salaryFormatter,
                                  axisFormatter: salaryAxisFormatter,
                                  valueFormatter: salaryFormatter,
                                  valueAxisTitle: "мянган ₮",
                                  tooltipUnit: selectedSalbarLabel,
                                }),
                            headerExtraInValueRow: true,
                            headerExtra: salbarFilter,
                          }
                        )}
                      </div>
                    )}
                    {realIndexChart && realIndexMeta && (
                      <div className="w-full">
                        {renderTrendChart(
                          realIndexChart,
                          realIndexGrowthData,
                          realIndexMeta,
                          {
                            ...(salaryMetricMode === "growth"
                              ? {
                                  showRangeSlider: false,
                                  showLatestValue: true,
                                  latestValueFormatter: growthFormatter,
                                  axisFormatter: growthAxisFormatter,
                                  valueFormatter: growthFormatter,
                                  valueAxisTitle: "%",
                                  tooltipUnit: selectedSalbarLabel,
                                }
                              : {
                                  showRangeSlider: false,
                                  showLatestValue: true,
                                  latestValueFormatter: (v: number) => `${v.toFixed(1)}`,
                                  axisFormatter: (v: number) => `${v}`,
                                  valueFormatter: (v: number) => `${v.toFixed(1)}`,
                                  tooltipUnit: selectedSalbarLabel,
                                }),
                            enableSlicers: false,
                          }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            // Average-salary: бусад chart-уудыг алгасах (дээр render хийсэн)
            if (config.id === "average-salary" && ["wages-sector-area", "wages-real-index-area"].includes(chart.id)) {
              return null;
            }

            // Дундаж цалин: Өмчийн хэлбэрээр + Ажил мэргэжлийн ангилалаар — зэрэгцээ, filter + Дундаж/Жилийн өөрчлөлт
            if (config.id === "average-salary" && chart.id === "wages-by-ownership" && metaForChart) {
              const ownershipChart = charts.find((c) => c.id === "wages-by-ownership");
              const occupationChart = charts.find((c) => c.id === "wages-by-occupation");
              const ownershipMeta = metadataByChartId["wages-by-ownership"];
              const occupationMeta = metadataByChartId["wages-by-occupation"];
              const ownershipData = processedChartData["wages-by-ownership"] ?? [];
              const occupationData = processedChartData["wages-by-occupation"] ?? [];
              const ownershipDim = "Өмчийн хэлбэр";
              const occupationDim = "Ажил мэргэжлийн ангилал";
              const filterOwnershipData = (data: DataRow[], code: string) =>
                data.filter((r) => String(r[`${ownershipDim}_code`] ?? r[ownershipDim] ?? "") === String(code));
              const filterOccupationData = (data: DataRow[], code: string) =>
                data.filter((r) => String(r[`${occupationDim}_code`] ?? r[occupationDim] ?? "") === String(code));
              const calcYoYGrowthSeries = (data: DataRow[], valueKey: string = "value"): DataRow[] => {
                const sorted = [...data].sort((a, b) => String(a["Улирал"] ?? "").localeCompare(String(b["Улирал"] ?? "")));
                const periodMap = new Map<string, DataRow>();
                for (const row of sorted) periodMap.set(String(row["Улирал"] ?? ""), row);
                const result: DataRow[] = [];
                for (const row of sorted) {
                  const period = String(row["Улирал"] ?? "");
                  const match = period.match(/^(\d+)-(\d+)$/);
                  if (!match) continue;
                  const prevPeriod = `${parseInt(match[1], 10) - 1}-${match[2]}`;
                  const prevRow = periodMap.get(prevPeriod);
                  if (!prevRow) continue;
                  const curr = Number(row[valueKey] ?? row["value"]);
                  const prev = Number(prevRow[valueKey] ?? prevRow["value"]);
                  if (prev && Number.isFinite(curr) && Number.isFinite(prev))
                    result.push({ ...row, value: ((curr - prev) / prev) * 100 });
                }
                return result;
              };
              const ownershipVar = ownershipMeta?.variables.find((v) => v.code === ownershipDim);
              const occupationVar = occupationMeta?.variables.find((v) => v.code === occupationDim);
              const ownershipOptionsAll = (ownershipVar?.values ?? []).map((val, i) => ({
                value: String(val),
                label: ownershipVar?.valueTexts?.[i] ?? String(val),
              }));
              const ownershipOptions = ownershipOptionsAll.filter((o) => o.label !== "Улсын дундаж");
              const effectiveOwnershipFilter = ownershipOptions.some((o) => o.value === wagesOwnershipFilter)
                ? wagesOwnershipFilter
                : (ownershipOptions[0]?.value ?? wagesOwnershipFilter);
              const ownershipFilteredForShow = filterOwnershipData(ownershipData, effectiveOwnershipFilter);
              const ownershipDataToShowFinal = salaryMetricMode === "growth" ? calcYoYGrowthSeries(ownershipFilteredForShow) : ownershipFilteredForShow;
              const salaryFormatter = (v: number) => `${v.toLocaleString()} мянган ₮`;
              const salaryAxisFormatter = (v: number) => `${v.toLocaleString()}`;
              const growthFormatter = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
              const growthAxisFormatter = (v: number) => `${v.toFixed(0)}%`;
              const isGrowth = salaryMetricMode === "growth";
              const occupationOptionsAll = (occupationVar?.values ?? []).map((val, i) => ({
                value: String(val),
                label: occupationVar?.valueTexts?.[i] ?? String(val),
              }));
              const occupationOptions = occupationOptionsAll.filter((o) => o.label !== "Улсын дундаж");
              const effectiveOccupationFilter = occupationOptions.some((o) => o.value === wagesOccupationFilter)
                ? wagesOccupationFilter
                : (occupationOptions[0]?.value ?? wagesOccupationFilter);
              const occupationFilteredForShow = filterOccupationData(occupationData, effectiveOccupationFilter);
              const occupationDataToShowFinal = salaryMetricMode === "growth" ? calcYoYGrowthSeries(occupationFilteredForShow) : occupationFilteredForShow;
              return (
                <div key="wages-ownership-occupation" className="space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {ownershipChart && ownershipMeta && (
                      <div className="w-full min-w-0">
                        {renderTrendChart(ownershipChart, ownershipDataToShowFinal, ownershipMeta, {
                          ...(isGrowth
                            ? { showRangeSlider: false, showLatestValue: true, latestValueFormatter: growthFormatter, axisFormatter: growthAxisFormatter, valueFormatter: growthFormatter, valueAxisTitle: "%" }
                            : { showRangeSlider: false, showLatestValue: true, latestValueFormatter: salaryFormatter, axisFormatter: salaryAxisFormatter, valueFormatter: salaryFormatter, valueAxisTitle: "мянган ₮" }),
                          headerExtraInValueRow: true,
                          headerExtra: ownershipOptions.length > 0 ? (
                            <Select
                              size="small"
                              value={effectiveOwnershipFilter}
                              onChange={(val) => setWagesOwnershipFilter(String(val))}
                              options={ownershipOptions}
                              style={{ minWidth: 180 }}
                            />
                          ) : undefined,
                        })}
                      </div>
                    )}
                    {occupationChart && occupationMeta && (
                      <div className="w-full min-w-0">
                        {renderTrendChart(occupationChart, occupationDataToShowFinal, occupationMeta, {
                          ...(isGrowth
                            ? { showRangeSlider: false, showLatestValue: true, latestValueFormatter: growthFormatter, axisFormatter: growthAxisFormatter, valueFormatter: growthFormatter, valueAxisTitle: "%" }
                            : { showRangeSlider: false, showLatestValue: true, latestValueFormatter: salaryFormatter, axisFormatter: salaryAxisFormatter, valueFormatter: salaryFormatter, valueAxisTitle: "мянган ₮" }),
                          headerExtraInValueRow: true,
                          headerExtra: occupationOptions.length > 0 ? (
                            <Select
                              size="small"
                              value={effectiveOccupationFilter}
                              onChange={(val) => setWagesOccupationFilter(String(val))}
                              options={occupationOptions}
                              style={{ minWidth: 180 }}
                            />
                          ) : undefined,
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            if (config.id === "average-salary" && chart.id === "wages-by-occupation") {
              return null;
            }
            // Household-survey: Орлого section
            if (config.id === "household-survey" && chart.id === "household-income-main" && metaForChart) {
              const incomeSmallCharts = charts.filter((c) =>
                ["household-income-wage", "household-income-pension", "household-income-production", "household-income-other", "household-income-free", "household-income-own-farm"].includes(c.id)
              );
              const thousandFormatter = (v: number) => `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} мянга`;
              const axisThousandFormatter = (v: number) => `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
              const typeVar = metaForChart.variables.find((v) => v.code === "Орлогын төрөл");
              const incomeSeriesLabelMap: Record<string, string> = {};
              if (typeVar?.values) {
                typeVar.values.forEach((code, i) => {
                  const label = typeVar.valueTexts?.[i] ?? String(code);
                  const c = String(code);
                  if (c === "0") incomeSeriesLabelMap[label] = "Нийт орлого";
                  else if (c === "1") incomeSeriesLabelMap[label] = "1. Мөнгөн орлого";
                  else incomeSeriesLabelMap[label] = label;
                });
              }
              const suurshilVar = metadata?.variables.find((v) => v.code === "Суурьшил");
              const suurshilSelect =
                suurshilVar && suurshilVar.values?.length ? (
                  <Select
                    size="small"
                    value={selections["Суурьшил"]?.[0] ?? suurshilVar.values[0]}
                    onChange={(val) => handleSelectionChange("Суурьшил", [String(val)])}
                    options={suurshilVar.values.map((val, i) => ({
                      value: val,
                      label: suurshilVar.valueTexts?.[i] ?? String(val),
                    }))}
                    style={{ minWidth: 200 }}
                    getPopupContainer={(n) => n?.parentElement ?? (typeof document !== "undefined" ? document.body : null)}
                  />
                ) : null;
              return (
                <div key="household-income-section" className="space-y-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
                    <h1 className="text-head-title">{config.shortTitle ?? config.name}</h1>
                    {suurshilSelect}
                  </div>
                  <div className="w-full min-w-0">
                    {renderTrendChart({ ...chart, chartHeight: 380 }, trendData, metaForChart, {
                      showRangeSlider: true,
                      rangeYears: householdRangeYears ?? undefined,
                      onRangeYearsChange: (s, e) => {
                        setHouseholdRangePlaying(false);
                        setHouseholdRangeYears([s, e]);
                      },
                      showLatestValueBySeries: true,
                      seriesLabelMap: incomeSeriesLabelMap,
                      seriesStackId: "household-income-stack",
                      forceGradientArea: true,
                      latestValueFormatter: thousandFormatter,
                      axisFormatter: axisThousandFormatter,
                      valueFormatter: thousandFormatter,
                      valueAxisTitle: "мянган ₮",
                    })}
                  </div>
                  {incomeSmallCharts.length > 0 && (
                    <div className="!grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {incomeSmallCharts.map((c) => {
                        const meta = metadataByChartId[c.id];
                        const data = processedChartData[c.id] ?? [];
                        if (!meta) return null;
                        return (
                          <div key={c.id} className="min-w-0 [&_h3.chart-section-title]:uppercase">
                            {renderTrendChart(
                              { ...c, chartHeight: 220 },
                              data,
                              meta,
                              {
                                showRangeSlider: false,
                                rangeYears: householdRangeYears ?? undefined,
                                forceGradientArea: true,
                                latestValueFormatter: thousandFormatter,
                                axisFormatter: axisThousandFormatter,
                                valueFormatter: thousandFormatter,
                                valueAxisTitle: "мянган ₮",
                              }
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            // Household-survey: Орлого жижиг chart-уудыг алгасах (дээр render хийсэн)
            if (config.id === "household-survey" && ["household-income-wage", "household-income-pension", "household-income-production", "household-income-other", "household-income-free", "household-income-own-farm"].includes(chart.id)) {
              return null;
            }

            // Household-survey: Зарлага section
            if (config.id === "household-survey" && chart.id === "household-expense-main" && metaForChart) {
              const expenseRow1Ids = ["household-expense-food", "household-expense-nonfood", "household-expense-other"];
              const expenseRow2Ids = ["household-expense-gift", "household-expense-free", "household-expense-own-farm"];
              const expenseCharts1 = charts.filter((c) => expenseRow1Ids.includes(c.id));
              const expenseCharts2 = charts.filter((c) => expenseRow2Ids.includes(c.id));
              const thousandFormatter = (v: number) => `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} мянга`;
              const axisThousandFormatter = (v: number) => `${(v / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
              const expTypeVar = metaForChart.variables.find((v) => v.code === "Зарлагын төрөл");
              const expenseSeriesLabelMap: Record<string, string> = {};
              if (expTypeVar?.values) {
                expTypeVar.values.forEach((code, i) => {
                  const label = expTypeVar.valueTexts?.[i] ?? String(code);
                  const c = String(code);
                  if (c === "0") expenseSeriesLabelMap[label] = "Нийт зарлага";
                  else if (c === "1") expenseSeriesLabelMap[label] = "1. Мөнгөн зарлага";
                  else expenseSeriesLabelMap[label] = label;
                });
              }
              const periods = availableHouseholdPeriods;
              const nP = periods.length;
              const r0 = householdRangeYears?.[0];
              const r1 = householdRangeYears?.[1];
              let lo = r0 != null ? periods.indexOf(r0) : 0;
              let hi = r1 != null ? periods.indexOf(r1) : nP - 1;
              if (lo < 0) lo = 0;
              if (hi < 0) hi = Math.max(0, nP - 1);
              if (lo > hi) [lo, hi] = [hi, lo];
              const periodLabels = periods.map((p) => p.replace("-", " "));
              return (
                <div key="household-expense-section" className="space-y-6">
                  <hr className="border-t border-slate-200 dark:border-slate-700 my-6" />
                  <div className="w-full min-w-0">
                    {renderTrendChart({ ...chart, chartHeight: 380 }, trendData, metaForChart, {
                      showRangeSlider: false,
                      rangeYears: householdRangeYears ?? undefined,
                      showLatestValueBySeries: true,
                      latestValueVertical: true,
                      seriesLabelMap: expenseSeriesLabelMap,
                      seriesStackId: "household-expense-stack",
                      forceGradientArea: true,
                      latestValueFormatter: thousandFormatter,
                      axisFormatter: axisThousandFormatter,
                      valueFormatter: thousandFormatter,
                      valueAxisTitle: "мянган ₮",
                      colorVariant: "muted",
                    })}
                  </div>
                  {nP > 1 && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setHouseholdRangePlaying((p) => !p)}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={householdRangePlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={householdRangePlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {householdRangePlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {periodLabels[lo] ?? ""}
                        </span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={nP - 1}
                            value={[lo, hi]}
                            onChange={([a, b]) => {
                              setHouseholdRangePlaying(false);
                              setHouseholdRangeYears([periods[a]!, periods[b]!]);
                            }}
                            labels={periodLabels}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                          {periodLabels[hi] ?? ""}
                        </span>
                      </div>
                    </div>
                  )}
                  {expenseCharts1.length > 0 && (
                    <div className="!grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {expenseCharts1.map((c) => {
                        const meta = metadataByChartId[c.id];
                        const data = processedChartData[c.id] ?? [];
                        if (!meta) return null;
                        return (
                          <div key={c.id} className="min-w-0 [&_h3.chart-section-title]:uppercase">
                            {renderTrendChart(
                              { ...c, chartHeight: 240 },
                              data,
                              meta,
                              {
                                showRangeSlider: false,
                                rangeYears: householdRangeYears ?? undefined,
                                forceGradientArea: true,
                                colorVariant: "muted",
                                latestValueFormatter: thousandFormatter,
                                axisFormatter: axisThousandFormatter,
                                valueFormatter: thousandFormatter,
                                valueAxisTitle: "мянган ₮",
                              }
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {expenseCharts2.length > 0 && (
                    <div className="!grid grid-cols-1 gap-6 sm:grid-cols-3">
                      {expenseCharts2.map((c) => {
                        const meta = metadataByChartId[c.id];
                        const data = processedChartData[c.id] ?? [];
                        if (!meta) return null;
                        return (
                          <div key={c.id} className="min-w-0 [&_h3.chart-section-title]:uppercase">
                            {renderTrendChart(
                              { ...c, chartHeight: 240 },
                              data,
                              meta,
                              {
                                showRangeSlider: false,
                                rangeYears: householdRangeYears ?? undefined,
                                forceGradientArea: true,
                                colorVariant: "muted",
                                latestValueFormatter: thousandFormatter,
                                axisFormatter: axisThousandFormatter,
                                valueFormatter: thousandFormatter,
                                valueAxisTitle: "мянган ₮",
                              }
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            // Household-survey: Зарлага жижиг chart-уудыг алгасах (дээр render хийсэн)
            if (config.id === "household-survey" && ["household-expense-food", "household-expense-nonfood", "household-expense-other", "household-expense-gift", "household-expense-free", "household-expense-own-farm"].includes(chart.id)) {
              return null;
            }

            // Household-survey GINI chart: Бүс filter-ийг гарчигийн ард харуулах
            if (config.id === "household-survey" && chart.id === "household-gini-036" && metaForChart) {
              const busVar = metaForChart.variables.find((v) => v.code === "Бүс");
              const busFilter = busVar?.values?.length ? (
                <Select
                  size="small"
                  value={selections["Бүс"]?.[0] ?? busVar.values[0]}
                  onChange={(val) => handleSelectionChange("Бүс", [String(val)])}
                  options={busVar.values.map((val, i) => ({
                    value: val,
                    label: busVar.valueTexts?.[i] ?? val,
                  }))}
                  style={{ minWidth: 200 }}
                  getPopupContainer={(n) => n?.parentElement ?? (typeof document !== "undefined" ? document.body : null)}
                />
              ) : null;
              const giniColorMap: Record<string, string> = { value: "#dc2626" };
              const busLabels = busVar?.valueTexts?.length
                ? busVar.valueTexts
                : ["Нийт", "Баруун бүс", "Хангайн бүс", "Төвийн бүс", "Зүүн бүс", "Улаанбаатар"];
              busLabels.forEach((label) => {
                giniColorMap[label] = "#dc2626";
              });
              return (
                <div key={chart.id} className="mt-10 space-y-2 border-t border-slate-200 pt-8 dark:border-slate-700">
                  {renderTrendChart(chart, trendData, metaForChart, {
                    headerExtraTitleRow: busFilter,
                    rangeYears: householdRangeYears ?? undefined,
                    onRangeYearsChange: (s, e) => {
                      setHouseholdRangePlaying(false);
                      setHouseholdRangeYears([s, e]);
                    },
                    showRangeSlider: true,
                    yAxisMin: 0.2,
                    yAxisMax: 0.4,
                    seriesColorMap: giniColorMap,
                    forceGradientArea: true,
                    chartHeight: 320,
                    latestValueFormatter: (v: number) => v.toFixed(2),
                    valueFormatter: (v: number) => v.toFixed(2),
                    axisFormatter: (v: number) => v.toFixed(2),
                  })}
                </div>
              );
            }

            // Дундаж цалин: wages-region-area-д нэгтгэсэн sector + real-index-ийг л алгасах; доорх 2 chart (өмчийн хэлбэр, мэргэжил) generic-ээр рендерлэнэ
            if (
              config.id === "average-salary" &&
              ["wages-sector-area", "wages-real-index-area"].includes(chart.id)
            ) {
              return null;
            }

            if (twoCol?.bottomFullWidthChartIds?.length && twoCol.bottomFullWidthChartIds[0] === chart.id) {
              const bottomCharts = twoCol.bottomFullWidthChartIds
                .map((id) => charts.find((c) => c.id === id))
                .filter(Boolean) as (typeof charts)[0][];
              return (
                <div key="household-bottom-charts" className="mt-10 w-full space-y-6">
                  {bottomCharts.map((c) => {
                    const meta = metadataByChartId[c.id];
                    const data = chartDataByChartId[c.id] ?? [];
                    if (!meta) return null;
                    return (
                      <div key={c.id} className="w-full">
                        {renderTrendChart(c, data, meta)}
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (threeCol?.length && chart.id === threeCol[0]) {
              const threeCharts = threeCol
                .map((id) => charts.find((c) => c.id === id))
                .filter(Boolean) as (typeof charts)[0][];
              const bottomChartId = config.educationBottomChartId;
              const graduatesChart = bottomChartId ? charts.find((c) => c.id === bottomChartId) : null;
              const slicerDataChart = graduatesChart ?? threeCharts[0];
              const educationCategoryLabels: Record<string, string> = {
                "0": "Цэцэрлэг",
                "1": "Ерөнхий боловсролын сургууль",
                "5": "Техникийн болон мэргэжлийн боловсролын сургалтын байгууллага",
                "8": "Дээд боловсролын сургалтын байгууллага",
              };
              const selectedEducationCategory = selections["Ангилал"]?.[0] ?? "0";
              const educationCategoryLabel = educationCategoryLabels[selectedEducationCategory] ?? "Цэцэрлэг";
              const educationChartShell =
                "min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:font-semibold [&_h3.chart-section-title]:tracking-wide [&_h3.chart-section-title]:text-[#001C44] dark:[&_h3.chart-section-title]:text-slate-100 [&_.chart-section-value]:text-2xl [&_.chart-section-value]:font-normal [&_.chart-section-value]:tabular-nums [&_.chart-section-value]:text-slate-900 dark:[&_.chart-section-value]:text-slate-50 [&_.chart-section-label]:font-normal [&_.chart-section-label]:text-[var(--muted-foreground)]";
              return (
                <div key="education-three-col" className="space-y-8">
                  <div className="!grid w-full min-w-0 grid-cols-1 gap-8 md:!grid-cols-3 md:gap-x-6 md:gap-y-6">
                  {threeCharts.map((c) => {
                    const meta = metadataByChartId[c.id];
                    const data = (c as { chartFixedQuery?: unknown }).chartFixedQuery
                      ? (processedChartData[c.id] ?? [])
                      : (chartDataByChartId[c.id] ?? []);
                    if (!meta) return <div key={c.id} />;
                    const isStudents = c.id === "education-students";
                    const educationValueFormatter = isStudents
                      ? (v: number) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} мянга`
                      : (v: number) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });
                    return (
                      <div key={c.id} className={educationChartShell}>
                        {renderTrendChart(c, data, meta, {
                          hideHeader: false,
                          rangeYears: educationRangeYears,
                          onRangeYearsChange: (s, e) => setEducationRangeYears([s, e]),
                          showRangeSlider: false,
                          tooltipUnit: educationCategoryLabel,
                          valueFormatter: educationValueFormatter,
                          latestValueFormatter: educationValueFormatter,
                          valueAxisTitle: isStudents ? "мянга" : null,
                          forceGradientArea: true,
                          yAxisMin: 0,
                        })}
                      </div>
                    );
                  })}
                  </div>
                  {(() => {
                    if (!slicerDataChart || threeCharts.length === 0) return null;
                    const xKey = slicerDataChart.xDimension ?? "Он";
                    const rowYear = (r: DataRow) => String(r[xKey] ?? r[`${xKey}_code`] ?? "").trim();
                    const yearSet = new Set<string>();
                    const addYearsFromChart = (chart: (typeof charts)[0]) => {
                      const rows = (chart as { chartFixedQuery?: unknown }).chartFixedQuery
                        ? (processedChartData[chart.id] ?? [])
                        : (chartDataByChartId[chart.id] ?? []);
                      for (const r of rows) {
                        const y = rowYear(r);
                        if (y) yearSet.add(y);
                      }
                    };
                    for (const c of threeCharts) addYearsFromChart(c);
                    if (graduatesChart) addYearsFromChart(graduatesChart);
                    const years = [...yearSet].sort((a, b) =>
                      /^\d+$/.test(a) && /^\d+$/.test(b) ? Number(a) - Number(b) : String(a).localeCompare(b)
                    );
                    educationYearsRef.current = years;
                    if (years.length < 2) return null;
                    const n = years.length;
                    const [startY, endY] = educationRangeYears;
                    let i0 = years.indexOf(startY);
                    let i1 = years.indexOf(endY);
                    if (i0 < 0) i0 = 0;
                    if (i1 < 0) i1 = n - 1;
                    if (i0 > i1) i0 = i1;
                    educationRangeRef.current = { n, range: [i0, i1] };
                    return (
                      <div key="education-slicer" className="mt-2 border-t border-slate-200/90 pt-6 dark:border-slate-700">
                        <div className="flex min-h-9 flex-nowrap items-center gap-3 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => setEducationPlaying((p) => !p)}
                            className="range-slider-play-btn"
                            title={educationPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                            aria-label={educationPlaying ? "Зогсоох" : "Тоглуулах"}
                          >
                            {educationPlaying ? (
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
                            {years[i0]}
                          </span>
                          <div className="min-w-0 w-full flex-1">
                            <RangeSlider
                              min={0}
                              max={n - 1}
                              value={[i0, i1]}
                              onChange={([lo, hi]) => {
                                setEducationPlaying(false);
                                setEducationRangeYears([years[lo]!, years[hi]!]);
                              }}
                              labels={years}
                              showLabels={false}
                              className="w-full"
                            />
                          </div>
                          <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap text-right text-xs font-normal tabular-nums text-slate-700 dark:text-slate-200">
                            {years[i1]}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  {graduatesChart && (() => {
                    const meta = metadataByChartId[graduatesChart.id];
                    const data = (graduatesChart as { chartFixedQuery?: unknown }).chartFixedQuery
                      ? (processedChartData[graduatesChart.id] ?? [])
                      : (chartDataByChartId[graduatesChart.id] ?? []);
                    if (!meta) return null;
                    const graduatesFormatter = (v: number) => `${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })} мянга`;
                    return (
                      <div key={graduatesChart.id} className={`w-full pt-2 ${educationChartShell}`}>
                        {renderTrendChart(graduatesChart, data, meta, {
                          hideHeader: false,
                          rangeYears: educationRangeYears,
                          onRangeYearsChange: (s, e) => setEducationRangeYears([s, e]),
                          showRangeSlider: false,
                          valueFormatter: graduatesFormatter,
                          latestValueFormatter: graduatesFormatter,
                          valueAxisTitle: "мянга",
                          forceGradientArea: true,
                          seriesStackId: "education-graduates",
                          yAxisMin: 0,
                          widePlot: true,
                          chartHeight: graduatesChart.chartHeight ?? 380,
                        })}
                      </div>
                    );
                  })()}
                </div>
              );
            }

            if (twoCol && chart.id === twoCol.leftChartIds[0]) {
              const leftCharts = twoCol.leftChartIds
                .map((id) => charts.find((c) => c.id === id))
                .filter(Boolean) as (typeof charts)[0][];
              const rightCharts = twoCol.rightChartIds
                .map((id) => charts.find((c) => c.id === id))
                .filter(Boolean) as (typeof charts)[0][];
              const renderColumn = (list: (typeof charts)[0][]) =>
                list.map((c) => {
                  if (c.type === "pyramid") {
                    return (
                      <div key={c.id}>
                        <PopulationPyramidChart config={c} hideHeader />
                      </div>
                    );
                  }
                  const meta = metadataByChartId[c.id];
                  const data = chartDataByChartId[c.id] ?? [];
                  if (!meta) return null;
                  if (c.type === "bar") {
                    let barData: DataRow[] = data;
                    const yearDim = c.yearSlicerDimension;
                    const useGlobalUliral = config.id === "average-salary" && yearDim === "Улирал";
                    if (yearDim && !useGlobalUliral) {
                      const yearsInData = [...new Set(barData.map((r) => String(r[yearDim] ?? r[`${yearDim}_code`] ?? "")).filter(Boolean))].sort((a, b) =>
                        /^\d+$/.test(a) && /^\d+$/.test(b) ? Number(b) - Number(a) : String(a).localeCompare(String(b))
                      );
                      const selectedYear = yearsInData.length > 0 ? barChartYear[c.id] ?? yearsInData[0] : undefined;
                      if (selectedYear) barData = barData.filter((r) => String(r[yearDim] ?? r[`${yearDim}_code`]) === selectedYear);
                      const yearSlicer =
                        yearsInData.length > 0
                          ? {
                              dimensionCode: yearDim,
                              options: yearsInData.map((v) => ({ value: v, label: v })),
                              value: selectedYear ?? yearsInData[0],
                              onChange: (v: string) => setBarChartYear((prev) => ({ ...prev, [c.id]: v })),
                              loading: false,
                            }
                          : undefined;
                      return (
                        <div key={c.id} className="space-y-2">
                          <ChartBar
                            data={barData}
                            xKey={c.xDimension}
                            seriesKey={c.seriesDimensions?.[0]}
                            title={c.title}
                            description={c.description}
                            maxBars={c.xDimension === "Бүс" || c.xDimension === "Аймаг" ? 30 : 22}
                            yearSlicer={yearSlicer}
                          />
                        </div>
                      );
                    }
                    if (useGlobalUliral && selections["Улирал"]?.length) {
                      barData = barData.filter((r) =>
                        selections["Улирал"]!.some((q) => String(r[yearDim!] ?? r[`${yearDim!}_code`] ?? "") === String(q))
                      );
                    }
                    return (
                      <div key={c.id} className="space-y-2">
                        <ChartBar
                          data={barData}
                          xKey={c.xDimension}
                          seriesKey={c.seriesDimensions?.[0]}
                          title={c.title}
                          description={c.description}
                          maxBars={30}
                        />
                      </div>
                    );
                  }
                  return (
                    <div key={c.id}>
                      {renderTrendChart(c, data, meta, { hideHeader: true })}
                    </div>
                  );
                });
              const hasRight = rightCharts.length > 0;
              return (
                <div key="household-two-col" className={hasRight ? "grid grid-cols-1 gap-0 md:grid-cols-2" : "space-y-6"}>
                  <div className={hasRight ? "space-y-6 pr-3 md:border-r md:border-[var(--card-border)] md:pr-6" : "space-y-6"}>
                    {twoCol.leftLabel ? <h3 className="chart-section-title">{twoCol.leftLabel}</h3> : null}
                    {renderColumn(leftCharts)}
                  </div>
                  {hasRight && (
                    <div className="mt-6 space-y-6 pl-3 md:mt-0 md:pl-6">
                      {twoCol.rightLabel ? <h3 className="chart-section-title">{twoCol.rightLabel}</h3> : null}
                      {renderColumn(rightCharts)}
                    </div>
                  )}
                </div>
              );
            }

            let trendDataToShow = trendData.length > 0 ? trendData : rowsForChart;
            if (config.id === "ppi" && chart.id === "ppi-industrial" && metaForChart) {
              trendDataToShow = trendDataToShow.filter(
                (r) => String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "") === ppiIndicatorMode
              );
              const ppiSectors: { code: string; label: string }[] = [
                { code: "0", label: "" },
                { code: "1", label: "Уул уурхай, олборлолт" },
                { code: "7", label: "Боловсруулах үйлдвэрлэл" },
                { code: "26", label: "Цахилгаан" },
                { code: "27", label: "Ус хангамж, хог хаягдал" },
              ];
              const sectorCharts = ppiSectors.map((sector) => {
                const sectorRows = trendDataToShow.filter(
                  (r) => String(r["Дэд салбар_code"] ?? r["Дэд салбар"] ?? "") === sector.code
                );
                return { ...sector, rows: sectorRows };
              });
              const eronhii = sectorCharts[0];
              const others = sectorCharts.slice(1);
              const ppiSectionIds = ["ppi-transport", "ppi-info-comm", "ppi-accommodation", "ppi-food-service"] as const;
              const indicatorCodeForSection = (chartId: string) => {
                if (chartId === "ppi-accommodation") {
                  return ppiIndicatorMode === "1" ? "3" : "2";
                }
                if (chartId === "ppi-food-service") {
                  return ppiIndicatorMode === "3" ? "3" : "1";
                }
                return ppiIndicatorMode;
              };
              const ppiToggle = (
                <div className="filter-btn-group flex shrink-0 flex-wrap justify-end rounded-full bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPpiIndicatorMode("1")}
                    className={ppiIndicatorMode === "1" ? "active" : ""}
                  >
                    Өмнөх оны мөн үетэй харьцуулсан
                  </button>
                  <button
                    type="button"
                    onClick={() => setPpiIndicatorMode("3")}
                    className={ppiIndicatorMode === "3" ? "active" : ""}
                  >
                    Өмнөх сартай харьцуулсан
                  </button>
                </div>
              );
              const defaultPpiRange: [string, string] | undefined =
                availablePpiPeriods.length >= 1
                  ? (() => {
                      const idx = availablePpiPeriods.findIndex((p) => parseInt(String(p).slice(0, 4), 10) >= 2025);
                      const start = idx >= 0 ? availablePpiPeriods[idx]! : availablePpiPeriods[0]!;
                      const end = availablePpiPeriods[availablePpiPeriods.length - 1]!;
                      return [start, end];
                    })()
                  : undefined;
              const rangePair = ppiRangePeriod ?? defaultPpiRange;
              const periodLabelsPpi = availablePpiPeriods;
              const nPpi = periodLabelsPpi.length;
              const ppiLoHi = (() => {
                if (!rangePair || nPpi < 1) return { lo: 0, hi: 0 };
                let lo = periodLabelsPpi.indexOf(rangePair[0]);
                let hi = periodLabelsPpi.indexOf(rangePair[1]);
                if (lo < 0) lo = 0;
                if (hi < 0) hi = nPpi - 1;
                if (lo > hi) return { lo: hi, hi: lo };
                return { lo, hi };
              })();
              const ppiMiniOpts = {
                showRangeSlider: false as const,
                rangeYears: rangePair,
                forceGradientArea: true,
                latestValueFormatter: (v: number) => `${Number(v).toFixed(1)}`,
                axisFormatter: (v: number) => `${Math.round(v)}`,
                valueAxisTitle: null,
              };
              return (
                <div key={chart.id} className="space-y-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold uppercase tracking-tight text-[#0050C3] dark:text-blue-400">
                        {(chart.title ?? "").toUpperCase()}
                      </h3>
                      {chart.description && (
                        <p className="mt-1 text-sm leading-snug text-[var(--muted-foreground)]">{chart.description}</p>
                      )}
                    </div>
                    {ppiToggle}
                  </div>
                  {eronhii && (
                    <div className="min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:text-[#0050C3]">
                      {renderTrendChart(
                        { ...chart, title: "", description: undefined, chartHeight: 400 },
                        eronhii.rows,
                        metaForChart,
                        {
                          showRangeSlider: false,
                          rangeYears: rangePair,
                          forceGradientArea: true,
                          yAxisMin: -10,
                          yAxisMax: 20,
                          valueAxisTitle: null,
                          latestValueFormatter: (v: number) => `${Number(v).toFixed(1)}`,
                          axisFormatter: (v: number) => `${Math.round(v)}`,
                        }
                      )}
                    </div>
                  )}
                  {nPpi > 1 && rangePair != null && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setPpiRangePlaying((p) => !p)}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                        title={ppiRangePlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                        aria-label={ppiRangePlaying ? "Зогсоох" : "Тоглуулах"}
                      >
                        {ppiRangePlaying ? (
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
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {periodLabelsPpi[ppiLoHi.lo] ?? ""}
                        </span>
                        <div className="min-w-0 flex-1">
                          <RangeSlider
                            min={0}
                            max={nPpi - 1}
                            value={[ppiLoHi.lo, ppiLoHi.hi]}
                            onChange={([a, b]) => {
                              setPpiRangePlaying(false);
                              setPpiRangePeriod([periodLabelsPpi[a]!, periodLabelsPpi[b]!]);
                            }}
                            labels={periodLabelsPpi}
                            showLabels={false}
                          />
                        </div>
                        <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                          {periodLabelsPpi[ppiLoHi.hi] ?? ""}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="!grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {others.map((s) => (
                      <div key={s.code} className="min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:text-[#0050C3]">
                        {renderTrendChart(
                          { ...chart, title: (s.label ?? "").toUpperCase(), description: undefined, chartHeight: 220 },
                          s.rows,
                          metaForChart,
                          ppiMiniOpts
                        )}
                      </div>
                    ))}
                    {ppiSectionIds.map((cid) => {
                      const c = charts.find((ch) => ch.id === cid);
                      if (!c) return null;
                      const rawData = chartDataByChartId[c.id] ?? [];
                      const meta = metadataByChartId[c.id] ?? metadata;
                      if (!meta) return null;
                      const code = indicatorCodeForSection(c.id);
                      const data = rawData.filter(
                        (r) => String(r["Үзүүлэлт_code"] ?? r["Үзүүлэлт"] ?? "") === code
                      );
                      return (
                        <div key={c.id} className="min-w-0 [&_h3.chart-section-title]:uppercase [&_h3.chart-section-title]:text-[#0050C3]">
                          {renderTrendChart(
                            { ...c, title: (c.title ?? "").toUpperCase(), description: undefined, chartHeight: 220 },
                            data,
                            meta,
                            ppiMiniOpts
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            const ppiSectionIds = ["ppi-transport", "ppi-info-comm", "ppi-accommodation", "ppi-food-service"];
            const isPpiSectionChart = config.id === "ppi" && ppiSectionIds.includes(chart.id);
            if (config.id === "ppi" && chart.id === "ppi-transport") {
              return null;
            }
            if (config.id === "ppi" && (chart.id === "ppi-info-comm" || chart.id === "ppi-accommodation" || chart.id === "ppi-food-service")) {
              return null;
            }
            if (!metaForChart) return null;

            // 8 бүтээгдэхүүний grid — өөрөө тусад chart биш, доор cpi-commodity-trend-ийн доор харуулна
            if (config.id === "cpi-commodity-prices" && chart.id === "cpi-commodity-grid") return null;

            // Гол нэрийн барааны үнэ: гарчиг/тооны доор сонгосон бүтээгдэхүүний нэр, chart, доор нь 7 хоногийн үнэний range slider (эртнээс сүүл рүү) + play
            if (config.id === "cpi-commodity-prices" && chart.id === "cpi-commodity-trend") {
              const timeVarCommodity = metaForChart.variables.find((v) => v.code === "Хугацаа");
              const productVar = metaForChart.variables.find((v) => v.code === "Бүтээгдэхүүн");
              const selectedProductCode = selections["Бүтээгдэхүүн"]?.[0];
              const productLabel =
                productVar && selectedProductCode != null
                  ? (productVar.valueTexts?.[productVar.values?.indexOf(selectedProductCode) ?? -1] ?? selectedProductCode)
                  : "";
              const commodityHeaderExtra = productLabel ? (
                <span className="text-xs text-[var(--muted-foreground)]">{productLabel}</span>
              ) : undefined;

              const commodityValueFmt = (v: number) => `${Math.round(Number(v)).toLocaleString("en-US")} ₮`;
              const commodityTooltipOpts = {
                tooltipUnit: productLabel || undefined,
                valueFormatter: commodityValueFmt,
                latestValueFormatter: commodityValueFmt,
                axisFormatter: (v: number) => Math.round(Number(v)).toLocaleString("en-US"),
              };
              if (!timeVarCommodity?.values?.length) {
                return (
                  <div key={chart.id} className="min-w-0">
                    {renderTrendChart(chart, trendDataToShow, metaForChart, {
                      headerExtra: commodityHeaderExtra,
                      headerExtraInValueRow: true,
                      showRangeSlider: false,
                      hideHeader: false,
                      ...commodityTooltipOpts,
                    })}
                  </div>
                );
              }

              const n = timeVarCommodity.values.length;
              const reversedValues = [...timeVarCommodity.values].reverse();
              const reversedLabels = [...(timeVarCommodity.valueTexts ?? timeVarCommodity.values.map(String))].reverse();
              commodityPlayRef.current = { reversedValues, n };

              // API-н Хугацаа шинэ эхэнд байгаа тул selectedCodes[0]=шинэ, selectedCodes[last]=хамгийн эртний сонголт
              const selectedCodes = selections["Хугацаа"];
              const revIdxFirst = selectedCodes?.length ? reversedValues.indexOf(selectedCodes[0]!) : -1;
              const revIdxLast = selectedCodes?.length ? reversedValues.indexOf(selectedCodes[selectedCodes.length - 1]!) : -1;
              const sliderLow = selectedCodes?.length && revIdxFirst >= 0 && revIdxLast >= 0
                ? Math.min(revIdxFirst, revIdxLast)
                : 0;
              const sliderHigh = selectedCodes?.length && revIdxFirst >= 0 && revIdxLast >= 0
                ? Math.max(revIdxFirst, revIdxLast)
                : n - 1;

              return (
                <div key={chart.id} className="min-w-0 space-y-4">
                  {renderTrendChart(chart, trendDataToShow, metaForChart, {
                    headerExtra: commodityHeaderExtra,
                    headerExtraInValueRow: true,
                    showRangeSlider: false,
                    hideHeader: false,
                    ...commodityTooltipOpts,
                  })}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setCommodityPlaying((p) => !p)}
                      className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                      title={commodityPlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                      aria-label={commodityPlaying ? "Зогсоох" : "Тоглуулах"}
                    >
                      {commodityPlaying ? (
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
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {reversedLabels[sliderLow] ?? ""}
                      </span>
                      <div className="min-w-0 flex-1">
                        <RangeSlider
                          min={0}
                          max={n - 1}
                          value={[sliderLow, sliderHigh]}
                          onChange={([low, high]) => {
                            setCommodityPlaying(false);
                            const codes = reversedValues.slice(low, high + 1).map(String);
                            setSelections((prev) => ({ ...prev, Хугацаа: codes }));
                          }}
                          labels={reversedLabels}
                          showLabels={false}
                        />
                      </div>
                      <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                        {reversedLabels[sliderHigh] ?? ""}
                      </span>
                    </div>
                  </div>
                  {/* 8 бүтээгдэхүүн — 2x4 grid: Гурил, Талх, Хонины мах, Үхрийн мах, Сүү, Өндөг, Аи-92, Дизель */}
                  {(() => {
                    const gridData = chartDataByChartId["cpi-commodity-grid"] ?? [];
                    const gridMeta = metadataByChartId["cpi-commodity-grid"];
                    if (!gridMeta || gridData.length === 0) return null;
                    const productVar = gridMeta.variables.find((v) => v.code === "Бүтээгдэхүүн");
                    const gridCodes = ["3", "5", "9", "10", "16", "22", "30", "31"];
                    const gridCharts = gridCodes.map((code) => {
                      const rows = gridData.filter(
                        (r) => String(r["Бүтээгдэхүүн_code"] ?? r["Бүтээгдэхүүн"] ?? "") === code
                      );
                      const label = productVar
                        ? (productVar.valueTexts?.[productVar.values?.indexOf(code) ?? -1] ?? code)
                        : code;
                      return { code, label, rows };
                    });
                    return (
                      <div className="mt-8">
                        <div className="!grid grid-cols-2 gap-4">
                          {gridCharts.map(({ code, label, rows }) => (
                            <div key={code} className="min-w-0">
                              {renderTrendChart(
                                { ...chart, id: `cpi-commodity-grid-${code}`, title: label, chartHeight: 200 },
                                rows,
                                gridMeta,
                                {
                                  showRangeSlider: false,
                                  hideHeader: false,
                                  valueFormatter: (v: number) => `${Math.round(Number(v)).toLocaleString("en-US")} ₮`,
                                  latestValueFormatter: (v: number) => `${Math.round(Number(v)).toLocaleString("en-US")} ₮`,
                                  axisFormatter: (v: number) => Math.round(Number(v)).toLocaleString("en-US"),
                                  tooltipUnit: label,
                                }
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }

            return (
              <div key={chart.id} className={config.id === "average-salary" ? "min-w-0" : undefined}>
                {renderTrendChart(chart, trendDataToShow, metaForChart, {
                  showRangeSlider: isPpiSectionChart ? true : undefined,
                })}
              </div>
            );
          }
          if (chart.type === "pyramid") {
            const twoColPyramid = config.twoColumnLayout;
            if (twoColPyramid?.rightChartIds.includes(chart.id)) return null;
            if (twoColPyramid && chart.id === twoColPyramid.leftChartIds[0]) {
              const leftCharts = twoColPyramid.leftChartIds
                .map((id) => charts.find((c) => c.id === id))
                .filter(Boolean) as (typeof charts)[0][];
              const rightCharts = twoColPyramid.rightChartIds
                .map((id) => charts.find((c) => c.id === id))
                .filter(Boolean) as (typeof charts)[0][];
              const renderColumn = (list: (typeof charts)[0][]) =>
                list.map((c) => {
                  if (c.type === "pyramid") {
                    return (
                      <div key={c.id}>
                        <PopulationPyramidChart config={c} hideHeader />
                      </div>
                    );
                  }
                  const meta = metadataByChartId[c.id];
                  const data = chartDataByChartId[c.id] ?? [];
                  if (!meta) return null;
                  if (c.type === "bar") {
                    let barData: DataRow[] = data;
                    const yearDim = c.yearSlicerDimension;
                    const useGlobalUliral = config.id === "average-salary" && yearDim === "Улирал";
                    if (yearDim && !useGlobalUliral) {
                      const yearsInData = [...new Set(barData.map((r) => String(r[yearDim] ?? r[`${yearDim}_code`] ?? "")).filter(Boolean))].sort((a, b) =>
                        /^\d+$/.test(a) && /^\d+$/.test(b) ? Number(b) - Number(a) : String(a).localeCompare(String(b))
                      );
                      const selectedYear = yearsInData.length > 0 ? barChartYear[c.id] ?? yearsInData[0] : undefined;
                      if (selectedYear) barData = barData.filter((r) => String(r[yearDim] ?? r[`${yearDim}_code`]) === selectedYear);
                      const yearSlicer =
                        yearsInData.length > 0
                          ? {
                              dimensionCode: yearDim,
                              options: yearsInData.map((v) => ({ value: v, label: v })),
                              value: selectedYear ?? yearsInData[0],
                              onChange: (v: string) => setBarChartYear((prev) => ({ ...prev, [c.id]: v })),
                              loading: false,
                            }
                          : undefined;
                      return (
                        <div key={c.id} className="space-y-2">
                          <ChartBar
                            data={barData}
                            xKey={c.xDimension}
                            seriesKey={c.seriesDimensions?.[0]}
                            title={c.title}
                            description={c.description}
                            maxBars={c.xDimension === "Бүс" || c.xDimension === "Аймаг" ? 30 : 22}
                            yearSlicer={yearSlicer}
                          />
                        </div>
                      );
                    }
                    if (useGlobalUliral && selections["Улирал"]?.length) {
                      barData = barData.filter((r) =>
                        selections["Улирал"]!.some((q) => String(r[yearDim!] ?? r[`${yearDim!}_code`] ?? "") === String(q))
                      );
                    }
                    return (
                      <div key={c.id} className="space-y-2">
                        <ChartBar
                          data={barData}
                          xKey={c.xDimension}
                          seriesKey={c.seriesDimensions?.[0]}
                          title={c.title}
                          description={c.description}
                          maxBars={30}
                        />
                      </div>
                    );
                  }
                  const householdBusVar = c.id === "population-household-count" ? meta?.variables?.find((v) => v.code === "Бүс") : undefined;
                  const householdBusCode = selections["Бүс"]?.[0] ?? "0";
                  const householdBusLabel = householdBusVar?.values?.length && householdBusVar?.valueTexts?.length
                    ? (householdBusVar.valueTexts[householdBusVar.values.indexOf(householdBusCode)] ?? householdBusCode)
                    : householdBusCode;
                  const householdHeaderExtra = c.id === "population-household-count" && householdBusLabel
                    ? <span className="chart-section-label text-[var(--muted-foreground)]">{householdBusLabel}</span>
                    : undefined;
                  const householdData = c.id === "population-household-count" && householdMetricMode === "growth"
                    ? (data as DataRow[]).filter((r) => {
                        const y = r["Он"] ?? r["Он_code"];
                        const year = typeof y === "number" ? y : parseInt(String(y), 10);
                        return !isNaN(year) && year >= 1990;
                      })
                    : data;
                  return (
                    <div key={c.id}> 
                      <ChartTrend
                        data={householdData}
                        xKey={c.xDimension}
                        seriesKey={c.seriesDimensions?.[0]}
                        showGrowth={c.id === "population-household-count" ? true : c.showGrowth}
                        title={c.title}
                        description={c.description}
                        excludeSeriesLabels={c.excludeSeriesLabels}
                        hideHeader
                        showRangeSlider={c.id === "population-household-count" ? false : undefined}
                        enableSlicers={c.id === "population-household-count" ? false : undefined}
                        controlledMetricMode={c.id === "population-household-count" ? householdMetricMode : undefined}
                        showLatestValue={c.id === "population-household-count"}
                        headerExtraInValueRow={c.id === "population-household-count"}
                        headerExtra={householdHeaderExtra}
                        chartHeight={"chartHeight" in c && typeof (c as { chartHeight?: number }).chartHeight === "number" ? (c as { chartHeight: number }).chartHeight : undefined}
                        gridTop={c.id === "population-household-count" ? 0 : undefined}
                        noHeaderMargin={c.id === "population-household-count"}
                        chartMarginTop={c.id === "population-household-count" ? 48 : undefined}
                      />
                    </div>
                  );
                });
              const hasRight = rightCharts.length > 0;
              return (
                <div key="population-two-col" className={hasRight ? "!grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:items-stretch" : "space-y-6"}>
                  <div className={hasRight ? "min-w-0 flex flex-col pr-3 sm:pr-6" : "space-y-6"}>
                    {twoColPyramid.leftLabel ? <h3 className="chart-section-title">{twoColPyramid.leftLabel}</h3> : null}
                    <div className="flex-1 flex flex-col justify-center">
                      {renderColumn(leftCharts)}
                    </div>
                  </div>
                  {hasRight && (
                    <div className="min-w-0 flex flex-col mt-6 sm:mt-0 pl-3 sm:pl-6" style={{ paddingLeft: "0px" }}>
                      {twoColPyramid.rightLabel ? (
                        <div className="mb-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <h3 className="chart-section-title min-w-0 w-full sm:w-auto">{twoColPyramid.rightLabel}</h3>
                            {rightCharts.some((c) => c.id === "population-household-count") && (
                              <div className="filter-btn-group">
                                <button type="button" onClick={() => setHouseholdMetricMode("value")} className={householdMetricMode === "value" ? "active" : ""}>Өрхийн тоо</button>
                                <button type="button" onClick={() => setHouseholdMetricMode("growth")} className={householdMetricMode === "growth" ? "active" : ""}>Өөрчлөлт %</button>
                              </div>
                            )}
                          </div>
                          <p className="mt-1 chart-section-label text-[var(--muted-foreground)]">Жил бүрийн өрхийн тоо бүс, аймгаар.</p>
                        </div>
                      ) : null}
                      <div className="flex-1 flex flex-col justify-center">
                        {renderColumn(rightCharts)}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            if (!chart.chartApiUrl || !chart.chartFixedQuery) return null;
            return (
              <div key={chart.id} className="min-w-0">
                <PopulationPyramidChart config={chart} />
              </div>
            );
          }
          if (chart.type === "bar") {
            const twoColBar = config.twoColumnLayout;
            if (twoColBar && (twoColBar.leftChartIds.includes(chart.id) || twoColBar.rightChartIds.includes(chart.id))) return null;
            const hasChartApi = !!chart.chartApiUrl;
            const metaForChart = hasChartApi ? metadataByChartId[chart.id] : metadata;
            const rowsForChart = hasChartApi ? (chartDataByChartId[chart.id] ?? []) : rows;
            if (hasChartApi && !metaForChart) return null;
            let barData: DataRow[] = rowsForChart;

            const matchByCodeOrLabel = (r: DataRow, dim: string, code: string, label?: string) => {
              const codeVal = r[`${dim}_code`];
              const labelVal = r[dim];
              if (codeVal === code || String(codeVal) === String(code)) return true;
              if (labelVal === code || String(labelVal) === String(code)) return true;
              if (label != null && (labelVal === label || String(labelVal) === String(label))) return true;
              return false;
            };
            const regionDim = chart.regionFilterDimension;
            const applyRegionFilter = config.id === "cpi" && (chart.id === "cpi-by-category" || chart.id === "cpi-detailed") && selectedLevel && selectedLevel !== "улс";
            if (regionDim && selectedBusCodes.length > 0 && applyRegionFilter && metaForChart) {
              const rVar = metaForChart.variables.find((v) => v.code === regionDim);
              barData = barData.filter((r) =>
                selectedBusCodes.some((code) => {
                  const idx = rVar?.values?.indexOf(code);
                  const label = idx != null && idx >= 0 ? rVar?.valueTexts?.[idx] : undefined;
                  return matchByCodeOrLabel(r, regionDim, code, label);
                })
              );
            }
            if (chart.filterToSingleValue && Object.keys(chart.filterToSingleValue).length > 0) {
              for (const [dim, val] of Object.entries(chart.filterToSingleValue))
                barData = barData.filter((r) => matchByCodeOrLabel(r, dim, val));
            }
            if (chart.filterToLatestDimension && metaForChart) {
              const dimCode = chart.filterToLatestDimension;
              const inData = [...new Set(barData.map((r) => r[`${dimCode}_code`] ?? r[dimCode]).filter(Boolean))];
              const latestInData =
                inData.length > 0
                  ? inData.sort((a, b) => {
                      const va = String(a);
                      const vb = String(b);
                      if (/^\d+$/.test(va) && /^\d+$/.test(vb)) return Number(vb) - Number(va);
                      return vb.localeCompare(va);
                    })[0]
                  : null;
              const latestCode = latestInData ?? getLatestDimensionValue(metaForChart, dimCode);
              if (latestCode != null)
                barData = barData.filter((r) => matchByCodeOrLabel(r, dimCode, String(latestCode)));
            }

            const yearDim = chart.yearSlicerDimension;
            if (yearDim) {
              const useGlobalUliral = config.id === "average-salary" && yearDim === "Улирал";
              const yearsInData = [...new Set(barData.map((r) => String(r[yearDim] ?? r[`${yearDim}_code`])).filter(Boolean))].sort((a, b) =>
                /^\d+$/.test(a) && /^\d+$/.test(b) ? Number(b) - Number(a) : a.localeCompare(b)
              );
              const selectedYear = useGlobalUliral && selections["Улирал"]?.length
                ? selections["Улирал"][0]
                : (yearsInData.length > 0 ? barChartYear[chart.id] ?? yearsInData[0] : undefined);
              if (selectedYear) barData = barData.filter((r) => String(r[yearDim] ?? r[`${yearDim}_code`]) === selectedYear);
            }

            const isCpiRegionChart = config.id === "cpi" && chart.id === "cpi-by-region";
            const isCpiCategoryChart = config.id === "cpi" && chart.id === "cpi-by-category";
            const nextChart = charts[chartIndex + 1];
            if (isCpiRegionChart) return null;

            if (isCpiCategoryChart && config.id === "cpi") {
              let categoryBarData: DataRow[] = rows;
              const catRegionDim = chart.regionFilterDimension;
              // Нийслэл: 012V1/003V4 хариу нь Бүс dimension-гүй, тул Бүс-ээр шүүхгүй (бүх мөр харуулна)
              const hasBusInData = catRegionDim && metadata?.variables?.some((v) => v.code === catRegionDim) && categoryBarData.some((r) => r[catRegionDim] != null || r[`${catRegionDim}_code`] != null);
              if (catRegionDim && selectedBusCodes.length > 0 && metadata && hasBusInData) {
                const rVar = metadata.variables.find((v) => v.code === catRegionDim);
                categoryBarData = categoryBarData.filter((r) =>
                  selectedBusCodes.some((code) => {
                    const idx = rVar?.values?.indexOf(code);
                    const regionLabel = idx != null && idx >= 0 ? rVar?.valueTexts?.[idx] : undefined;
                    return matchByCodeOrLabel(r, catRegionDim, code, regionLabel);
                  })
                );
              }
              if (chart.filterToLatestDimension && metadata) {
                const dimCode = chart.filterToLatestDimension;
                let latestCode: string | null = null;
                if (dimCode === "Сар" && cpiRangeYears?.length === 2) {
                  const trendRows = chartDataByChartId["cpi-trend"] ?? [];
                  const endYear = cpiRangeYears[1];
                  const monthsInRange = trendRows
                    .map((r) => String(r["Сар"] ?? r["Сар_code"] ?? ""))
                    .filter((m) => m.length >= 7 && m.slice(0, 4) <= endYear);
                  if (monthsInRange.length > 0) {
                    monthsInRange.sort((a, b) => a.localeCompare(b));
                    latestCode = monthsInRange[monthsInRange.length - 1];
                  }
                }
                if (latestCode == null) latestCode = getLatestDimensionValue(metadata, dimCode) ?? null;
                if (latestCode != null)
                  categoryBarData = categoryBarData.filter((r) =>
                    matchByCodeOrLabel(r, dimCode, String(latestCode))
                  );
              }
              const cpiChangeToggle = apiUrlByLevelMonthlyChange && (
                <div className="filter-btn-group flex rounded-full bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setCpiChangeMode("yearly")}
                    className={cpiChangeMode === "yearly" ? "active" : ""}
                  >
                    Жилийн өөрчлөлт
                  </button>
                  <button
                    type="button"
                    onClick={() => setCpiChangeMode("monthly")}
                    className={cpiChangeMode === "monthly" ? "active" : ""}
                  >
                    Сарын өөрчлөлт
                  </button>
                </div>
              );
              const cpiTrendData = chartDataByChartId["cpi-trend"] ?? [];
              const cpiSliderRange =
                availableCpiPeriods.length >= 1
                  ? (cpiRangeYears ?? (() => {
                      const last = availableCpiPeriods[availableCpiPeriods.length - 1];
                      const startIdx = availableCpiPeriods.findIndex((p) => p.slice(0, 4) >= "2024");
                      const start = startIdx >= 0 ? availableCpiPeriods[startIdx] : availableCpiPeriods[0];
                      return [start, last];
                    })())
                  : undefined;
              const cpiSliderReady = cpiTrendData.length > 0 && availableCpiPeriods.length >= 1;
              const periodLabelsCpi = availableCpiPeriods;
              const nCpiP = periodLabelsCpi.length;
              const cpiLoHi = (() => {
                if (!cpiSliderRange || nCpiP < 1) return { lo: 0, hi: 0 };
                let lo = periodLabelsCpi.indexOf(cpiSliderRange[0]);
                let hi = periodLabelsCpi.indexOf(cpiSliderRange[1]);
                if (lo < 0) lo = 0;
                if (hi < 0) hi = nCpiP - 1;
                if (lo > hi) return { lo: hi, hi: lo };
                return { lo, hi };
              })();
              const renderBar = (
                c: (typeof charts)[0],
                data: DataRow[],
                onClick?: (row: DataRow) => void,
                opts?: { highlightXValues?: string[]; accentXLabel?: string; reverseOrder?: boolean; afterTitle?: ReactNode; latestValueNode?: ReactNode; titleSuffix?: ReactNode }
              ) => (
                <ChartBar
                  key={c.id}
                  data={data}
                  xKey={c.xDimension}
                  seriesKey={c.seriesDimensions?.[0]}
                  title={c.title}
                  titleSuffix={opts?.titleSuffix}
                  description={c.description}
                  maxBars={c.xDimension === "Бүлэг" ? 14 : 30}
                  excludeSeriesLabels={c.excludeSeriesLabels}
                  excludeXLabels={c.excludeXLabels}
                  onBarClick={onClick}
                  highlightXValues={opts?.highlightXValues}
                  accentXLabel={opts?.accentXLabel}
                  reverseOrder={opts?.reverseOrder}
                  afterTitle={opts?.afterTitle}
                  latestValueNode={opts?.latestValueNode}
                />
              );
              const eronhiiIndexRow = categoryBarData.find(
                (r) => String(r["Бүлэг"] ?? r["Бүлэг_code"] ?? "") === "Ерөнхий индекс" || String(r["Бүлэг_code"] ?? "") === "0"
              );
              const eronhiiValue = eronhiiIndexRow ? Number(eronhiiIndexRow.value ?? 0) : null;
              const latestMonth = categoryBarData.length > 0 
                ? categoryBarData.map((r) => String(r["Сар"] ?? r["Сар_code"] ?? "")).filter(Boolean).sort().pop() 
                : null;
              const eronhiiValueNode = eronhiiValue != null ? (
                <div className="mt-2">
                  <span className="chart-section-value tabular-nums">{eronhiiValue.toLocaleString()}</span>
                  {latestMonth && <span className="ml-2 chart-section-label text-[var(--muted-foreground)]">({latestMonth})</span>}
                </div>
              ) : null;
              return (
                <div key="cpi-category-only" className="mt-4 space-y-2">
                  {renderBar(
                    { ...chart, title: (chart.title ?? "").toUpperCase() },
                    categoryBarData,
                    undefined,
                    {
                      accentXLabel: "Ерөнхий индекс",
                      reverseOrder: true,
                      titleSuffix: "(2023=100)",
                      afterTitle: cpiChangeToggle ?? undefined,
                      latestValueNode: eronhiiValueNode,
                    }
                  )}
                  <div className="mt-3 border-t border-[var(--card-border)] pt-3">
                    {cpiSliderReady && nCpiP > 1 ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setCpiRangePlaying((p) => !p)}
                          className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white p-0 text-slate-700 shadow-none transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, maxWidth: 36, maxHeight: 36 }}
                          title={cpiRangePlaying ? "Зогсоох" : "Автоматаар тоглуулах"}
                          aria-label={cpiRangePlaying ? "Зогсоох" : "Тоглуулах"}
                        >
                          {cpiRangePlaying ? (
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
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="min-w-[4.5rem] shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">
                            {periodLabelsCpi[cpiLoHi.lo] ?? ""}
                          </span>
                          <div className="min-w-0 flex-1">
                            <RangeSlider
                              min={0}
                              max={nCpiP - 1}
                              value={[cpiLoHi.lo, cpiLoHi.hi]}
                              onChange={([a, b]) => {
                                setCpiRangePlaying(false);
                                setCpiRangeYears([periodLabelsCpi[a]!, periodLabelsCpi[b]!]);
                              }}
                              labels={periodLabelsCpi}
                              showLabels={false}
                            />
                          </div>
                          <span className="min-w-[4.5rem] shrink-0 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                            {periodLabelsCpi[cpiLoHi.hi] ?? ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="py-2 chart-section-label text-[var(--muted-foreground)]">
                        Хугацааны интервал: өгөгдөл ачаалж байна…
                      </p>
                    )}
                  </div>
                </div>
              );
            }
            if (isCpiCategoryChart && !hasLevels) return null;

            const onBarClickAimag =
              isCpiRegionChart && config.id === "cpi"
                ? (row: DataRow) => {
                    let code: string | undefined =
                      row["Бүс_code"] != null ? String(row["Бүс_code"]) : row["Бүс"] != null ? String(row["Бүс"]) : undefined;
                    if (code == null && metadata) {
                      const busVar = metadata.variables.find((v) => v.code === "Бүс");
                      const label = row["Бүс"];
                      if (busVar?.valueTexts && label != null) {
                        const idx = busVar.valueTexts.indexOf(String(label));
                        if (idx >= 0 && busVar.values?.[idx] != null) code = String(busVar.values[idx]);
                      }
                    }
                    if (code != null) handleSelectionChange("Бүс", [code]);
                  }
                : undefined;

            const renderBar = (
              c: typeof chart,
              data: DataRow[],
              onClick?: (row: DataRow) => void,
              opts?: { highlightXValues?: string[]; accentXLabel?: string; reverseOrder?: boolean; afterTitle?: ReactNode }
            ) => (
              <ChartBar
                key={c.id}
                data={data}
                xKey={c.xDimension}
                seriesKey={c.seriesDimensions?.[0]}
                title={c.title}
                description={c.description}
                maxBars={c.xDimension === "Нас" ? 24 : c.xDimension === "Бүлэг" ? 14 : 30}
                excludeSeriesLabels={c.excludeSeriesLabels}
                excludeXLabels={c.excludeXLabels}
                onBarClick={onClick}
                highlightXValues={opts?.highlightXValues}
                accentXLabel={opts?.accentXLabel}
                reverseOrder={opts?.reverseOrder}
                afterTitle={opts?.afterTitle}
              />
            );

            const cpiToggleBlock =
              config.id === "cpi" && apiUrlByLevelMonthlyChange && chart.id !== "cpi-detailed" ? (
                <div className="mb-2 flex justify-end">
                  <div className="filter-btn-group flex rounded-full bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setCpiChangeMode("yearly")}
                      className={cpiChangeMode === "yearly" ? "active" : ""}
                    >
                      Жилийн өөрчлөлт
                    </button>
                    <button
                      type="button"
                      onClick={() => setCpiChangeMode("monthly")}
                      className={cpiChangeMode === "monthly" ? "active" : ""}
                    >
                      Сарын өөрчлөлт
                    </button>
                  </div>
                </div>
              ) : null;

            return (
              <div key={chart.id} className={config.id === "cpi" ? "mt-4 space-y-2" : "space-y-2"}>
                {cpiToggleBlock}
                {renderBar(chart, barData, onBarClickAimag, {
                  highlightXValues:
                    isCpiRegionChart && selectedBusCodes.length > 0 ? selectedBusCodes : undefined,
                  accentXLabel: isCpiCategoryChart ? "Ерөнхий индекс" : undefined,
                  reverseOrder: isCpiCategoryChart,
                })}
              </div>
            );
          }
          return null;
        })}
          </div>
        </>
      )}

      {!loading && dataset && rows.length === 0 && (
        <p className="text-content text-[var(--muted-foreground)]">Сонголтоор өгөгдөл олдсонгүй.</p>
      )}

      {/* Дундаж наслалтын газрын зураг - population dashboard */}
      {lifeExpectancyMapApiUrl && config.id === "population" && (
        <div className="!grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:items-start mt-4">
          {/* Зүүн тал - Area chart */}
          <div className="min-w-0">
            <h3 className="chart-section-title">Дундаж наслалт</h3>
            <p className="chart-section-label text-[var(--muted-foreground)] mt-0.5 mb-2">Дундаж наслалт нь шинээр төрсөн хүүхдийн эрүүл мэнд, амьдрах нөхцөл нь цаашид хэвээр хадгалагдана гэж үзвэл түүний үргэлжлэн амьдрах жилээр тооцсон дундаж хугацааг хэлнэ.</p>
            {lifeExpectancyNationalAvg != null && (
              <div className="flex items-baseline gap-2 mb-3">
                <span className="chart-section-label text-[var(--muted-foreground)]">Улсын дундаж:</span>
                <span className="chart-section-value tabular-nums">
                  {lifeExpectancyNationalAvg.toFixed(1)}
                </span>
                {lifeExpectancyMapYear && (
                  <span className="chart-section-label text-[var(--muted-foreground)]">({lifeExpectancyMapYear})</span>
                )}
              </div>
            )}
            {(() => {
              const trendChart = charts.find((c) => c.id === "population-life-expectancy-trend");
              const trendRows = trendChart ? chartDataByChartId[trendChart.id] ?? [] : [];
              if (!trendChart || trendRows.length === 0) return null;
              return (
                <ChartTrend
                  data={trendRows}
                  xKey="Он"
                  title=""
                  hideHeader
                  showRangeSlider={false}
                  chartHeight={280}
                  showLatestValue={false}
                  yAxisMin={40}
                  yAxisMax={80}
                />
              );
            })()}
          </div>
          {/* Баруун тал - Map */}
          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
              <div className="min-w-0 w-full sm:w-auto">
                <h3 className="chart-section-title">Дундаж наслалт, аймгаар</h3>
                <p className="text-xs text-slate-500 mt-0">Аймаг тус бүрийн дундаж наслалт.</p>
              </div>
              {lifeExpectancyMapYears.length > 0 && (
                <Select
                  value={lifeExpectancyMapYear}
                  onChange={(v) => setLifeExpectancyMapYear(v)}
                  options={lifeExpectancyMapYears.map((label) => ({ value: label, label }))}
                  style={{ width: 100, minWidth: 100 }}
                  size="small"
                  getPopupContainer={(n) => n?.parentElement ?? (typeof document !== "undefined" ? document.body : null)}
                />
              )}
            </div>
            {lifeExpectancyMapLoading ? (
              <div className="flex items-center justify-center py-3 text-[var(--muted-foreground)]">Ачааллаж байна...</div>
            ) : (
              <div className="mt-4 sm:mt-6">
                <MongoliaChoroplethMap
                  key={`life-exp-map-${lifeExpectancyMapYear ?? "y"}`}
                  title=""
                  data={lifeExpectancyMapData}
                  subtextOnly
                  useSoumLevel={false}
                  enableDrillDown={false}
                  dataLabel="Дундаж наслалт"
                  useSimpleAimagMap
                  layoutSize="135%"
                  layoutCenter={["50%", "50%"]}
                  height={360}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Гэрлэлт, Цуцлалт charts - map-н доор */}
      {config.id === "population" && (() => {
        const marriageChart = charts.find((c) => c.id === "population-marriage-divorce");
        const divorceChart = charts.find((c) => c.id === "population-marriage-divorce-per-1000");
        if (!marriageChart || !divorceChart) return null;
        const meta1 = metadataByChartId[marriageChart.id];
        const rows1 = chartDataByChartId[marriageChart.id] ?? [];
        const meta2 = metadataByChartId[divorceChart.id];
        const rows2 = chartDataByChartId[divorceChart.id] ?? [];
        if (!meta1 || !meta2) return null;
        
        return (
          <div key="population-marriage-pair" className="!grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 sm:items-stretch mt-6">
            <div className="min-w-0">
              <h3 className="chart-section-title mb-2">Гэрлэлт, цуцлалт</h3>
              <ChartTrend
                data={rows1}
                xKey="Он"
                seriesKey="Гэрлэлтийн байдал"
                title=""
                hideHeader={true}
                showLatestValueBySeries={true}
                showRangeSlider={false}
                rangeYears={sharedRangeYears ?? undefined}
                onRangeYearsChange={(s, e) => setSharedRangeYears([s, e])}
              />
            </div>
            <div className="min-w-0">
              <h3 className="chart-section-title mb-2">Гэрлэлт, цуцлалт — 1000 хүнд ногдох</h3>
              <ChartTrend
                data={rows2}
                xKey="Он"
                seriesKey="Гэр бүлийн байдал"
                title=""
                hideHeader={true}
                showLatestValueBySeries={true}
                showRangeSlider={false}
                rangeYears={sharedRangeYears ?? undefined}
                onRangeYearsChange={(s, e) => setSharedRangeYears([s, e])}
              />
            </div>
          </div>
        );
      })()}

      {mapApiUrl && config.id !== "population" && (
        <section className="space-y-3 -mt-1">
          <h3 className="chart-section-title">{config.id === "livestock" ? "МАЛЫН ТОО" : "Хүн амын тоо"}</h3>
          <div className="flex flex-wrap items-center gap-4">
            {mapYears.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="chart-section-label uppercase tracking-wide text-[var(--muted-foreground)]">Он</span>
                <Select
                  value={effectiveMapYear}
                  onChange={(v) => setSelectedMapYearLocal(v)}
                  options={mapYears.map((label) => ({ value: label, label }))}
                  style={{ width: 120, minWidth: 120 }}
                  size="small"
                  getPopupContainer={(n) => n?.parentElement ?? (typeof document !== "undefined" ? document.body : null)}
                />
              </div>
            )}
          </div>
          <div className="w-full -mt-12">
            <MongoliaChoroplethMap
              title=""
              data={mapData}
              subtextOnly
              useSoumLevel={mapLevel === "soum"}
              enableDrillDown={mapLevel === "soum"}
            />
          </div>
        </section>
      )}

    </div>
  );
}
