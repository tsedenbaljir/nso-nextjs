export type LocalizedText = {
  mn: string;
  en: string;
};

export type PxRow = Record<string, string | number | null>;

export type IntroIconName =
  | "temple"
  | "people"
  | "book"
  | "dharma"
  | "church"
  | "mosque"
  | "other"
  | "poverty"
  | "gini"
  | "subsistence"
  | "insured"
  | "pensioner"
  | "avgPension"
  | "welfare"
  | "sdg"
  | "child"
  | "elder";

export type IntroValueFormat = "count" | "percent" | "decimal" | "currency";

export type IntroTableConfig = {
  /** Widget-үүд энэ id-аар хүснэгтийг заана. */
  id: string;
  file: string;
  /** Нэмэлт PX файлууд — мөрийг нэгтгэнэ (ж: 1995–2020 + 2022). */
  files?: string[];
  /** PX дэд хавтас, ж: "INEQUALITY, Gini index, Theil index" */
  subtables?: string;
  label: LocalizedText;
  icon?: IntroIconName;
  unit?: LocalizedText;
  format?: IntroValueFormat;
  /** Энэ хүснэгтийн газар зүйн хэмжээс. Өгөөгүй бол config.dimensions.geo. */
  geo?: string;
  /** national мөр байхгүй бол бүсийн дундаж. */
  nationalMode?: "code" | "average";
  /** PX dimension code -> value codes. Өгөөгүй бол бүх утгыг авна. */
  select?: Record<string, string[]>;
};

export type IntroDimensions = {
  time: string;
  /** Шашин, хүйс, насны бүлэг гэх мэт задгай хэмжээс. */
  category?: string;
  geo?: string;
};

export type IntroGeoConfig = {
  nationalCode?: string;
  /** Аймгийн графикаас хасах бүсийн код (Баруун бүс, Хангайн бүс, ...). */
  groupCodes?: string[];
};

export type IntroWidgetSpan = "full" | "half";

export type KpiWidget = {
  type: "kpis";
  span?: IntroWidgetSpan;
  tables?: string[];
};

export type CategoryFlowWidget = {
  type: "category-flow";
  span?: IntroWidgetSpan;
  source: string;
  target: string;
  extra?: string;
  colors?: Record<string, string>;
  categoryIcons?: Record<string, IntroIconName>;
};

export type TrendYAxisMode = "fromZero" | "nice";

export type TrendWidget = {
  type: "trend";
  span?: IntroWidgetSpan;
  tables?: string[];
  /** fromZero = тоо. nice = хувь/индекс, өгөгдлийн хүрээгээр. */
  yAxis?: TrendYAxisMode;
  height?: number;
};

export type RegionBarsWidget = {
  type: "region-bars";
  span?: IntroWidgetSpan;
  table: string;
  title?: LocalizedText;
  /** "aimags" = бүсийн группийг хасна. "all" = тухайн жилийн бүх газар. */
  geoMode?: "aimags" | "all";
};

export type RegionMapLayout = {
  aspectScale?: number;
  layoutCenter?: [string, string];
  layoutSize?: string;
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
  legend?: "horizontal" | "vertical";
  height?: number;
};

export type RegionMapWidget = {
  type: "region-map";
  span?: IntroWidgetSpan;
  table: string;
  layout?: RegionMapLayout;
};

export type CategoryStatsWidget = {
  type: "category-stats";
  span?: IntroWidgetSpan;
  table: string;
  dimension: string;
  totals?: string[];
  title?: LocalizedText;
};

export type CategoryBarsWidget = {
  type: "category-bars";
  span?: IntroWidgetSpan;
  table: string;
  dimension: string;
  title?: LocalizedText;
  labelMap?: Record<string, string>;
  height?: number;
};

export type IntroWidget =
  | KpiWidget
  | CategoryFlowWidget
  | CategoryStatsWidget
  | CategoryBarsWidget
  | TrendWidget
  | RegionBarsWidget
  | RegionMapWidget;

export type IntroDashboardConfig = {
  id: string;
  /** PX folder id, e.g. "Monasteries, Temples and Churches" */
  subsector: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  dimensions: IntroDimensions;
  geo?: IntroGeoConfig;
  totals?: string[];
  palette?: string[];
  mapColors?: string[];
  sectionIcons?: { trend?: string; map?: string };
  tables: IntroTableConfig[];
  /** Салбар бүрт өөр байж болно — ижил загварт шахах шаардлагагүй. */
  widgets: IntroWidget[];
};

export type IntroTableData = {
  id: string;
  label: string;
  icon?: IntroIconName;
  unit?: string;
  format?: IntroValueFormat;
  geo?: string;
  nationalMode?: "code" | "average";
  rows: PxRow[];
};
