"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

const GEO_JSON_URL = "/geo/aimag-valid.json";
const GEO_SOUM_URL = "/geo/soum.geojson";
/** Bilgee/mongolia-geojson – жижиг, тохиромжтой (GitHub) */
const GEO_AIMAG_SIMPLE_URL = "/geo/aimag-bilgee.geojson";
/** УБ-ийн 9 дүүрэг (mng_admin2-аас задласан) */
const GEO_UB_DUUREG_URL = "/geo/ub-duureg.geojson";

interface GeoFeature {
  type: "Feature";
  geometry: unknown;
  properties?: { aimag_id?: number; aimagname1?: string; name?: string; nameRaw?: string; soum_id?: number; prefecture?: string; adm1_name?: string; adm2_name1?: string };
}

/** Sum name (normalized) → aimag_id, from soum GeoJSON */
type SumToAimagMap = Map<string, number>;
interface GeoFeatureCollection {
  type: "FeatureCollection";
  features: GeoFeature[];
}

const AIMAG_ID_TO_NAME: Record<number, string> = {
  11: "Улаанбаатар",
  21: "Дорнод",
  22: "Сүхбаатар",
  23: "Хэнтий",
  41: "Төв",
  42: "Говьсүмбэр",
  43: "Сэлэнгэ",
  44: "Дорноговь",
  45: "Дархан-Уул",
  46: "Өмнөговь",
  48: "Дундговь",
  61: "Орхон",
  62: "Өвөрхангай",
  63: "Булган",
  64: "Баянхонгор",
  65: "Архангай",
  67: "Хөвсгөл",
  81: "Завхан",
  82: "Говь-Алтай",
  83: "Баян-Өлгий",
  84: "Ховд",
  85: "Увс",
};

const MONGOLIAN_TO_ENGLISH_AIMAG: Record<string, string> = {
  "Архангай": "Arxangai",
  "Баянхонгор": "Bayankhongor",
  "Баян-Өлгий": "Bayan-Olgii",
  "Булган": "Bulgan",
  "Дархан-Уул": "Darkhan-Uul",
  "Дорнод": "Dornod",
  "Дорноговь": "Dornogovi",
  "Дундговь": "Dundgovi",
  "Говь-Алтай": "Govi-Altai",
  "Говьсүмбэр": "Govisumber",
  "Хэнтий": "Hentii",
  "Ховд": "Khovd",
  "Хөвсгөл": "Khovsgol",
  "Орхон": "Orkhon",
  "Өвөрхангай": "Ovorkhangai",
  "Сэлэнгэ": "Selenge",
  "Сүхбаатар": "Sukhbaatar",
  "Төв": "To'v",
  "Улаанбаатар": "Ulaanbaatar",
  "Өмнөговь": "Omnogovi",
  "Увс": "Uvs",
  "Завхан": "Zavkhan",
};

/** Англи→Монгол аймгийн нэр (Bilgee prefecture нэрс болон бусад вариантууд). Багахангай, Багануур-ыг тусад нэрээр үлдээж Улаанбаатар 3 удаа гарахаас сэргийлнэ */
const ENGLISH_TO_MONGOLIAN_AIMAG: Record<string, string> = {
  ...Object.fromEntries(Object.entries(MONGOLIAN_TO_ENGLISH_AIMAG).map(([mn, en]) => [en, mn])),
  Arkhangai: "Архангай",
  "Bayan-Ulgii": "Баян-Өлгий",
  Bagakhangai: "Багахангай",
  Baganuur: "Багануур",
  GoviAltai: "Говь-Алтай",
  Khentii: "Хэнтий",
  Khuvsgul: "Хөвсгөл",
  Tuv: "Төв",
  Umnugovi: "Өмнөговь",
  uvs: "Увс",
  Uvurkhangai: "Өвөрхангай",
};

export interface MapDataItem {
  name: string;
  value: number;
  /** Насны бүлгийн агрегат (0-19, 20-54, 55+) — tooltip-д харуулах */
  ageGroups?: { "0-19": number; "20-54": number; "55+": number };
  /** Малтай өрхийн бүлэг (200 хүртэлх, 201-500, 501-1000, 1000+) — tooltip-д харуулах */
  maltaiorhGroups?: { "200 хүртэлх": number; "201-500": number; "501-1000": number; "1000+": number };
  /** API-ийн 5 оронтой Бүс код (жишээ: 34810) — soum_id тааруулахад ашиглана */
  code?: string;
}

interface YearSlicerProps {
  dimensionCode: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
}

interface MongoliaChoroplethMapProps {
  title?: string;
  data: MapDataItem[];
  className?: string;
  subtextOnly?: boolean;
  yearSlicer?: YearSlicerProps;
  yearLabel?: string;
  /** Sum-level map: use soum.geojson, match data by sum name */
  useSoumLevel?: boolean;
  /** Эхлээд аймгаар харуулж, аймаг дарсан үед тухайн аймгийн сумдаар шилжих */
  enableDrillDown?: boolean;
  /** Тогтсон өндөр (px); өгвөл доор дээрх зайг хасаад энэ хэмжээтэй болно */
  height?: number;
  /** Цэнхэр (default) эсвэл саарал өнгөний масштаб */
  colorVariant?: "default" | "gray";
  /** Tooltip болон series нэр (жишээ: Нас баралтын ерөнхий коэффициент) */
  dataLabel?: string;
  /** Tooltip дахь тооны ард нэмэх нэгж (жишээ: " Мянган толгой") */
  valueSuffix?: string;
  /** Өнгөний legend харуулах эсэх */
  showColorLegend?: boolean;
  /** Энгийн аймгийн map ашиглах (сумгүй, зөвхөн аймаг) */
  useSimpleAimagMap?: boolean;
  /** УБ-ийн дүүргээр map (орон сууцны үнэ г.м) */
  useDuuregLevel?: boolean;
  /** Аймаг дээр дархад callback (аймгийн нэрээр) */
  onAimagClick?: (aimagName: string) => void;
  /** Гаднаас идэвхтэй аймаг (sum-level zoom) */
  activeAimagName?: string;
  /** Сумаас буцах үед (аймаг-level рүү) дуудна */
  onResetAimag?: () => void;
  /** Аймаг, сумдын нэрийг map дээр харуулах */
  showRegionLabels?: boolean;
  /** Map-ийн хэмжээ (жишээ: "95%"); өгөхгүй бол 165% */
  layoutSize?: string;
  /** Map-ийн төв (layoutCenter) override (жишээ: ["50%","55%"]) */
  layoutCenter?: [string, string];
  /** Өргөн/өндрийн харьцаа (ECharts aspectScale); сумын map-д босоо шахагдсан засах бол 1.1–1.2 */
  aspectScale?: number;
}

function normalizeAimagName(s: string): string {
  return s
    .trim()
    .replace(/\s+аймаг\s*$/i, "")
    .replace(/\s+хот\s*$/i, "");
}

function normalizeSumName(s: string): string {
  return s
    .trim()
    .replace(/[\s-]+/g, " ")
    .replace(/\s+сум\s*$/i, "")
    .trim();
}

const CANONICAL_AIMAG_NAMES = Object.values(AIMAG_ID_TO_NAME);

/** Хоёр аймгийн нэр ижил эсэх (зургаа/зайг үл тоомжлор) */
function aimagNameMatch(a: string, b: string): boolean {
  const n = (s: string) => s.replace(/[\s-–]+/g, " ").trim().toLowerCase();
  return n(a) === n(b);
}

/** API-аас ирсэн аймгийн нэрийг газрын зургийн каноник нэртэй тааруулна */
function toCanonicalAimagName(parsed: string): string | null {
  const n = normalizeAimagName(parsed);
  if (!n) return null;
  const found = CANONICAL_AIMAG_NAMES.find((c) => aimagNameMatch(n, c));
  return found ?? null;
}

/** "Аймаг - Сум" дахь тусгаарлагч (зай-зургаа-зай), аймаг нэр доторх зургааг үл оролцууна */
const AIMAG_SUM_SEP = /\s+[-–]\s+/;

/** API-ийн "Аймаг - Сум" форматаас аймаг нэрийг авна (эхний хэсэг), каноник нэртэй */
function parseAimagFromDataName(dataName: string): string | null {
  const parts = dataName.split(AIMAG_SUM_SEP).map((p) => p.trim());
  const raw = parts.length >= 2 ? parts[0] : parts[0] ?? "";
  if (!raw) return null;
  return toCanonicalAimagName(raw);
}

/** API-ийн "Аймаг - Сум" эсвэл "Аймаг Сум" форматаас сум нэрийг олоход туршигдах ключүүд */
function sumNameLookupKeys(dataName: string): string[] {
  const raw = dataName.trim().replace(/\s+сум\s*$/i, "").trim();
  const n = normalizeSumName(dataName);
  const keys = [n, raw];
  if (n.includes(" ")) {
    const afterDash = dataName.split(/\s*[-–]\s*/).pop()?.trim();
    if (afterDash) keys.push(normalizeSumName(afterDash), normalizeSumName(afterDash.replace(/\s+сум\s*$/i, "")));
    const parts = n.split(/\s+/);
    if (parts.length >= 2) keys.push(normalizeSumName(parts.slice(-2).join(" ")));
    keys.push(normalizeSumName(parts[parts.length - 1] ?? ""));
  }
  return [...new Set(keys.filter(Boolean))];
}

const DRILL_MAP_PREFIX = "mongolia_soum_aimag_";

const MAP_COLORS = {
  default: {
    inRange: ["#e0f2fe", "#0891b2", "#0050C3"],
    emphasis: "#0050C3",
  },
  gray: {
    inRange: ["#f1f5f9", "#94a3b8", "#64748b"],
    emphasis: "#64748b",
  },
};

export function MongoliaChoroplethMap({
  title = "Аймгаар",
  data,
  className = "",
  subtextOnly = false,
  yearSlicer,
  yearLabel,
  useSoumLevel = false,
  enableDrillDown = false,
  height: heightProp,
  colorVariant = "default",
  dataLabel = "Төрөлтийн ерөнхий коэффициент",
  valueSuffix,
  showColorLegend = false,
  useSimpleAimagMap = false,
  useDuuregLevel = false,
  onAimagClick,
  activeAimagName,
  onResetAimag,
  showRegionLabels = false,
  layoutSize: layoutSizeProp,
  layoutCenter: layoutCenterProp,
  aspectScale: aspectScaleProp,
}: MongoliaChoroplethMapProps) {
  const chartRef = useRef<ReactECharts>(null);
  const [geoJson, setGeoJson] = useState<GeoFeatureCollection | null>(null);
  const [soumGeoJson, setSoumGeoJson] = useState<GeoFeatureCollection | null>(null);
  const [sumToAimag, setSumToAimag] = useState<SumToAimagMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [drillDownAimagId, setDrillDownAimagId] = useState<number | null>(null);
  const [drillMapReady, setDrillMapReady] = useState(false);
  const [loadedMapName, setLoadedMapName] = useState<string | null>(null);
  const [viewportW, setViewportW] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);

  const isDrillMode = enableDrillDown && useSoumLevel;
  const showingAimag = isDrillMode && drillDownAimagId === null;

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onResize = () => {
      try {
        chartRef.current?.getEchartsInstance?.()?.resize();
      } catch {
        /* chart unmount / instance not ready */
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [loadedMapName]);

  const effectiveLayoutSize = useMemo(() => {
    const base = drillDownAimagId != null ? (layoutSizeProp ?? "70%") : (layoutSizeProp ?? "120%");
    const isMobile = viewportW < 480;
    const m = String(base).trim().match(/^(\d+(?:\.\d+)?)%\s*$/);
    if (!m) return base;
    const pct = Number.parseFloat(m[1]);
    if (!Number.isFinite(pct)) return base;
    const clamped = isMobile ? Math.min(pct, 108) : pct;
    return `${clamped}%`;
  }, [drillDownAimagId, layoutSizeProp, viewportW]);

  const effectiveLayoutCenter = useMemo((): [string, string] => {
    if (layoutCenterProp) return layoutCenterProp;
    return subtextOnly ? ["50%", "34%"] : ["50%", "50%"];
  }, [layoutCenterProp, subtextOnly]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const loadAimag = () =>
      fetch(GEO_JSON_URL)
        .then((r) => r.json())
        .then((json: GeoFeatureCollection) => {
          if (cancelled) return json;
          const features = json.features?.map((f: GeoFeature) => {
            const props = f.properties ?? {};
            const id = props.aimag_id;
            const name = id != null ? AIMAG_ID_TO_NAME[id] : undefined;
            return { ...f, properties: { ...props, name: name ?? props.aimagname1 ?? String(id) } };
          });
          const collection: GeoFeatureCollection = { ...json, features: features ?? [] };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          echarts.registerMap("mongolia", collection as any);
          setLoadedMapName("mongolia");
          return collection;
        });
    const loadSoum = () =>
      fetch(GEO_SOUM_URL)
        .then((r) => r.json())
        .then((json: GeoFeatureCollection) => {
          if (cancelled) return { json, map: new Map<string, number>() as SumToAimagMap };
          const sumToAimagLocal = new Map<string, number>();
          const features = json.features?.map((f: GeoFeature) => {
            const props = f.properties ?? {};
            const rawName = props.name != null ? String(props.name).trim().replace(/\s+сум\s*$/i, "").trim() : "";
            const name = rawName ? normalizeSumName(rawName) : String(props.soum_id ?? "");
            const aid = props.aimag_id;
            if (aid != null && name) sumToAimagLocal.set(name, aid);
            return { ...f, properties: { ...props, name, nameRaw: rawName || name } };
          });
          const collection: GeoFeatureCollection = { ...json, features: features ?? [] };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          echarts.registerMap("mongolia_soum", collection as any);
          setLoadedMapName("mongolia_soum");
          return { json: collection, map: sumToAimagLocal };
        });

    if (useDuuregLevel) {
      fetch(GEO_UB_DUUREG_URL)
        .then((r) => r.json())
        .then((json: GeoFeatureCollection) => {
          if (cancelled) return;
          const features = json.features?.map((f: GeoFeature) => {
            const props = f.properties ?? {};
            const name = (props.adm2_name1 ?? props.name) as string;
            return { ...f, properties: { ...props, name } };
          }) ?? [];
          const collection: GeoFeatureCollection = { ...json, features };
          echarts.registerMap("mongolia_duureg", collection as any);
          setLoadedMapName("mongolia_duureg");
          setGeoJson(collection);
        })
        .catch(() => setGeoJson(null))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (useSimpleAimagMap) {
      fetch(GEO_AIMAG_SIMPLE_URL)
        .then((r) => r.json())
        .then((json: GeoFeatureCollection) => {
          if (cancelled) return;
          const features = json.features
            ?.map((f: GeoFeature) => {
              const props = f.properties ?? {};
              const englishName = (props.adm1_name ?? props.prefecture) as string | undefined;
              const mongolianName = englishName ? ENGLISH_TO_MONGOLIAN_AIMAG[englishName] : undefined;
              if (!mongolianName) return null;
              return { ...f, properties: { ...props, name: mongolianName } } as GeoFeature;
            })
            .filter((f): f is GeoFeature => f !== null);
          const collection: GeoFeatureCollection = { ...json, features: features ?? [] };
          echarts.registerMap("mongolia_simple", collection as any);
          setLoadedMapName("mongolia_simple");
          setGeoJson(collection);
        })
        .catch(() => setGeoJson(null))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (isDrillMode) {
      const loadAimagForDrill = () =>
        fetch(GEO_AIMAG_SIMPLE_URL)
          .then((r) => r.json())
          .then((json: GeoFeatureCollection) => {
            if (cancelled) return json;
            const features = json.features
              ?.map((f: GeoFeature) => {
                const props = f.properties ?? {};
                const englishName = (props.adm1_name ?? props.prefecture) as string | undefined;
                const mongolianName = englishName ? ENGLISH_TO_MONGOLIAN_AIMAG[englishName] : undefined;
                if (!mongolianName) return null;
                return { ...f, properties: { ...props, name: mongolianName } } as GeoFeature;
              })
              .filter((f): f is GeoFeature => f !== null);
            const collection: GeoFeatureCollection = { ...json, features: features ?? [] };
            echarts.registerMap("mongolia", collection as any);
            setLoadedMapName("mongolia");
            return collection;
          });
      Promise.all([loadAimagForDrill(), loadSoum()])
        .then(([aimagCol, { json: soumCol, map }]) => {
          if (cancelled) return;
          setGeoJson(aimagCol);
          setSoumGeoJson(soumCol);
          setSumToAimag(map);
        })
        .catch(() => setGeoJson(null))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      const geoUrl = useSoumLevel ? GEO_SOUM_URL : GEO_JSON_URL;
      const mapName = useSoumLevel ? "mongolia_soum" : "mongolia";
      fetch(geoUrl)
        .then((r) => r.json())
        .then((json: GeoFeatureCollection) => {
          if (cancelled) return;
          const features = json.features?.map((f: GeoFeature) => {
            const props = f.properties ?? {};
            if (useSoumLevel) {
              const rawName = props.name != null ? String(props.name).trim().replace(/\s+сум\s*$/i, "").trim() : "";
              const name = rawName ? normalizeSumName(rawName) : String(props.soum_id ?? "");
              return { ...f, properties: { ...props, name, nameRaw: rawName || name } };
            }
            const id = props.aimag_id;
            const name = id != null ? AIMAG_ID_TO_NAME[id] : undefined;
            return { ...f, properties: { ...props, name: name ?? props.aimagname1 ?? String(id) } };
          });
          const collection: GeoFeatureCollection = { ...json, features: features ?? [] };
          echarts.registerMap(mapName, collection as any);
          setLoadedMapName(mapName);
          setGeoJson(collection);
        })
        .catch(() => setGeoJson(null))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [useSoumLevel, isDrillMode, useSimpleAimagMap, useDuuregLevel]);

  useEffect(() => {
    if (drillDownAimagId == null || !soumGeoJson) {
      setDrillMapReady(false);
      return;
    }
    const features = soumGeoJson.features?.filter((f) => (f.properties?.aimag_id ?? 0) === drillDownAimagId) ?? [];
    const collection: GeoFeatureCollection = { type: "FeatureCollection", features };
    const mapName = DRILL_MAP_PREFIX + drillDownAimagId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    echarts.registerMap(mapName, collection as any);
    setLoadedMapName(mapName);
    setDrillMapReady(true);
  }, [drillDownAimagId, soumGeoJson]);

  // Сумын map шилжих үед chart-ийг дахин тохируулж бүтнээр нь багтаана
  useEffect(() => {
    if (drillDownAimagId == null || !drillMapReady) return;
    const t = setTimeout(() => {
      chartRef.current?.getEchartsInstance?.()?.resize();
    }, 100);
    return () => clearTimeout(t);
  }, [drillDownAimagId, drillMapReady]);

  const nameToAimagId = useMemo(() => {
    const m = new Map<string, number>();
    Object.entries(AIMAG_ID_TO_NAME).forEach(([id, name]) => m.set(name, Number(id)));
    m.set("Багахангай", 11);
    m.set("Багануур", 11);
    return m;
  }, []);

  useEffect(() => {
    if (!activeAimagName) {
      // Гадаад сонголт алга бол drill горимоос гаргана
      setDrillDownAimagId(null);
      return;
    }
    const id = nameToAimagId.get(activeAimagName);
    if (id != null) {
      setDrillDownAimagId(id);
    }
  }, [activeAimagName, nameToAimagId]);

  const mapDataForChart = useMemo(() => {
    if (isDrillMode && showingAimag) {
      const byAimagName = new Map<string, { sum: number; count: number }>();
      for (const d of data) {
        const aimagName = parseAimagFromDataName(d.name);
        if (!aimagName) continue;
        const cur = byAimagName.get(aimagName);
        const v = Number(d.value) || 0;
        if (!cur) byAimagName.set(aimagName, { sum: v, count: 1 });
        else {
          cur.sum += v;
          cur.count += 1;
        }
      }
      const arr = Array.from(byAimagName.entries()).map(([name, { sum, count }]) => ({
        name,
        value: count > 0 ? sum / count : 0,
      }));
      const ubDrill = arr.find((d) => aimagNameMatch(d.name, "Улаанбаатар"));
      if (ubDrill && !arr.some((d) => aimagNameMatch(d.name, "Багахангай"))) arr.push({ name: "Багахангай", value: ubDrill.value });
      if (ubDrill && !arr.some((d) => aimagNameMatch(d.name, "Багануур"))) arr.push({ name: "Багануур", value: ubDrill.value });
      return arr;
    }
    if (isDrillMode && drillDownAimagId != null) {
      const sumNamesInAimag = new Set<string>();
      const soumIdToName = new Map<number, string>();
      for (const f of soumGeoJson?.features ?? []) {
        if ((f.properties?.aimag_id ?? 0) !== drillDownAimagId) continue;
        const norm = normalizeSumName(String(f.properties?.name ?? ""));
        const raw = String(f.properties?.nameRaw ?? f.properties?.name ?? "").trim();
        if (norm) sumNamesInAimag.add(norm);
        if (raw) sumNamesInAimag.add(raw);
        if (raw && raw !== norm) sumNamesInAimag.add(normalizeSumName(raw));
        const sid = f.properties?.soum_id;
        if (sid != null && norm) soumIdToName.set(Number(sid), norm);
      }
      return data
        .filter((d) => {
          if (d.code && d.code.length === 5) {
            const rest = d.code.slice(1);
            const soumId = parseInt(rest, 10);
            if (!Number.isNaN(soumId) && soumIdToName.has(soumId)) return true;
          }
          return sumNameLookupKeys(d.name).some((k) => sumNamesInAimag.has(k));
        })
        .map((d) => {
          let mapName: string | null = null;
          if (d.code && d.code.length === 5) {
            const rest = d.code.slice(1);
            const soumId = parseInt(rest, 10);
            if (!Number.isNaN(soumId)) mapName = soumIdToName.get(soumId) ?? null;
          }
          if (!mapName) {
            const keys = sumNameLookupKeys(d.name);
            mapName = keys.find((k) => sumNamesInAimag.has(k)) ?? null;
          }
          return {
            name: mapName ?? normalizeSumName(d.name),
            value: d.value,
            ageGroups: d.ageGroups,
          };
        });
    }
    if (useSoumLevel) {
      return data.map((d) => ({
        name: normalizeSumName(d.name),
        value: d.value,
        ageGroups: d.ageGroups,
      }));
    }
    if (useDuuregLevel) {
      const byName = new Map<string, number>();
      for (const d of data) {
        const n = d.name?.trim();
        if (n && n !== "Дундаж") byName.set(n, (byName.get(n) ?? 0) + d.value);
      }
      return Array.from(byName.entries()).map(([name, value]) => ({ name, value }));
    }
    const byName = new Map<string, { value: number; ageGroups?: MapDataItem["ageGroups"]; maltaiorhGroups?: MapDataItem["maltaiorhGroups"] }>();
    for (const d of data) {
      const n = normalizeAimagName(d.name);
      if (!n) continue;
      const mg = d.maltaiorhGroups;
      const cur = byName.get(n);
      if (!cur) {
        byName.set(n, { value: d.value, ageGroups: d.ageGroups, maltaiorhGroups: mg ? { ...mg } : undefined });
      } else {
        cur.value += d.value;
        if (d.ageGroups && cur.ageGroups) {
          cur.ageGroups["0-19"] = (cur.ageGroups["0-19"] ?? 0) + (d.ageGroups["0-19"] ?? 0);
          cur.ageGroups["20-54"] = (cur.ageGroups["20-54"] ?? 0) + (d.ageGroups["20-54"] ?? 0);
          cur.ageGroups["55+"] = (cur.ageGroups["55+"] ?? 0) + (d.ageGroups["55+"] ?? 0);
        }
        if (mg && cur.maltaiorhGroups) {
          cur.maltaiorhGroups["200 хүртэлх"] = (cur.maltaiorhGroups["200 хүртэлх"] ?? 0) + (mg["200 хүртэлх"] ?? 0);
          cur.maltaiorhGroups["201-500"] = (cur.maltaiorhGroups["201-500"] ?? 0) + (mg["201-500"] ?? 0);
          cur.maltaiorhGroups["501-1000"] = (cur.maltaiorhGroups["501-1000"] ?? 0) + (mg["501-1000"] ?? 0);
          cur.maltaiorhGroups["1000+"] = (cur.maltaiorhGroups["1000+"] ?? 0) + (mg["1000+"] ?? 0);
        } else if (mg) {
          cur.maltaiorhGroups = { ...mg };
        }
      }
    }
    return Array.from(byName.entries()).map(([name, { value, ageGroups, maltaiorhGroups }]) => ({ name, value, ageGroups, maltaiorhGroups }));
  }, [data, useSoumLevel, useDuuregLevel, isDrillMode, showingAimag, drillDownAimagId, sumToAimag, soumGeoJson]);

  const finalMapData = useMemo(() => {
    if (useDuuregLevel) return mapDataForChart;
    if (!useSimpleAimagMap) return mapDataForChart;
    const mongolianNames = Object.keys(MONGOLIAN_TO_ENGLISH_AIMAG);
    const out = mapDataForChart.map((d) => {
      const normalized = d.name.replace(/[\s-–]+/g, " ").trim().toLowerCase();
      const matchedName = mongolianNames.find((mn) => {
        const mnNorm = mn.replace(/[\s-–]+/g, " ").trim().toLowerCase();
        return mnNorm === normalized || normalized.includes(mnNorm) || mnNorm.includes(normalized);
      });
      return {
        name: matchedName ?? d.name,
        value: d.value,
        ageGroups: (d as { ageGroups?: MapDataItem["ageGroups"] }).ageGroups,
        maltaiorhGroups: (d as { maltaiorhGroups?: MapDataItem["maltaiorhGroups"] }).maltaiorhGroups,
      };
    });
    const ub = out.find((d) => aimagNameMatch(d.name, "Улаанбаатар"));
    if (ub) {
      const ubItem = { name: ub.name, value: ub.value, ageGroups: ub.ageGroups, maltaiorhGroups: ub.maltaiorhGroups };
      if (!out.some((d) => aimagNameMatch(d.name, "Багахангай"))) out.push({ ...ubItem, name: "Багахангай" });
      if (!out.some((d) => aimagNameMatch(d.name, "Багануур"))) out.push({ ...ubItem, name: "Багануур" });
    }
    return out;
  }, [mapDataForChart, useSimpleAimagMap, useDuuregLevel]);

  const currentMapName = useMemo(() => {
    if (useDuuregLevel) return "mongolia_duureg";
    if (useSimpleAimagMap) return "mongolia_simple";
    if (isDrillMode && drillDownAimagId != null) return DRILL_MAP_PREFIX + drillDownAimagId;
    if (isDrillMode && showingAimag) return "mongolia";
    return useSoumLevel ? "mongolia_soum" : "mongolia";
  }, [isDrillMode, showingAimag, drillDownAimagId, useSoumLevel, useSimpleAimagMap, useDuuregLevel]);

  const handleMapClick = useCallback(
    (params: { name?: string }) => {
      const clickedName = params?.name;
      if (clickedName && onAimagClick) {
        onAimagClick(clickedName);
      }
      if (!isDrillMode || !showingAimag || !clickedName) return;
      const aimagId = nameToAimagId.get(clickedName);
      if (aimagId != null) {
        setDrillMapReady(false);
        setDrillDownAimagId(aimagId);
      }
    },
    [onAimagClick, isDrillMode, showingAimag, nameToAimagId]
  );

  const option: EChartsOption = useMemo(() => {
    const hasGeo = showingAimag ? geoJson : drillDownAimagId != null ? drillMapReady : geoJson;
    if (!hasGeo || !currentMapName || loadedMapName !== currentMapName) return {};
    const values = finalMapData.map((d) => d.value).filter((v) => v > 0);
    const maxVal = values.length > 0 ? Math.max(...values) : 100;
    const minVal = values.length > 0 ? Math.min(...values) : 0;

    return {
      title: {
        show: false,
        text: title,
        subtext: "",
        left: "center",
        top: 12,
        textStyle: { color: "#0f172a", fontSize: 20, fontWeight: "bold" },
        padding: [8, 0],
      },
      tooltip: {
        trigger: "item",
        borderColor: "#0d9488",
        borderWidth: 1,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: [12, 16],
        extraCssText: "border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-family: Arial, sans-serif;",
        textStyle: { color: "#f1f5f9", fontSize: 12 },
        formatter: (params: unknown) => {
          const p = params as { name?: string; data?: { value?: number; ageGroups?: { "0-19": number; "20-54": number; "55+": number }; maltaiorhGroups?: { "200 хүртэлх": number; "201-500": number; "501-1000": number; "1000+": number } } };
          const name = String(p?.name ?? "");
          const item = finalMapData.find((d) => d.name === name);
          const val = p?.data?.value ?? item?.value;
          const ageGroups = p?.data?.ageGroups ?? (item as { ageGroups?: { "0-19": number; "20-54": number; "55+": number } })?.ageGroups;
          const maltaiorhGroups = p?.data?.maltaiorhGroups ?? (item as { maltaiorhGroups?: { "200 хүртэлх": number; "201-500": number; "501-1000": number; "1000+": number } })?.maltaiorhGroups;
          const n = val != null ? Number(val) : NaN;
          const r = Number.isFinite(n) ? Math.round(n * 10) / 10 : NaN;
          const numRaw = Number.isFinite(r) ? (r % 1 === 0 ? String(Math.round(r)) : r.toFixed(1)) : "—";
          const num = valueSuffix ? `${numRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${valueSuffix}` : numRaw;
          const fmt = (v: number) => Math.round(v).toString();
          let body = `<div style="display:flex;align-items:center;gap:6px;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.15);">
            <span style="color:#2dd4bf;font-size:14px;">◉</span>
            <span style="color:#f1f5f9;font-weight:600;font-size:13px;">${name}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;">
            <span style="color:#94a3b8;font-size:12px;">${dataLabel}</span>
            <span style="color:#f1f5f9;font-weight:600;">${num}</span>
          </div>`;
          if (ageGroups && (ageGroups["0-19"] > 0 || ageGroups["20-54"] > 0 || ageGroups["55+"] > 0)) {
            body += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.15);font-size:11px;">
              <table style="width:100%;border-collapse:collapse;color:#94a3b8;">
                <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.2);"><th style="text-align:left;padding:4px 8px 4px 0;font-weight:600;color:#cbd5e1;">Насны бүлэг</th><th style="text-align:right;padding:4px 0;font-weight:600;color:#cbd5e1;">Тоо</th></tr></thead>
                <tbody>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><td style="padding:3px 8px 3px 0;">0–19</td><td style="text-align:right;color:#f1f5f9;">${fmt(ageGroups["0-19"] ?? 0)}</td></tr>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><td style="padding:3px 8px 3px 0;">20–54</td><td style="text-align:right;color:#f1f5f9;">${fmt(ageGroups["20-54"] ?? 0)}</td></tr>
                  <tr><td style="padding:3px 8px 3px 0;">55+</td><td style="text-align:right;color:#f1f5f9;">${fmt(ageGroups["55+"] ?? 0)}</td></tr>
                </tbody>
              </table>
            </div>`;
          }
          if (maltaiorhGroups && (maltaiorhGroups["200 хүртэлх"] > 0 || maltaiorhGroups["201-500"] > 0 || maltaiorhGroups["501-1000"] > 0 || maltaiorhGroups["1000+"] > 0)) {
            body += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.15);font-size:11px;">
              <table style="width:100%;border-collapse:collapse;color:#94a3b8;">
                <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.2);"><th style="text-align:left;padding:4px 8px 4px 0;font-weight:600;color:#cbd5e1;">Малын тоо</th><th style="text-align:right;padding:4px 0;font-weight:600;color:#cbd5e1;">Тоо</th></tr></thead>
                <tbody>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><td style="padding:3px 8px 3px 0;">200 хүртэлх</td><td style="text-align:right;color:#f1f5f9;">${fmt(maltaiorhGroups["200 хүртэлх"] ?? 0)}</td></tr>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><td style="padding:3px 8px 3px 0;">201-500</td><td style="text-align:right;color:#f1f5f9;">${fmt(maltaiorhGroups["201-500"] ?? 0)}</td></tr>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.08);"><td style="padding:3px 8px 3px 0;">501-1000</td><td style="text-align:right;color:#f1f5f9;">${fmt(maltaiorhGroups["501-1000"] ?? 0)}</td></tr>
                  <tr><td style="padding:3px 8px 3px 0;">1000+</td><td style="text-align:right;color:#f1f5f9;">${fmt(maltaiorhGroups["1000+"] ?? 0)}</td></tr>
                </tbody>
              </table>
            </div>`;
          }
          return body;
        },
      },
      visualMap: {
        show: showColorLegend,
        type: "continuous",
        min: minVal,
        max: maxVal,
        left: 16,
        bottom: subtextOnly ? 0 : 24,
        itemWidth: 12,
        itemHeight: 120,
        inRange: { color: MAP_COLORS[colorVariant].inRange },
        text: ["", ""],
        calculable: false,
      },
      series: [
        {
          type: "map",
          map: currentMapName,
          roam: false,
          layoutCenter: effectiveLayoutCenter,
          layoutSize: effectiveLayoutSize,
          ...(aspectScaleProp != null ? { aspectScale: aspectScaleProp } : {}),
          data: finalMapData,
          name: dataLabel,
          label: showRegionLabels
            ? { show: true, fontSize: drillDownAimagId != null ? 9 : 10, color: "#334155", fontWeight: 500 }
            : { show: false },
          emphasis: { label: { show: showRegionLabels }, itemStyle: { areaColor: MAP_COLORS[colorVariant].emphasis } },
          itemStyle: { borderColor: "#fff", borderWidth: 1 },
        },
      ],
    };
  }, [geoJson, drillDownAimagId, drillMapReady, title, subtextOnly, finalMapData, currentMapName, loadedMapName, showingAimag, colorVariant, dataLabel, valueSuffix, showColorLegend, showRegionLabels, effectiveLayoutCenter, effectiveLayoutSize, aspectScaleProp]);

  const effectiveHeight = heightProp ?? (subtextOnly ? 400 : 360);
  // Map бүртгэгдэж амжаагүй үед skeleton харуулах
  if (loading || !geoJson || !currentMapName || loadedMapName !== currentMapName) {
    return (
      <div className={subtextOnly ? `w-full ${className}` : `rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm ${className}`}>
        {!subtextOnly && (
          <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2 sm:mb-2">
            {title ? <h3 className="chart-section-title">{title}</h3> : null}
          </div>
        )}
        <div className="relative flex items-center justify-center rounded-md bg-[var(--card-bg-muted)]" style={{ height: effectiveHeight, minHeight: heightProp ? undefined : (subtextOnly ? 400 : 300) }}>
          <p className="text-content text-[var(--muted-foreground)]">Газрын зураг ачаалж байна...</p>
        </div>
      </div>
    );
  }

  const chartHeight = heightProp ?? (subtextOnly ? 400 : 400);
  const wrapperClass = subtextOnly ? `w-full min-w-0 max-w-full max-w-[100vw] overflow-hidden ${className}` : `min-w-0 max-w-full max-w-[100vw] overflow-hidden rounded-md border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm ${className}`;

  return (
    <div className={wrapperClass}>
      {title && (
        <div className="mb-2">
          <h3 className="chart-section-title">{title}</h3>
        </div>
      )}
      {(yearSlicer?.options.length || yearLabel) ? (
        <div className={`mb-2 flex flex-col md:flex-row flex-wrap gap-2 ${subtextOnly ? "md:items-center md:justify-end" : "md:items-start md:justify-between"}`}>
          {yearSlicer && yearSlicer.options.length > 0 ? (
            <select
              value={yearSlicer.value}
              onChange={(e) => yearSlicer.onChange(e.target.value)}
              className="filter-select"
            >
              {yearSlicer.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : yearLabel ? (
            <span className="filter-select" style={{ cursor: "default" }}>
              {yearLabel}
            </span>
          ) : null}
        </div>
      ) : null}
      {isDrillMode && drillDownAimagId != null && (
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setDrillDownAimagId(null);
              onResetAimag?.();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label="Аймгаар буцах"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Буцах
          </button>
        </div>
      )}
      <div className="relative min-w-0 max-w-full overflow-hidden rounded-md bg-white" style={{ maxWidth: "100%" }}>
        <ReactECharts
          key={`${currentMapName}-${loadedMapName ?? "none"}`}
          ref={chartRef}
          option={option}
          style={{ width: "100%", maxWidth: "100%", height: chartHeight, minHeight: heightProp ?? (subtextOnly ? 400 : 320) }}
          opts={{ renderer: "canvas" }}
          notMerge
          shouldSetOption={(prev, next) => {
            const nextSeries = (next.option as { series?: unknown })?.series;
            if (Array.isArray(nextSeries) && nextSeries.length === 0) return false;
            if (next.option && typeof next.option === "object" && Object.keys(next.option as object).length === 0) return false;
            return true;
          }}
          onEvents={(useSimpleAimagMap && onAimagClick) || (isDrillMode && showingAimag) ? { click: (params: unknown) => handleMapClick(params as { name?: string }) } : undefined}
        />
      </div>
    </div>
  );
}
