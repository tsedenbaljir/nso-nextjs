import { pctChange } from "@/lib/commodity-price-dashboard/format";

const URL =
  "https://data.1212.mn/api/v1/mn/NSO/Economy, environment/Consumer Price Index/DT_NSO_0600_001V4.px";

const QUERY = {
  query: [
    {
      code: "Бүтээгдэхүүн",
      selection: {
        filter: "item",
        values: [...Array.from({ length: 30 }, (_, i) => String(i + 2)), ""],
      },
    },
    {
      code: "Хугацаа",
      selection: {
        filter: "item",
        values: Array.from({ length: 284 }, (_, i) => String(i)),
      },
    },
  ],
  response: { format: "json-stat2" },
};

type JsonStat2 = {
  label: string;
  updated?: string;
  id: string[];
  size: number[];
  dimension: Record<
    string,
    {
      label: string;
      category: {
        index: Record<string, number> | string[];
        label: Record<string, string>;
      };
    }
  >;
  value: Array<number | null>;
};

export type PriceRow = {
  product: string;
  values: Array<number | null>;
  latest: number | null;
  weekAgo: number | null;
  monthAgo: number | null;
  yearAgo: number | null;
  wow: number | null;
  mom: number | null;
  yoy: number | null;
};

const ALLOWED_PRODUCTS = [
  "Үхрийн мах, ястай, кг",
  "Үхрийн мах, цул, кг",
  "Хонины мах, ястай, кг",
  "Ямааны мах, ястай, кг",
  "Адууны мах, ястай, кг",
  "Гурил, дээд зэрэг, савласан, 1 кг",
  "Гурил, I зэрэг, савласан, кг",
  "Талх, 600 гр",
  "Талх, зүссэн, 600 гр",
  "Хар талх, 300 гр",
  "Сүү, ууттай, 0.5 л",
  "Сүү, савтай, л",
  "Тараг, савласан, 900 гр",
  "Өндөг, ш",
  "Цөцгийн тос, 200 гр",
  "Ногоон цай, савласан, 90 г",
  "Аи-92 автобензин, л",
  "Дизелийн түлш, л",
];

const ALLOWED_INDEX = new Map(ALLOWED_PRODUCTS.map((name, i) => [name, i]));

export function productNo(name: string) {
  const index = ALLOWED_INDEX.get(name);
  return index == null ? null : index + 1;
}

export function catalogIndex(name: string) {
  return ALLOWED_INDEX.get(name) ?? Number.MAX_SAFE_INTEGER;
}

export const WEEK_OFFSETS = {
  yearAgo: 54,
  monthAgo: 4,
  prevWeek: 1,
  thisWeek: 0,
} as const;

export type PeriodKey = keyof typeof WEEK_OFFSETS;

export type Periods = Record<
  PeriodKey,
  { weeks: number; date: string }
>;

export type PriceTable = {
  title: string;
  updated: string | null;
  times: string[];
  periods: Periods;
  rows: PriceRow[];
};

function categoryOrder(index: Record<string, number> | string[]) {
  if (Array.isArray(index)) return index;
  return Object.entries(index)
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code);
}

export async function fetchPriceTable(): Promise<PriceTable> {
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(QUERY),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`NSO API ${res.status}`);
  }

  const data = (await res.json()) as JsonStat2;
  const [productKey, timeKey] = data.id;
  const productDim = data.dimension[productKey];
  const timeDim = data.dimension[timeKey];
  const products = categoryOrder(productDim.category.index).map(
    (code) => productDim.category.label[code] ?? code,
  );
  const times = categoryOrder(timeDim.category.index).map(
    (code) => timeDim.category.label[code] ?? code,
  );

  const yearIdx = WEEK_OFFSETS.yearAgo;
  const monthIdx = WEEK_OFFSETS.monthAgo;
  const weekIdx = WEEK_OFFSETS.prevWeek;

  const periods: Periods = {
    yearAgo: { weeks: yearIdx, date: times[yearIdx] ?? "" },
    monthAgo: { weeks: monthIdx, date: times[monthIdx] ?? "" },
    prevWeek: { weeks: weekIdx, date: times[weekIdx] ?? "" },
    thisWeek: { weeks: 0, date: times[0] ?? "" },
  };

  const rows = products
    .map((product, i) => {
      const start = i * times.length;
      const values = times.map((_, j) => data.value[start + j] ?? null);
      const latest = values[0] ?? null;
      const weekAgo = values[weekIdx] ?? null;
      const monthAgo = values[monthIdx] ?? null;
      const yearAgo = values[yearIdx] ?? null;
      return {
        product,
        values,
        latest,
        weekAgo,
        monthAgo,
        yearAgo,
        wow: pctChange(latest, weekAgo),
        mom: pctChange(latest, monthAgo),
        yoy: pctChange(latest, yearAgo),
      };
    })
    .filter((row) => ALLOWED_INDEX.has(row.product))
    .sort(
      (a, b) => (ALLOWED_INDEX.get(a.product) ?? 0) - (ALLOWED_INDEX.get(b.product) ?? 0),
    );

  return {
    title: data.label,
    updated: data.updated ?? times[0] ?? null,
    times,
    periods,
    rows,
  };
}
