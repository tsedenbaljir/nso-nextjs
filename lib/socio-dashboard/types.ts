export interface PxVariable {
  code: string;
  text: string;
  values: string[];
  valueTexts: string[];
}

export interface PxMetadata {
  title: string;
  variables: PxVariable[];
}

export interface PxQueryItem {
  code: string;
  selection: {
    filter: string;
    values: string[];
  };
}

export interface PxDataRequest {
  query: PxQueryItem[];
  response: { format: "json-stat2" };
}

export interface JsonStatCategory {
  index?: Record<string, number> | string[];
  label?: Record<string, string>;
}

export interface JsonStatDimension {
  label?: string;
  category?: JsonStatCategory;
}

export interface JsonStatDataset {
  version?: string;
  class?: string;
  label?: string;
  id?: string[];
  size?: number[];
  value?: (number | null)[] | Record<string, number | null>;
  dimension?: Record<string, JsonStatDimension>;
  updated?: string;
  source?: string;
}

export interface DashboardConfig {
  id: string;
  name: string;
  category?: string;
  shortTitle?: string;
  description?: string;
  apiUrl?: string;
  percent?: number | string;
  apiUrlByLevel?: Record<string, string>;
  apiUrlByLevelMonthlyChange?: Record<string, string>;
  housingChangeUrl?: string;
  primaryDimension?: string;
  charts?: ChartConfig[];
  lastUpdated?: string;
  kpiValue?: string;
  kpiPeriod?: string;
  kpiFromApi?: boolean;
  kpiApiUrl?: string;
  kpiFormat?: "number" | "percent" | "index-to-percent";
  kpiSelections?: Record<string, string[]>;
  kpiTimeDimension?: string;
  kpiLabel?: string;
  /** KPI утгын ард нэмэх suffix (жишээ: "%") */
  kpiValueSuffix?: string;
  /** KPI утгыг нууж зөвхөн label харуулах */
  hideKpiValue?: boolean;
  /** API-с growth percent авах (жишээ: { dimension: "Статистик үзүүлэлт", valueCode: "4" }) */
  kpiGrowthFromApi?: { dimension: string; valueCode: string; mainValueCode: string };
  /** GDP indicator filter (Статистик үзүүлэлт) */
  gdpIndicatorFilter?: {
    dimension: string;
    options: { code: string; label: string }[];
    defaultCode: string;
  };
  trendApiUrl?: string;
  trendTimeDimension?: string;
  trendSelections?: Record<string, string[]>;
  trendPoints?: number;
  /** Card chart-н сүүлийн утганд нэмэх suffix (жишээ: "%") */
  trendValueSuffix?: string;
  showMapPlaceholder?: boolean;
  mapApiUrl?: string;
  mapDimension?: string;
  /** "soum" = sum-level map (сумаар), need soum.geojson and sum-level Бүс data */
  mapLevel?: "aimag" | "soum";
  introText?: string;
  dataSourceLinks?: { label: string; url: string }[];
  twoColumnLayout?: {
    leftLabel: string;
    rightLabel: string;
    leftChartIds: string[];
    rightChartIds: string[];
    bottomFullWidthChartIds?: string[];
  };
  /** 3 chart зэрэгцүүлж харуулах (grid-cols-3) */
  threeColumnChartIds?: string[];
  /** Боловсрол: slicer-ийн доор бүтэн өргөнтэй харуулах chart (жишээ: education-graduates) */
  educationBottomChartId?: string;
  /** Боловсрол: нэгтгэсэн slicer — Ангилал (СУРГУУЛИЙН ТОО)-н кодыг бусад chart-д map: { chartId: { schoolsCode: targetCode } } */
  educationAngilalCodeMap?: Record<string, Record<string, string>>;
  /** Төрөлтийн ерөнхий коэффициентийг бүсээр газрын зураг дээр харуулах (024 API, Бүс + Он) */
  birthRateMapApiUrl?: string;
  birthRateMapDimension?: string;
  /** Нас баралтын ерөнхий коэффициентийг бүсээр газрын зураг дээр харуулах (024V2 API, Хүйс, Бүс, Он) */
  deathRateMapApiUrl?: string;
  deathRateMapDimension?: string;
  /** Дундаж наслалтыг аймгаар газрын зураг дээр харуулах (030V1 API, Хүйс, Аймаг, Он) */
  lifeExpectancyMapApiUrl?: string;
  lifeExpectancyMapDimension?: string;
  /** Улсын дундаж наслалт (039V1 API) */
  lifeExpectancyNationalApiUrl?: string;
  /** Card нь өөр хуудас руу линклэнэ (жишээ: /population/by-region) */
  cardHref?: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  description?: string;
  type: "line" | "bar" | "area" | "combo" | "pyramid";
  xDimension: string;
  seriesDimensions?: string[];
  showGrowth?: boolean;
  excludeSeriesLabels?: string[];
  yearSlicerDimension?: string;
  excludeXLabels?: string[];
  regionFilterDimension?: string;
  filterToLatestDimension?: string;
  filterToSingleValue?: Record<string, string>;
  defaultSeriesCodes?: Record<string, string[]>;
  chartApiUrl?: string;
  chartFixedQuery?: PxDataRequest;
  chartApiUrlByCpiMode?: { yearly: string; monthly: string };
  computedFormula?: "births-minus-deaths" | "budget-balance" | "budget-balance-cumulative" | "foreign-trade-balance" | "foreign-trade-balance-cumulative";
  computedSourceCharts?: [string, string];
  chartHeight?: number;
  showOnlyForLevels?: string[];
  /** GDP sector code for filtering («Салбар» хэмжээсийн код) */
  gdpSectorCode?: string;
  /** Stacked bar chart */
  stacked?: boolean;
  /** GDP vertical stacked bar chart */
  gdpVerticalStackedBar?: boolean;
  /** Chart color variant */
  colorVariant?: "default" | "muted" | "orange";
}

export interface DataRow {
  [dimensionOrValue: string]: string | number | null;
}
