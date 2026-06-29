"use client";

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Select, Spin } from "antd";
import { getPxMetadata, getPxData, buildQuery } from "@/lib/socio-dashboard/px-api";
import { jsonStatToRows } from "@/lib/socio-dashboard/parse-json-stat";
import type { PxMetadata, PxVariable, DataRow } from "@/lib/socio-dashboard/types";
import { MongoliaChoroplethMap } from "@/components/socio-dashboard/MongoliaChoroplethMap";
import { SocioDashboardBackNav } from "@/components/socio-dashboard/SocioDashboardBackNav";
import { AIMAG_NAME_TO_ACODE } from "@/lib/toirog";
import type { MapDataItem } from "@/components/socio-dashboard/MongoliaChoroplethMap";

const TABLE_ORDER = ["067", "006", "022", "031", "025", "1002", "2600011", "0500021"] as const;

const TABLE_CONFIG: Record<
  string,
  { url: string; label: string; aimagOnly?: boolean; quarterQ4Only?: boolean; sectorGdpOnly?: boolean }
> = {
  "067": {
    url: "https://data.1212.mn/api/v1/mn/NSO/Population, household/1_Population, household/DT_NSO_0300_067V2.px",
    label: "МОНГОЛ УЛСАД ОРШИН СУУГАА ХҮН АМЫН ТОО",
  },
  "006": {
    url: "https://data.1212.mn/api/v1/mn/NSO/Population, household/1_Population, household/DT_NSO_0300_006V2.px",
    label: "ӨРХИЙН ТОО",
  },
  "022": {
    url: "https://data.1212.mn/api/v1/mn/NSO/Population, household/3_Herdsmen/DT_NSO_1001_022V1.px",
    label: "МАЛЧДЫН ТОО",
  },
  "031": {
    url: "https://data.1212.mn/api/v1/mn/NSO/Population, household/3_Herdsmen/DT_NSO_1001_022V4.px",
    label: "МАЛТАЙ ӨРХИЙН ТОО",
  },
  "025": {
    url: "https://data.1212.mn/api/v1/mn/NSO/Population, household/3_Herdsmen/DT_NSO_1001_025V1.px",
    label: "МАЛЧИН ӨРХИЙН ТОО",
  },
  "1002": {
    url: "https://data.1212.mn/api/v1/mn/NSO/Industry, service/Agriculture/DT_NSO_1002_001V3.px",
    label: "ТАРИАЛАН ЭРХЭЛДЭГ ӨРХИЙН ТОО",
    aimagOnly: true,
  },
  "2600011": {
    url: "https://data.1212.mn/api/v1/mn/NSO/Labour, business/Statistical Business Register/DT_NSO_2600_011V1.px",
    label: "ҮЙЛ АЖИЛЛАГАА ЯВУУЛЖ БУЙ ААНБ-ЫН ТОО",
    quarterQ4Only: true,
  },
  "0500021": {
    url: "https://data.1212.mn/api/v1/mn/NSO/Economy, environment/National Accounts/DT_NSO_0500_021V2.px",
    label: "ДОТООДЫН НИЙТ БҮТЭЭГДЭХҮҮН",
    aimagOnly: true,
    sectorGdpOnly: true,
  },
};

function findVar(meta: PxMetadata, codes: string[]): PxVariable | undefined {
  return meta.variables.find((v) => codes.some((c) => v.code === c || v.text?.includes(c)));
}

function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** API-ийн насны бүлгийн label → 0-19 | 20-54 | 55+ */
function getAgeBucket(label: string): "0-19" | "20-54" | "55+" | null {
  const s = String(label ?? "").trim();
  if (/^бүгд$/i.test(s)) return null;
  if (/^(0-4|5-9|10-14|15-19)$/i.test(s)) return "0-19";
  if (/^(20-24|25-29|30-34|35-39|40-44|45-49|50-54)$/i.test(s)) return "20-54";
  if (/^(55-59|60-64|65-69|70\+?|70\s*ба\s*түүнээс\s*дээш)/i.test(s)) return "55+";
  return null;
}

/** API-ийн Малтай өрх label → 5 бүлэг: 200 хүртэлх | 201-500 | 501-1000 | 1000+ */
function getMaltaiorhBucket(label: string): "200 хүртэлх" | "201-500" | "501-1000" | "1000+" | null {
  const s = String(label ?? "").trim().toLowerCase();
  if (/^бүгд$/i.test(s)) return null;
  if (/11\s*хүртэл|11-30|31-50|51-100|101-200/i.test(s)) return "200 хүртэлх";
  if (/201-500/i.test(s)) return "201-500";
  if (/501-999/i.test(s)) return "501-1000";
  if (/1000-1499|1500-2000|2001/i.test(s)) return "1000+";
  return null;
}

/** Бүс-ийн дүн/тойргийн нэгтгэл — аймагтай холихгүй */
function isBusRegionTotal(label: string): boolean {
  const s = String(label ?? "").trim();
  return s === "Улсын дүн" || /бүс\s*$/i.test(s);
}

/** Бүс-ийн сум түвшний мөр (Аймаг - Сум формат) — аймгийн жагсаалтад холихгүй */
function isBusSumLevel(label: string): boolean {
  return /\s+[-–]\s+/.test(String(label ?? "").trim());
}

/** Зөвхөн 3 оронтой (аймаг) эсвэл 5 оронтой (сум) код ашиглах */
function isAimagOrSumCode(code: string): boolean {
  const c = String(code ?? "").trim();
  return c.length === 3 || c.length === 5;
}

function normalizeAimagName(name: string): string {
  return String(name ?? "")
    .trim()
    .replace(/\s+аймаг\s*$/i, "")
    .replace(/\s+хот\s*$/i, "")
    .replace(/\s+нийслэл\s*$/i, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function PopulationByRegionContent() {
  const routeParams = useParams();
  const lng = typeof routeParams?.lng === "string" ? routeParams.lng : "mn";
  const searchParams = useSearchParams();
  const tableFromUrl = searchParams.get("table");
  const initialTable = useMemo(() => {
    const t = String(tableFromUrl ?? "").trim();
    return t && t in TABLE_CONFIG ? t : "067";
  }, [tableFromUrl]);

  const [metadata, setMetadata] = useState<PxMetadata | null>(null);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTable, setSelectedTable] = useState<string>(initialTable);
  const prevTableFromUrl = useRef(tableFromUrl);
  useEffect(() => {
    if (tableFromUrl && tableFromUrl !== prevTableFromUrl.current && tableFromUrl in TABLE_CONFIG) {
      prevTableFromUrl.current = tableFromUrl;
      setSelectedTable(tableFromUrl);
    }
  }, [tableFromUrl]);
  const [selectedAimag, setSelectedAimag] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [nameSort, setNameSort] = useState<"asc" | "desc" | null>(null);
  const fetchIdRef = useRef(0);
  const [mapHeight, setMapHeight] = useState(500);
  useEffect(() => {
    const fn = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      setMapHeight(w < 640 ? 300 : w < 1024 ? 420 : 540);
    };
    fn();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", fn);
      return () => window.removeEventListener("resize", fn);
    }
  }, []);

  const busVar = metadata ? findVar(metadata, ["Бүс", "Бүс"]) : undefined;
  const ageVar = metadata ? findVar(metadata, ["Насны бүлэг", "Насны бүлэг"]) : undefined;
  const maltaiorhVar = selectedTable === "031" && metadata ? findVar(metadata, ["Малтай өрх"]) : undefined;
  const yearVar = metadata ? findVar(metadata, ["Он", "ОН", "Он"]) : undefined;
  const quarterVar = metadata ? findVar(metadata, ["Улирал"]) : undefined;
  const sectorVar = metadata ? findVar(metadata, ["Эдийн засгийн салбар"]) : undefined;
  const useQuarterQ4Only = TABLE_CONFIG[selectedTable]?.quarterQ4Only ?? false;
  const sectorGdpOnly = TABLE_CONFIG[selectedTable]?.sectorGdpOnly ?? false;

  /** Аймгийн код (3 орон) → аймгийн нэр (metadata label-ээс авна) */
  const aimagCodeToName = useMemo(() => {
    const map = new Map<string, string>();
    if (!busVar?.values?.length) return map;
    busVar.values.forEach((rawCode, i) => {
      const code = String(rawCode ?? "").trim();
      if (code.length !== 3) return;
      if (code === "0" || code === "1") return; // Улсын дүн / Бүсийн дүн
      const label = String(busVar.valueTexts?.[i] ?? code).trim();
      if (!label || isBusRegionTotal(label)) return;
      map.set(code, label);
    });
    return map;
  }, [busVar]);

  /** Зөвхөн 3 оронтой (аймаг) кодууд */
  const aimagCodes = useMemo(() => Array.from(aimagCodeToName.keys()), [aimagCodeToName]);

  /** Аймаг нэр → тухайн аймгийн сумын Бүс кодууд (эхний 3 орон = аймгийн код) */
  const aimagToSumCodes = useMemo(() => {
    if (!busVar?.values?.length) return new Map<string, string[]>();
    const map = new Map<string, string[]>();

    // Сумын түвшин: 5 оронтой код (18101 гэх мэт) → aimagCode = 181
    busVar.values.forEach((rawCode) => {
      const code = String(rawCode ?? "").trim();
      if (code.length !== 5) return;
      const aimagCode = code.slice(0, 3);
      const aimagName = aimagCodeToName.get(aimagCode);
      if (!aimagName) return;
      const key = normalizeAimagName(aimagName);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(code);
    });

    return map;
  }, [busVar, aimagCodeToName]);

  const tableOptions = useMemo(
    () => TABLE_ORDER.filter((v) => v in TABLE_CONFIG).map((value) => ({ value, label: TABLE_CONFIG[value].label })),
    []
  );

  const apiUrl = TABLE_CONFIG[selectedTable]?.url ?? TABLE_CONFIG["067"].url;
  const useAimagOnly = TABLE_CONFIG[selectedTable]?.aimagOnly ?? false;

  const aimagOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: "all", label: "Бүгд" }];
    Object.keys(AIMAG_NAME_TO_ACODE).forEach((n) => opts.push({ value: n, label: n }));
    return opts;
  }, []);

  /** Q4 улирлын label → жил; IV, 4-р, Q4 гэх мэт */
  const quarterQ4YearOptions = useMemo(() => {
    if (!useQuarterQ4Only || !quarterVar?.values?.length) return [];
    const byYear = new Map<string, { value: string; label: string; yearNum: number }>();
    quarterVar.values.forEach((code, i) => {
      const label = (quarterVar.valueTexts?.[i] ?? String(code)).trim();
      const isQ4ByLabel = /\b(IV|4-р|4р|Q4)\b/i.test(label) || /20\d{2}\s*IV\b/i.test(label) || /\bIV\s*$/.test(label) || (label.length <= 6 && /4$/.test(label));
      const isQ4ByIndex = quarterVar.values!.length > 4 && (i % 4) === 3;
      if (isQ4ByLabel || isQ4ByIndex) {
        const m = label.match(/20\d{2}/);
        const year = m ? m[0] : String(code);
        const yearNum = parseInt(year, 10);
        if (!Number.isFinite(yearNum)) return;
        // Нэг жил дээр Q4 давхардаж ирвэл хамгийн сүүлд тааралдсан code-г хадгална
        byYear.set(year, { value: String(code), label: year, yearNum });
      }
    });
    // Ихээс бага (сүүлийн он хамгийн дээр)
    const opts = Array.from(byYear.values()).sort((a, b) => b.yearNum - a.yearNum);
    if (opts.length > 0) return opts.map(({ value, label }) => ({ value, label }));
    // fallback
    return quarterVar.values!.map((code, i) => ({
      value: String(code),
      label: String(quarterVar.valueTexts?.[i] ?? code),
    }));
  }, [useQuarterQ4Only, quarterVar]);

  const yearOptions = useMemo(() => {
    if (useQuarterQ4Only) return quarterQ4YearOptions;
    const opts: { value: string; label: string }[] = [];
    if (yearVar?.values?.length) {
      yearVar.values.forEach((code, i) => {
        const label = yearVar.valueTexts?.[i] ?? code;
        opts.push({ value: code, label: String(label) });
      });
    }
    if (opts.length === 0) opts.push({ value: "2024", label: "2024" });
    return opts;
  }, [yearVar, useQuarterQ4Only, quarterQ4YearOptions]);

  const busCodesForFetch = useMemo(() => {
    if (useAimagOnly) return aimagCodes;
    if (selectedTable === "0500021") return aimagCodes;
    if (selectedAimag === "all") return aimagCodes;
    const sumCodes = aimagToSumCodes.get(normalizeAimagName(selectedAimag));
    return sumCodes && sumCodes.length > 0 ? sumCodes : aimagCodes;
  }, [useAimagOnly, selectedTable, selectedAimag, aimagCodes, aimagToSumCodes]);

  const fetchData = useCallback(async () => {
    if (!metadata || busCodesForFetch.length === 0) return;
    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const makeSelections = (yearCodeOverride?: string) => {
        const selections: Record<string, string[]> = {};
        metadata.variables.forEach((v) => {
          if (v.code === busVar?.code) {
            selections[v.code] = busCodesForFetch;
          } else if (v.code === yearVar?.code && !useQuarterQ4Only) {
            const lastYearCode = (() => {
              if (!yearVar?.values?.length) return "2024";
              const texts = (yearVar.valueTexts ?? yearVar.values.map(String)) as string[];
              const years = texts.map((t) => parseInt(String(t).match(/\d{4}/)?.[0] ?? "0", 10)).filter((y) => y > 1900 && y < 2100);
              const maxYear = years.length > 0 ? Math.max(...years) : NaN;
              const idx = !Number.isNaN(maxYear) ? texts.findIndex((t) => String(t).includes(String(maxYear))) : -1;
              return idx >= 0 ? (yearVar.values?.[idx] ?? yearVar.values[0]) : yearVar.values[yearVar.values.length - 1];
            })();
            const yearVal =
              yearCodeOverride ??
              (selectedYear && yearVar?.values?.includes(selectedYear) ? selectedYear : lastYearCode);
            selections[v.code] = [yearVal];
        } else if (v.code === quarterVar?.code && useQuarterQ4Only) {
          selections[v.code] = selectedYear && quarterVar?.values?.includes(selectedYear) ? [selectedYear] : (quarterQ4YearOptions.length > 0 ? [quarterQ4YearOptions[quarterQ4YearOptions.length - 1].value] : quarterVar?.values?.slice(-1) ?? []);
        } else if (v.code === ageVar?.code) {
          selections[v.code] = ageVar?.values ?? [];
        } else if (v.code === maltaiorhVar?.code) {
          selections[v.code] = maltaiorhVar.values ?? [];
        } else if (["Байршил", "Үзүүлэлт", "Нийт"].includes(v.code)) {
          selections[v.code] = v.values?.length ? [v.values[0]] : [];
        } else if (v.code === "Үйл ажиллагааны эрхлэлтийн байдал") {
          selections[v.code] = ["1"];
        } else if (v.code === sectorVar?.code && sectorGdpOnly) {
          selections[v.code] = ["0"];
        } else if (v.code === "Малын төрөл") {
          selections[v.code] = ["0"];
        } else {
          selections[v.code] = v.values ?? [];
        }
      });
        return selections;
      };

      const tryFetch = async (yearCodeOverride?: string) => {
        const body = buildQuery(metadata, makeSelections(yearCodeOverride));
        const dataset = await getPxData(apiUrl, body);
        const parsed = jsonStatToRows(dataset);
        return parsed;
      };

      let parsed = await tryFetch();
      if (id !== fetchIdRef.current) return;

      // Зарим хүснэгтүүд (жишээ: Малчин өрхийн тоо) дээр хамгийн сүүлийн онд сумын түвшний утга хоосон байж болно.
      // Аймаг сонгосон үед сумын түвшинд өгөгдөлгүй бол өмнөх он руу автоматаар ухарч харуулна.
      const shouldFallbackYear =
        !useAimagOnly &&
        selectedAimag !== "all" &&
        (selectedTable === "025" || selectedTable === "031");
      if (shouldFallbackYear && yearVar?.values?.length) {
        const busCodeKey = busVar?.code ? `${busVar.code}_code` : "Бүс_code";
        const hasSoumValue = parsed.some((r) => {
          const c = String((r as Record<string, unknown>)[busCodeKey] ?? "").trim();
          const v = (r as { value?: unknown }).value;
          return c.length === 5 && v != null && Number.isFinite(Number(v)) && Number(v) !== 0;
        });
        if (!hasSoumValue) {
          const curIdx = yearVar.values.indexOf(selectedYear);
          const startIdx = curIdx >= 0 ? curIdx : 0;
          const maxTries = 6;
          for (let i = startIdx + 1; i < Math.min(yearVar.values.length, startIdx + 1 + maxTries); i++) {
            const yCode = String(yearVar.values[i]);
            const alt = await tryFetch(yCode);
            if (id !== fetchIdRef.current) return;
            const ok = alt.some((r) => {
              const c = String((r as Record<string, unknown>)[busCodeKey] ?? "").trim();
              const v = (r as { value?: unknown }).value;
              return c.length === 5 && v != null && Number.isFinite(Number(v)) && Number(v) !== 0;
            });
            if (ok) {
              parsed = alt;
              setSelectedYear(yCode);
              break;
            }
          }
        }
      }

      setRows(parsed);
    } catch (err) {
      if (id !== fetchIdRef.current) return;
      setError(err instanceof Error ? err.message : "Уучлаарай алдаа гарлаа.");
      setRows([]);
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [metadata, busCodesForFetch, selectedYear, busVar, yearVar, quarterVar, useQuarterQ4Only, quarterQ4YearOptions, sectorVar, sectorGdpOnly, ageVar, maltaiorhVar, apiUrl]);

  useEffect(() => {
    if (useAimagOnly) setSelectedAimag("all");
  }, [useAimagOnly]);

  useEffect(() => {
    let cancelled = false;
    setMetadata(null);
    setRows([]);
    getPxMetadata(apiUrl)
      .then((meta) => {
        if (!cancelled) {
          setMetadata(meta);
          const tableId = Object.entries(TABLE_CONFIG).find(([, c]) => c.url === apiUrl)?.[0];
          const cfg = tableId ? TABLE_CONFIG[tableId] : undefined;
          if (cfg?.quarterQ4Only) {
            const qv = findVar(meta, ["Улирал"]);
            if (qv?.values?.length) {
              const texts = (qv.valueTexts ?? qv.values.map(String)) as string[];
              const parseYear = (s: string) => {
                const m = String(s ?? "").match(/20\d{2}/);
                return m ? parseInt(m[0], 10) : NaN;
              };
              const isQ4 = (label: string, idx: number) =>
                /\b(IV|4-р|4р|Q4)\b/i.test(label) ||
                /20\d{2}\s*IV\b/i.test(label) ||
                /\bIV\s*$/.test(label) ||
                (label.length <= 6 && /4$/.test(label)) ||
                (qv.values!.length > 4 && (idx % 4) === 3);

              // Жил бүрийн Q4-г 1 болгож unique болгоод, хамгийн сүүлийн жилийг сонгоно
              const byYear = new Map<number, { code: string; idx: number }>();
              qv.values.forEach((rawCode, i) => {
                const label = String(texts[i] ?? rawCode).trim();
                if (!isQ4(label, i)) return;
                const y = parseYear(label);
                if (!Number.isFinite(y)) return;
                byYear.set(y, { code: String(rawCode), idx: i });
              });
              const years = Array.from(byYear.keys()).sort((a, b) => b - a);
              const pick = years.length > 0 ? byYear.get(years[0])!.code : String(qv.values[qv.values.length - 1]);
              setSelectedYear(pick);
            }
          } else {
            const yv = findVar(meta, ["Он", "ОН", "Он"]);
            if (yv?.values?.length) {
              const texts = (yv.valueTexts ?? yv.values.map(String)) as string[];
              const years = texts.map((t) => parseInt(String(t).match(/\d{4}/)?.[0] ?? "0", 10)).filter((y) => y > 1900 && y < 2100);
              const maxYear = years.length > 0 ? Math.max(...years) : NaN;
              const idx = maxYear ? texts.findIndex((t) => String(t).includes(String(maxYear))) : -1;
              const code = idx >= 0 ? yv.values?.[idx] : yv.values?.[0];
              setSelectedYear(code ?? yv.values[yv.values.length - 1] ?? "2024");
            }
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Уучлаарай алдаа гарлаа.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  useEffect(() => {
    if (metadata && busCodesForFetch.length > 0) {
      fetchDataRef.current();
    } else if (metadata && busCodesForFetch.length === 0) {
      setRows([]);
      setLoading(false);
    }
  }, [metadata, busCodesForFetch.length > 0 ? busCodesForFetch.join(",") : "", selectedYear]);

  type AgeGroups = { "0-19": number; "20-54": number; "55+": number };
  type MaltaiorhGroups = { "200 хүртэлх": number; "201-500": number; "501-1000": number; "1000+": number };
  const emptyAgeGroups = (): AgeGroups => ({ "0-19": 0, "20-54": 0, "55+": 0 });
  const emptyMaltaiorhGroups = (): MaltaiorhGroups => ({ "200 хүртэлх": 0, "201-500": 0, "501-1000": 0, "1000+": 0 });

  const valueMultiplier = selectedTable === "031" || selectedTable === "025" ? 1000 : 1;

  const filteredAndAggregated = useMemo(() => {
    const busCode = busVar?.code;
    const busLabelKey = busCode ?? "Бүс";
    const busCodeKey = busCode ? `${busCode}_code` : "Бүс_code";
    const ageKey = ageVar?.code ?? "Насны бүлэг";
    const maltaiorhKey = maltaiorhVar?.code ?? "Малтай өрх";
    const useMaltaiorh = !!maltaiorhVar;
    const empty = {
      byAimag: [] as { name: string; value: number; ageGroups?: AgeGroups; maltaiorhGroups?: MaltaiorhGroups }[],
      byToirog: [] as { name: string; value: number }[],
      bySum: [] as { name: string; value: number; ageGroups?: AgeGroups; maltaiorhGroups?: MaltaiorhGroups }[],
    };
    if (!busCode || rows.length === 0) return empty;

    /** Зөвхөн 3/5 оронтой кодтой мөрүүдийг ашиглах; aimagOnly/0500021 үед зөвхөн 3 орон */
    const codeLen = useAimagOnly || selectedAimag === "all" || selectedTable === "0500021" ? 3 : 5;
    const rowsByCode = rows.filter((r) => {
      const c = String((r as Record<string, unknown>)[busCodeKey] ?? "").trim();
      return c.length === codeLen;
    });

    const aggregateWithAge = (
      rrows: DataRow[],
      getName: (r: DataRow) => string,
      skipRegionTotals = true,
      getCode?: (r: DataRow) => string | undefined
    ) => {
      const map = new Map<string, { value: number; ageGroups: AgeGroups; code?: string }>();
      for (const r of rrows) {
        const busCodeVal = String((r as Record<string, unknown>)[busCodeKey] ?? "").trim();
        if (!isAimagOrSumCode(busCodeVal)) continue;
        const busLabel = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
        if (skipRegionTotals && isBusRegionTotal(busLabel)) continue;
        const ageLabel = ageVar ? String((r as Record<string, unknown>)[ageKey] ?? "").trim() : "";
        if (ageVar && /^бүгд$/i.test(ageLabel)) continue;
        const key = getName(r);
        if (!key) continue;
        const v = (Number((r as { value?: number }).value ?? 0) || 0) * valueMultiplier;
        const bucket = getAgeBucket(ageLabel);
        let entry = map.get(key);
        if (!entry) {
          entry = { value: 0, ageGroups: emptyAgeGroups(), code: getCode?.(r) ?? busCodeVal };
          map.set(key, entry);
        } else if (getCode && !entry.code) {
          entry.code = getCode(r) ?? busCodeVal;
        }
        entry.value += v;
        if (bucket) entry.ageGroups[bucket] += v;
      }
      return Array.from(map.entries())
        .map(([name, { value, ageGroups, code }]) => ({ name, value, ageGroups, code }))
        .filter((x) => x.name && x.value > 0);
    };

    const aggregateWithMaltaiorh = (rrows: DataRow[], getName: (r: DataRow) => string) => {
      const map = new Map<string, { value: number; maltaiorhGroups: MaltaiorhGroups }>();
      for (const r of rrows) {
        const busCodeVal = String((r as Record<string, unknown>)[busCodeKey] ?? "").trim();
        if (!isAimagOrSumCode(busCodeVal)) continue;
        const busLabel = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
        if (isBusRegionTotal(busLabel)) continue;
        const maltaiorhLabel = String((r as Record<string, unknown>)[maltaiorhKey] ?? "").trim();
        if (/^бүгд$/i.test(maltaiorhLabel)) continue;
        const key = getName(r);
        if (!key) continue;
        const v = (Number((r as { value?: number }).value ?? 0) || 0) * valueMultiplier;
        const bucket = getMaltaiorhBucket(maltaiorhLabel);
        let entry = map.get(key);
        if (!entry) {
          entry = { value: 0, maltaiorhGroups: emptyMaltaiorhGroups() };
          map.set(key, entry);
        }
        entry.value += v;
        if (bucket) entry.maltaiorhGroups[bucket] += v;
      }
      return Array.from(map.entries())
        .map(([name, { value, maltaiorhGroups }]) => ({
          name,
          value,
          maltaiorhGroups,
        }))
        .filter((x) => x.name && x.value > 0);
    };

    // Аймаг сонгосон үед (сумтай үзүүлэлтэд): зөвхөн 5 оронтой (сумын) мөрөөр агрегат
    if (!useAimagOnly && selectedAimag !== "all") {
      const bySum = aggregateWithAge(rowsByCode, (r) => {
        const full = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
        const dashIdx = full.search(/\s[-–]\s/);
        const afterDash = dashIdx >= 0 ? full.slice(dashIdx).replace(/^\s*[-–]\s*/, "").trim() : full;
        return afterDash.replace(/\s+сум\s*$/i, "").trim();
      }, true, (r) => String((r as Record<string, unknown>)[busCodeKey] ?? "").trim());
      return { ...empty, bySum };
    }

    // Аймаг сонгоогүй үед: зөвхөн 3 оронтой (аймгийн) мөрөөр агрегат
    const aimagOnlyRows = rowsByCode.filter(
      (r) => !isBusSumLevel(String((r as Record<string, unknown>)[busLabelKey] ?? ""))
    );
    const aimagList = useMaltaiorh
      ? aggregateWithMaltaiorh(aimagOnlyRows, (r) => {
          const label = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
          return label.replace(/\s+аймаг\s*$/i, "").replace(/\s+хот\s*$/i, "");
        })
      : aggregateWithAge(aimagOnlyRows, (r) => {
          const label = String((r as Record<string, unknown>)[busLabelKey] ?? "").trim();
          return label.replace(/\s+аймаг\s*$/i, "").replace(/\s+хот\s*$/i, "");
        });

    return { byAimag: aimagList, byToirog: [], bySum: [] as { name: string; value: number; ageGroups?: AgeGroups; maltaiorhGroups?: MaltaiorhGroups }[] };
  }, [rows, selectedAimag, useAimagOnly, selectedTable, busVar?.code, ageVar?.code, maltaiorhVar?.code, valueMultiplier]);

  const rankingItems = useMemo(() => {
    const useSum = !useAimagOnly && selectedAimag !== "all" && selectedTable !== "0500021";
    const items = useSum ? filteredAndAggregated.bySum : filteredAndAggregated.byAimag;
    const sorted = nameSort === "asc"
      ? [...items].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "mn"))
      : nameSort === "desc"
        ? [...items].sort((a, b) => (b.name ?? "").localeCompare(a.name ?? "", "mn"))
        : [...items].sort((a, b) => b.value - a.value);
    return sorted.map((x, i) => ({ rank: i + 1, name: x.name, value: x.value }));
  }, [filteredAndAggregated, selectedAimag, useAimagOnly, selectedTable, nameSort]);

  const mapData: MapDataItem[] = useMemo(() => {
    if (!useAimagOnly && selectedAimag !== "all" && selectedTable !== "0500021") {
      return filteredAndAggregated.bySum.map((x) => ({
        name: x.name,
        value: x.value,
        ageGroups: x.ageGroups,
        maltaiorhGroups: (x as { maltaiorhGroups?: MapDataItem["maltaiorhGroups"] }).maltaiorhGroups,
        code: (x as { code?: string }).code,
      }));
    }
    return filteredAndAggregated.byAimag.map((x) => ({
      name: x.name,
      value: x.value,
      ageGroups: (x as { ageGroups?: AgeGroups }).ageGroups,
      maltaiorhGroups: (x as { maltaiorhGroups?: MaltaiorhGroups }).maltaiorhGroups,
    }));
  }, [filteredAndAggregated.byAimag, filteredAndAggregated.bySum, selectedAimag, useAimagOnly, selectedTable]);

  const totalCount = useMemo(() => {
    const useSum = !useAimagOnly && selectedAimag !== "all" && selectedTable !== "0500021";
    const items = useSum ? filteredAndAggregated.bySum : filteredAndAggregated.byAimag;
    return items.reduce((sum, x) => sum + x.value, 0);
  }, [filteredAndAggregated.byAimag, filteredAndAggregated.bySum, selectedAimag, useAimagOnly, selectedTable]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <SocioDashboardBackNav lng={lng} />
      <main className="mx-auto w-full max-w-[90rem] overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6">
        <div className="rounded-lg border border-slate-200 bg-white px-3 pt-3 pb-0 shadow-sm sm:px-6 sm:pt-6 sm:pb-0">
          {/* PrimeFlex `.grid` нь display:flex тул жинхэнэ grid: !grid */}
          <div className="!grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-5 lg:items-start">
            {/* Зүүн ~40%: шүүлт + хүснэгт */}
            <div className="flex min-w-0 flex-col border-r-0 border-slate-200 pr-0 lg:col-span-2 lg:border-r lg:pr-6">
            <h1 className="mb-3 break-words text-base font-bold text-slate-800 sm:mb-4 sm:text-xl">
              ЗАСАГ ЗАХИРГААНЫ НЭГЖИЙН ҮЗҮҮЛЭЛТ
            </h1>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500"></label>
                <Select
                  value={selectedTable}
                  onChange={setSelectedTable}
                  options={tableOptions}
                  style={{ width: "100%" }}
                  size="middle"
                />
              </div>
              <div
                className={`!grid gap-2 ${useAimagOnly ? "!grid-cols-1" : "!grid-cols-1 sm:!grid-cols-2"}`}
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Он</label>
                  <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    options={yearOptions}
                    style={{ width: "100%" }}
                    size="middle"
                  />
                </div>
                {!useAimagOnly && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Аймгаар</label>
                    <Select
                      value={selectedAimag}
                      onChange={setSelectedAimag}
                      options={aimagOptions}
                      style={{ width: "100%" }}
                      size="middle"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 overflow-hidden sm:mt-4">
              <div className="max-h-[22rem] min-h-[10rem] overflow-auto rounded-md border border-slate-200 bg-white sm:max-h-[min(32rem,55vh)] sm:min-h-[14rem] lg:max-h-[min(36rem,60vh)]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Spin size="small" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col gap-2 px-3 py-4">
                    <p className="text-sm text-red-500">{error}</p>
                    {metadata && busCodesForFetch.length > 0 && (
                      <button
                        type="button"
                        onClick={() => fetchData()}
                        className="self-start rounded bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Дахин ачаалах
                      </button>
                    )}
                  </div>
                ) : rankingItems.length === 0 ? (
                  <p className="px-3 py-4 text-sm text-slate-500">Өгөгдөл олдсонгүй.</p>
                ) : (
                  <div className="overflow-x-auto min-h-0">
                  <table className="min-w-[200px] w-full text-sm">
                    <thead className="sticky top-0 z-[1] border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="w-10 py-2 pl-3 pr-1 text-left font-medium text-slate-600">#</th>
                        <th
                          className="cursor-pointer select-none px-2 py-2 text-left font-medium text-slate-600 hover:bg-slate-100"
                          onClick={() => setNameSort((s) => (s === "asc" ? "desc" : s === "desc" ? null : "asc"))}
                          title="Үсгээр эрэмбэлэх"
                        >
                          <span className="inline-flex items-center gap-0.5">
                            Нэр
                            <span className="text-slate-400">
                              {nameSort === "asc" ? " ▲" : nameSort === "desc" ? " ▼" : " ⇅"}
                            </span>
                          </span>
                        </th>
                        <th className="px-2 py-2 text-right font-medium text-slate-600">Утга</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 bg-slate-50/80 font-semibold">
                        <td className="py-2 pl-3 pr-1 text-slate-500">—</td>
                        <td className="px-2 py-2 text-slate-800">Нийт</td>
                        <td className="px-2 py-2 text-right tabular-nums text-blue-700">{formatNumber(totalCount)}</td>
                      </tr>
                      {rankingItems.map((item) => (
                        <tr key={`${item.rank}-${item.name}`} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 pl-3 pr-1 text-slate-500">{item.rank}</td>
                          <td className="px-2 py-1.5 text-slate-700">{item.name}</td>
                          <td className="px-2 py-1.5 text-right font-medium tabular-nums text-blue-600">{formatNumber(item.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            </div>
            <div className="h-3 sm:h-4" aria-hidden="true" />
          </div>

            {/* Баруун ~60%: газрын зураг */}
            <div className="min-w-0 lg:col-span-3 lg:pl-2">
            {loading && rows.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center sm:min-h-[360px] md:min-h-[500px]">
                <Spin size="large" />
              </div>
            ) : error && rows.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center text-red-500 sm:min-h-[360px] md:min-h-[500px]">{error}</div>
            ) : (
              <div className="mb-0 min-w-0 max-w-full overflow-hidden">
                <MongoliaChoroplethMap
                  title=""
                  subtextOnly
                  showRegionLabels
                  layoutSize={selectedAimag !== "all" && !useAimagOnly && selectedTable !== "0500021" ? "64%" : "118%"}
                  layoutCenter={selectedAimag !== "all" && !useAimagOnly && selectedTable !== "0500021" ? ["50%", "48%"] : ["50%", "55%"]}
                  data={mapData}
                  useSimpleAimagMap={useAimagOnly || selectedAimag === "all" || selectedTable === "0500021"}
                  useSoumLevel={!useAimagOnly && selectedAimag !== "all" && selectedTable !== "0500021"}
                  enableDrillDown={!useAimagOnly && selectedAimag !== "all" && selectedTable !== "0500021"}
                  dataLabel={
                    selectedTable === "022" ? "Малчдын тоо" :
                    selectedTable === "006" ? "Өрхийн тоо" :
                    selectedTable === "031" ? "Малтай өрхийн тоо" :
                    selectedTable === "025" ? "Малчин өрхийн тоо" :
                    selectedTable === "1002" ? "Тариалан эрхэлдэг өрхийн тоо" :
                    selectedTable === "2600011" ? "ААНБ-ын тоо" :
                    selectedTable === "0500021" ? "ДНБ, зах зээлийн үнээр" :
                    "Хүн амын тоо"
                  }
                  height={mapHeight}
                  activeAimagName={!useAimagOnly && selectedAimag !== "all" ? selectedAimag : undefined}
                  onAimagClick={(name) => {
                    const normalized = name.trim().replace(/\s+аймаг\s*$/i, "").replace(/\s+хот\s*$/i, "");
                    const match = aimagOptions.find(
                      (o) => o.value !== "all" && normalized.toLowerCase().startsWith(o.value.toLowerCase())
                    );
                    setSelectedAimag(match?.value ?? normalized);
                  }}
                  onResetAimag={() => {
                    setSelectedAimag("all");
                  }}
                />
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PopulationByRegionPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center">Уншиж байна...</div>}>
      <PopulationByRegionContent />
    </Suspense>
  );
}
