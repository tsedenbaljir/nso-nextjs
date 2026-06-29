import type { PxMetadata, PxDataRequest, JsonStatDataset } from "./types";
import { jsonStatToRows } from "./parse-json-stat";

export interface KpiResult {
  value: number | null;
  period: string;
}

export interface KpiWithGrowthResult {
  value: number | null;
  period: string;
  growthPercent?: number;
}

async function fetchPxMetadata(apiUrl: string): Promise<PxMetadata> {
  const res = await fetch(apiUrl, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`PX metadata failed: ${res.status}`);
  return res.json() as Promise<PxMetadata>;
}

async function fetchPxData(apiUrl: string, body: PxDataRequest): Promise<JsonStatDataset> {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PX data failed: ${res.status}`);
  return res.json() as Promise<JsonStatDataset>;
}

export async function getLatestKpiFromPx(
  apiUrl: string,
  timeDimension: string,
  useFirst: boolean = false,
  fixedSelections?: Record<string, string[]>
): Promise<KpiResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find(
    (v) => v.code === timeDimension || v.text === timeDimension
  );
  if (!timeVar || !timeVar.values.length) {
    return { value: null, period: "" };
  }
  // Сүүлийн үе: утга/жилээр харьцуулаад хамгийн сүүлийн үеийн индексийг олно (дараалал өөр өөр байж болно)
  const periodStr = (i: number): string =>
    String(timeVar.valueTexts?.[i] ?? timeVar.values[i] ?? "");
  const parseYear = (s: string): number => {
    const four = /(20\d{2}|19\d{2})/.exec(s);
    return four ? parseInt(four[1]!, 10) : 0;
  };
  let latestIdx = 0;
  let maxSort = "";
  for (let i = 0; i < timeVar.values.length; i++) {
    const s = periodStr(i);
    const y = parseYear(s);
    const sortKey = `${y.toString().padStart(4, "0")}-${s}`;
    if (sortKey >= maxSort) {
      maxSort = sortKey;
      latestIdx = i;
    }
  }
  const latestCode = timeVar.values[latestIdx]!;
  const periodLabel = timeVar.valueTexts?.[latestIdx] ?? latestCode;

  const query: PxDataRequest["query"] = metadata.variables.map((v) => {
    const fixed = fixedSelections && fixedSelections[v.code];
    const values =
      fixed && fixed.length > 0
        ? fixed
        : v.code === timeVar.code
          ? [latestCode]
          : v.values;
    return {
      code: v.code,
      selection: { filter: "item" as const, values },
    };
  });
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  if (!rows.length) return { value: null, period: periodLabel };
  const firstVal = Number(rows[0].value);
  const sumVal = rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
  const value = useFirst ? firstVal : sumVal;
  return { value: Number.isFinite(value) ? value : null, period: periodLabel };
}

export async function getLatestKpiWithGrowthFromPx(
  apiUrl: string,
  timeDimension: string,
  fixedSelections?: Record<string, string[]>,
  growthConfig?: { dimension: string; valueCode: string; mainValueCode: string }
): Promise<KpiWithGrowthResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find(
    (v) => v.code === timeDimension || v.text === timeDimension
  );
  if (!timeVar || !timeVar.values.length) {
    return { value: null, period: "" };
  }
  const periodStr = (i: number): string =>
    String(timeVar.valueTexts?.[i] ?? timeVar.values[i] ?? "");
  const parseYear = (s: string): number => {
    const four = /(20\d{2}|19\d{2})/.exec(s);
    return four ? parseInt(four[1]!, 10) : 0;
  };
  let latestIdx = 0;
  let maxSort = "";
  for (let i = 0; i < timeVar.values.length; i++) {
    const s = periodStr(i);
    const y = parseYear(s);
    const sortKey = `${y.toString().padStart(4, "0")}-${s}`;
    if (sortKey >= maxSort) {
      maxSort = sortKey;
      latestIdx = i;
    }
  }
  const latestCode = timeVar.values[latestIdx]!;
  const periodLabel = timeVar.valueTexts?.[latestIdx] ?? latestCode;

  const query: PxDataRequest["query"] = metadata.variables.map((v) => {
    const fixed = fixedSelections && fixedSelections[v.code];
    const values =
      fixed && fixed.length > 0
        ? fixed
        : v.code === timeVar.code
          ? [latestCode]
          : v.values;
    return {
      code: v.code,
      selection: { filter: "item" as const, values },
    };
  });
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  if (!rows.length) return { value: null, period: periodLabel };

  let mainValue: number | null = null;
  let growthPercent: number | undefined = undefined;

  if (growthConfig) {
    const dimKey = growthConfig.dimension;
    const dimCodeKey = `${dimKey}_code`;
    for (const row of rows) {
      const code = String(row[dimCodeKey] ?? row[dimKey] ?? "");
      const val = Number(row.value);
      if (code === growthConfig.mainValueCode && Number.isFinite(val)) {
        mainValue = val;
      }
      if (code === growthConfig.valueCode && Number.isFinite(val)) {
        growthPercent = val;
      }
    }
  } else {
    mainValue = rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
  }

  return {
    value: mainValue != null && Number.isFinite(mainValue) ? mainValue : null,
    period: periodLabel,
    growthPercent,
  };
}

export interface TrendResult {
  periods: string[];
  values: number[];
}

/** Мөнгөний нийлүүлэлт (M2) KPI: тухайн сар + 12 сар өмнөхтэй харьцуулсан өсөлт % */
export async function getLatestMoneySupplyKpi(apiUrl: string): Promise<KpiWithGrowthResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find((v) => v.code === "Сар" || v.text === "Сар");
  if (!timeVar || timeVar.values.length < 13) {
    return { value: null, period: "", growthPercent: undefined };
  }
  const indCode = "0"; // M2
  const query: PxDataRequest["query"] = metadata.variables.map((v) => ({
    code: v.code,
    selection: {
      filter: "item" as const,
      values: v.code === "Үзүүлэлт" ? [indCode] : [timeVar.values[0]!, timeVar.values[12]!],
    },
  }));
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const sarCodeKey = "Сар_code";
  const byIdx = new Map<string, number>();
  for (const r of rows) {
    const sarCode = String(r[sarCodeKey] ?? r["Сар"] ?? "");
    const idx = timeVar.values.indexOf(sarCode);
    if (idx !== 0 && idx !== 12) continue;
    const v = Number(r.value);
    if (Number.isFinite(v)) byIdx.set(sarCode, v);
  }
  const latestCode = timeVar.values[0]!;
  const prev12Code = timeVar.values[12]!;
  const latestVal = byIdx.get(latestCode) ?? null;
  const prev12Val = byIdx.get(prev12Code) ?? null;
  const periodLabel = timeVar.valueTexts?.[0] ?? latestCode;
  let growthPercent: number | undefined;
  if (latestVal != null && prev12Val != null && prev12Val !== 0) {
    growthPercent = ((latestVal - prev12Val) / Math.abs(prev12Val)) * 100;
  }
  return {
    value: latestVal != null && Number.isFinite(latestVal) ? latestVal : null,
    period: periodLabel,
    growthPercent: growthPercent != null && Number.isFinite(growthPercent) ? growthPercent : undefined,
  };
}

/** BOP KPI: сүүлийн бүтэн жилийн өссөн дүн (1–12 сарын нийлбэр) + өмнөх жилтэй харьцуулсан өсөлт */
export async function getLatestBopKpi(
  apiUrl: string,
  indicatorCode: string
): Promise<KpiWithGrowthResult> {
  const latestMonthKey = await getBopLatestMonthKey(apiUrl, indicatorCode);
  const trend = await getBopCumulativeTrend(apiUrl, indicatorCode);
  if (trend.values.length === 0) return { value: null, period: "", growthPercent: undefined };
  const lastVal = trend.values[trend.values.length - 1]!;
  // Карт дээр "2026-01" гэх мэтээр харуулах
  const period = latestMonthKey ?? "";
  let growthPercent: number | undefined;
  if (trend.values.length >= 2) {
    const prevVal = trend.values[trend.values.length - 2]!;
    if (prevVal !== 0) {
      growthPercent = ((lastVal - prevVal) / Math.abs(prevVal)) * 100;
    }
  }
  return {
    value: Number.isFinite(lastVal) ? lastVal : null,
    period,
    growthPercent: growthPercent != null && Number.isFinite(growthPercent) ? growthPercent : undefined,
  };
}

async function getBopLatestMonthKey(apiUrl: string, indicatorCode: string): Promise<string | null> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find((v) => v.code === "Сар" || v.text === "Сар");
  if (!timeVar || !timeVar.values.length) return null;

  const query: PxDataRequest["query"] = metadata.variables.map((v) => ({
    code: v.code,
    selection: {
      filter: "item" as const,
      values: v.code === "Үзүүлэлт" ? [indicatorCode] : timeVar.values,
    },
  }));
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const sarCodeKey = "Сар_code";

  let latestSortKey = "";
  for (const r of rows) {
    const sarCode = String(r[sarCodeKey] ?? r["Сар"] ?? "").trim();
    const idx = timeVar.values.indexOf(sarCode);
    if (idx < 0) continue;
    const label = String(timeVar.valueTexts?.[idx] ?? sarCode).trim();
    const yMatch = /20\d{2}|19\d{2}/.exec(label);
    const mMatch =
      /(\d{1,2})\s*сар|M(\d{2})|[-.](\d{1,2})\b/.exec(label) || [null, "1", "01", "01"];
    const year = yMatch ? parseInt(yMatch[0]!, 10) : 0;
    const month = parseInt(mMatch[1] ?? mMatch[2] ?? mMatch[3] ?? "1", 10) || 1;
    if (year < 2000) continue;
    const sortKey = `${year}-${String(month).padStart(2, "0")}`;
    if (sortKey >= latestSortKey) latestSortKey = sortKey;
  }

  return latestSortKey ? latestSortKey : null;
}

/** BOP KPI картанд: сүүлийн сарын утга + сарын period (хувь хасагдсан) */
export async function getLatestBopMonthlyKpi(
  apiUrl: string,
  indicatorCode: string
): Promise<KpiResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find((v) => v.code === "Сар" || v.text === "Сар");
  if (!timeVar || !timeVar.values.length) return { value: null, period: "" };

  const query: PxDataRequest["query"] = metadata.variables.map((v) => ({
    code: v.code,
    selection: {
      filter: "item" as const,
      values: v.code === "Үзүүлэлт" ? [indicatorCode] : timeVar.values,
    },
  }));
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const sarCodeKey = "Сар_code";

  const withPeriod: { sortKey: string; label: string; value: number }[] = [];
  for (const r of rows) {
    const sarCode = String(r[sarCodeKey] ?? r["Сар"] ?? "").trim();
    const idx = timeVar.values.indexOf(sarCode);
    if (idx < 0) continue;
    const label = String(timeVar.valueTexts?.[idx] ?? sarCode).trim();
    const val = Number(r.value) || 0;
    const yMatch = /20\d{2}|19\d{2}/.exec(label);
    const mMatch = /(\d{1,2})\s*сар|M(\d{2})|[-.](\d{1,2})\b/.exec(label) || [null, "1", "01", "01"];
    const year = yMatch ? parseInt(yMatch[0]!, 10) : 0;
    const month = parseInt(mMatch[1] ?? mMatch[2] ?? mMatch[3] ?? "1", 10) || 1;
    if (year < 2000) continue;
    const sortKey = `${year}-${String(month).padStart(2, "0")}`;
    withPeriod.push({ sortKey, label, value: val });
  }
  if (withPeriod.length === 0) return { value: null, period: "" };
  withPeriod.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  const last = withPeriod[withPeriod.length - 1]!;
  return {
    value: Number.isFinite(last.value) ? last.value : null,
    period: last.label,
  };
}

/** BOP: сүүлийн N сарын trend (картанд сараар харуулах) */
export async function getBopMonthlyTrend(
  apiUrl: string,
  indicatorCode: string,
  lastMonths: number = 12
): Promise<TrendResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find((v) => v.code === "Сар" || v.text === "Сар");
  if (!timeVar || !timeVar.values.length) return { periods: [], values: [] };

  const query: PxDataRequest["query"] = metadata.variables.map((v) => ({
    code: v.code,
    selection: {
      filter: "item" as const,
      values: v.code === "Үзүүлэлт" ? [indicatorCode] : timeVar.values,
    },
  }));
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const sarCodeKey = "Сар_code";

  const withPeriod: { sortKey: string; label: string; value: number }[] = [];
  for (const r of rows) {
    const sarCode = String(r[sarCodeKey] ?? r["Сар"] ?? "").trim();
    const idx = timeVar.values.indexOf(sarCode);
    if (idx < 0) continue;
    const label = String(timeVar.valueTexts?.[idx] ?? sarCode).trim();
    const val = Number(r.value) || 0;
    const yMatch = /20\d{2}|19\d{2}/.exec(label);
    const mMatch = /(\d{1,2})\s*сар|M(\d{2})|[-.](\d{1,2})\b/.exec(label) || [null, "1", "01", "01"];
    const year = yMatch ? parseInt(yMatch[0]!, 10) : 0;
    const month = parseInt(mMatch[1] ?? mMatch[2] ?? mMatch[3] ?? "1", 10) || 1;
    if (year < 2000) continue;
    const sortKey = `${year}-${String(month).padStart(2, "0")}`;
    withPeriod.push({ sortKey, label, value: val });
  }
  withPeriod.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  const slice = withPeriod.slice(-lastMonths);
  return {
    periods: slice.map((x) => x.label),
    values: slice.map((x) => x.value),
  };
}

/** BOP: API тухайн сар буцаана; жил бүр 1–12 сарыг нэмж өссөн дүн гаргана */
export async function getBopCumulativeTrend(
  apiUrl: string,
  indicatorCode: string
): Promise<TrendResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find((v) => v.code === "Сар" || v.text === "Сар");
  if (!timeVar || !timeVar.values.length) return { periods: [], values: [] };

  const query: PxDataRequest["query"] = metadata.variables.map((v) => ({
    code: v.code,
    selection: {
      filter: "item" as const,
      values: v.code === "Үзүүлэлт" ? [indicatorCode] : timeVar.values,
    },
  }));
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const sarCodeKey = "Сар_code";

  type Entry = { year: number; month: number; value: number };
  const entries: Entry[] = [];

  for (const r of rows) {
    const sarCode = String(r[sarCodeKey] ?? r["Сар"] ?? "").trim();
    const idx = timeVar.values.indexOf(sarCode);
    if (idx < 0) continue;
    const label = String(timeVar.valueTexts?.[idx] ?? sarCode).trim();
    const yMatch = /20\d{2}|19\d{2}/.exec(label);
    const mMatch =
      /(\d{1,2})\s*сар|M(\d{2})|[-.](\d{1,2})\b/.exec(label) || [null, "1", "01", "01"];
    const year = yMatch ? parseInt(yMatch[0]!, 10) : 0;
    const month = parseInt(mMatch[1] ?? mMatch[2] ?? mMatch[3] ?? "1", 10) || 1;
    if (year < 2000) continue;
    const value = Number(r.value) || 0;
    entries.push({ year, month, value });
  }

  if (entries.length === 0) {
    return { periods: [], values: [] };
  }

  // Сүүлийн ажиглагдсан сарын дугаарыг олно (жишээ нь 2026-01 бол 1)
  let latestSortKey = "";
  let latestMonth = 1;
  for (const e of entries) {
    const sortKey = `${e.year}-${String(e.month).padStart(2, "0")}`;
    if (sortKey >= latestSortKey) {
      latestSortKey = sortKey;
      latestMonth = e.month;
    }
  }

  // Жил бүр тухайн сарын хүртэлх (1–latestMonth) өссөн дүнг гаргана
  const byYear = new Map<number, number>();
  for (const e of entries) {
    if (e.month > latestMonth) continue;
    byYear.set(e.year, (byYear.get(e.year) ?? 0) + e.value);
  }

  const years = [...byYear.keys()].sort((a, b) => a - b);
  const monthStr = String(latestMonth).padStart(2, "0");
  return {
    periods: years.map((y) => `${y}-${monthStr}`),
    values: years.map((y) => byYear.get(y) ?? 0),
  };
}

export async function getTrendFromPx(
  apiUrl: string,
  timeDimension: string,
  count: number,
  useFirst: boolean,
  fixedSelections?: Record<string, string[]>
): Promise<TrendResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find(
    (v) => v.code === timeDimension || v.text === timeDimension
  );
  if (!timeVar || !timeVar.values.length) {
    return { periods: [], values: [] };
  }
  // Он/сар шинэчлэгдэж нэмэгддэг тул time dimension-ийг үргэлж metadata-гаас динамикаар авна.
  // `count` нь зөвхөн хэдэн үе хайлуулахыг (сүүлийн N үе) хязгаарлана.
  const timeCodes = timeVar.values
    .slice(0, Math.min(count, timeVar.values.length))
    .reverse();
  const query: PxDataRequest["query"] = metadata.variables.map((v) => {
    const fixed = fixedSelections && fixedSelections[v.code];
    const values =
      fixed && fixed.length > 0
        ? fixed
        : v.code === timeVar.code
          ? timeCodes
          : v.values;
    return {
      code: v.code,
      selection: { filter: "item" as const, values },
    };
  });
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const codeKey = `${timeVar.code}_code`;
  const byPeriod = new Map<string, number[]>();
  for (const row of rows) {
    const code = String(row[codeKey] ?? row[timeVar.code] ?? "").trim();
    const v = Number(row.value);
    if (!Number.isFinite(v)) continue;
    if (!byPeriod.has(code)) byPeriod.set(code, []);
    byPeriod.get(code)!.push(v);
  }
  const periods = timeCodes.map(
    (c) => timeVar.valueTexts?.[timeVar.values.indexOf(c)] ?? c
  );
  const values = timeCodes.map((c) => {
    const arr = byPeriod.get(c) ?? [];
    if (useFirst) return arr.length ? arr[0]! : null;
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.length ? sum : null;
  });
  const valid = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (valid.length === 0) return { periods: [], values: [] };
  return {
    periods,
    values: values.map((v) => (v != null && Number.isFinite(v) ? v : 0)),
  };
}

/** Сүүлийн N үе — PX-ийн Хугацаа ихэвчлэн сүүлийн үеэс эхэлдэг тул массивын эхний N-ийг авна */
export async function getTrendFromPxLastN(
  apiUrl: string,
  timeDimension: string,
  count: number,
  useFirst: boolean,
  fixedSelections?: Record<string, string[]>
): Promise<TrendResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find(
    (v) => v.code === timeDimension || v.text === timeDimension
  );
  if (!timeVar || !timeVar.values.length) {
    return { periods: [], values: [] };
  }
  const n = Math.min(count, timeVar.values.length);
  const timeCodes = timeVar.values.slice(0, n);
  const query: PxDataRequest["query"] = metadata.variables.map((v) => {
    const fixed = fixedSelections && fixedSelections[v.code];
    const values =
      fixed && fixed.length > 0
        ? fixed
        : v.code === timeVar.code
          ? timeCodes
          : v.values;
    return {
      code: v.code,
      selection: { filter: "item" as const, values },
    };
  });
  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const codeKey = `${timeVar.code}_code`;
  const byPeriod = new Map<string, number[]>();
  for (const row of rows) {
    const code = String(row[codeKey] ?? row[timeVar.code] ?? "").trim();
    const v = Number(row.value);
    if (!Number.isFinite(v)) continue;
    if (!byPeriod.has(code)) byPeriod.set(code, []);
    byPeriod.get(code)!.push(v);
  }
  const periods = timeCodes.map(
    (c) => timeVar.valueTexts?.[timeVar.values.indexOf(c)] ?? c
  );
  const values = timeCodes.map((c) => {
    const arr = byPeriod.get(c) ?? [];
    if (useFirst) return arr.length ? arr[0]! : null;
    const sum = arr.reduce((a, b) => a + b, 0);
    return arr.length ? sum : null;
  });
  const valid = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (valid.length === 0) return { periods: [], values: [] };
  const outValues = values.map((v) => (v != null && Number.isFinite(v) ? v : 0));
  return {
    periods: [...periods].reverse(),
    values: outValues.reverse(),
  };
}

// Гадаад худалдааны card-ын chart – сүүлийн сараар (жишээ: 2026-02 бол 2025-02, 2024-02, ... ижил сарын цэгүүд)
const FOREIGN_TRADE_SAME_MONTH_STEP = 12;
const FOREIGN_TRADE_SAME_MONTH_YEARS = 10;

export async function getForeignTradeCardTrend(apiUrl: string): Promise<TrendResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find((v) => v.code === "Сар" || v.text === "Сар");
  const indicatorVar = metadata.variables.find((v) => v.code === "Гадаад худалдааны үндсэн үзүүлэлт");
  if (!timeVar || !indicatorVar) return { periods: [], values: [] };

  // Ижил сар жил бүр: индекс 0 = сүүлийн сар, 12 = өмнөх жилийн ижил сар, 24 = 2 жилийн өмнө ...
  const sameMonthIndices: string[] = [];
  for (let i = 0; i < FOREIGN_TRADE_SAME_MONTH_YEARS; i++) {
    const idx = i * FOREIGN_TRADE_SAME_MONTH_STEP;
    if (idx >= timeVar.values.length) break;
    sameMonthIndices.push(String(timeVar.values[idx]));
  }
  if (sameMonthIndices.length === 0) return { periods: [], values: [] };

  const query: PxDataRequest["query"] = [
    {
      code: indicatorVar.code,
      selection: { filter: "item", values: ["0"] },
    },
    {
      code: timeVar.code,
      selection: { filter: "item", values: sameMonthIndices },
    },
  ];

  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const codeKey = `${timeVar.code}_code`;
  const byCode = new Map<string, number>();

  for (const row of rows) {
    const code = String(row[codeKey] ?? row[timeVar.code] ?? "").trim();
    const v = Number(row.value);
    if (!Number.isFinite(v)) continue;
    byCode.set(code, (byCode.get(code) ?? 0) + v);
  }

  // Хуучин → шинэ дараалал (жишээ: 2024-02, 2025-02, 2026-02)
  const timeCodesChronological = [...sameMonthIndices].reverse();
  const periods = timeCodesChronological.map((c) => timeVar.valueTexts?.[timeVar.values.indexOf(c)] ?? c);
  const values = timeCodesChronological.map((c) => byCode.get(c) ?? 0);

  const valid = values.filter((v) => Number.isFinite(v));
  if (!valid.length) return { periods: [], values: [] };
  return { periods, values };
}

// Улсын төсвийн card-ын chart – сүүлийн сараар (жишээ: 2026-02 бол 2025-02, 2024-02, ... ижил сарын цэгүүд)
const STATE_BUDGET_SAME_MONTH_STEP = 12;
const STATE_BUDGET_SAME_MONTH_YEARS = 10;

export async function getStateBudgetCardTrend(apiUrl: string): Promise<TrendResult> {
  const metadata = await fetchPxMetadata(apiUrl);
  const timeVar = metadata.variables.find((v) => v.code === "Он" || v.text === "Он");
  if (!timeVar || !timeVar.values.length) return { periods: [], values: [] };

  const sameMonthIndices: string[] = [];
  for (let i = 0; i < STATE_BUDGET_SAME_MONTH_YEARS; i++) {
    const idx = i * STATE_BUDGET_SAME_MONTH_STEP;
    if (idx >= timeVar.values.length) break;
    sameMonthIndices.push(String(timeVar.values[idx]));
  }
  if (sameMonthIndices.length === 0) return { periods: [], values: [] };

  const query: PxDataRequest["query"] = metadata.variables.map((v) => {
    if (v.code === timeVar.code) {
      return { code: v.code, selection: { filter: "item" as const, values: sameMonthIndices } };
    }
    if (v.code === "Үзүүлэлт") {
      return { code: v.code, selection: { filter: "item" as const, values: ["0"] } };
    }
    if (v.code === "Ангилал") {
      return { code: v.code, selection: { filter: "item" as const, values: ["4"] } };
    }
    return { code: v.code, selection: { filter: "item" as const, values: v.values } };
  });

  const dataset = await fetchPxData(apiUrl, { query, response: { format: "json-stat2" } });
  const rows = jsonStatToRows(dataset);
  const codeKey = `${timeVar.code}_code`;
  const byCode = new Map<string, number>();

  for (const row of rows) {
    const code = String(row[codeKey] ?? row[timeVar.code] ?? "").trim();
    const v = Number(row.value);
    if (!Number.isFinite(v)) continue;
    byCode.set(code, (byCode.get(code) ?? 0) + v);
  }

  const timeCodesChronological = [...sameMonthIndices].reverse();
  const periods = timeCodesChronological.map((c) => timeVar.valueTexts?.[timeVar.values.indexOf(c)] ?? c);
  const values = timeCodesChronological.map((c) => byCode.get(c) ?? 0);

  const valid = values.filter((v) => Number.isFinite(v));
  if (!valid.length) return { periods: [], values: [] };
  return { periods, values };
}

function formatNumberWithDots(value: number): string {
  const rounded = Math.round(value);
  const str = String(rounded);
  const parts: string[] = [];
  for (let i = str.length - 1, count = 0; i >= 0; i--, count++) {
    if (count > 0 && count % 3 === 0) parts.unshift(".");
    parts.unshift(str[i]);
  }
  return parts.join("");
}

export function formatKpiValue(
  value: number | null,
  format: "number" | "percent" | "index-to-percent" | undefined
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (format === "index-to-percent") {
    const change = value - 100;
    return `${change.toFixed(1)}%`;
  }
  if (format === "percent") return `${value.toFixed(1)}%`;
  return formatNumberWithDots(value);
}
