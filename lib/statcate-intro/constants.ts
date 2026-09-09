export const INTRO_COLORS = [
  "#1A5CAD",
  "#0E7C7B",
  "#3D8BDA",
  "#5B6B80",
];

export const INTRO_FONT = "'sf-pro-text', roboto";

/** Side-by-side intro chart cards share this plot height so axes line up. */
export const INTRO_HALF_CHART_HEIGHT = 320;

/** All intro region maps share this canvas height. */
export const INTRO_MAP_HEIGHT = 360;

/** Shared ECharts map inset so Mongolia renders the same size on every dashboard. */
export const INTRO_MAP_SERIES = {
  aspectScale: 1.05,
  horizontal: { left: 12, right: 12, top: 18, bottom: 52 },
  vertical: { left: 88, right: 12, top: 14, bottom: 14 },
} as const;

export const DEFAULT_TOTAL_LABELS = ["Бүгд", "Total", "All"];

export const DEFAULT_NATIONAL_CODE = "0";

/** PX бүсийн нийт + 5 бүс. Аймаг/нийслэлийн кодыг үлдээнэ. */
export const DEFAULT_GEO_GROUP_CODES = ["0", "1", "2", "3", "4", "5"];

export const COPY = {
  year: { mn: "Он", en: "Year" },
  trend: { mn: "Жилийн явц", en: "Trend" },
  byRegion: { mn: "Аймаг, нийслэлээр", en: "By region" },
  loadError: { mn: "Өгөгдөл татахад алдаа гарлаа.", en: "Could not load data." },
} as const;

export const INTRO_SECTION_IMAGES = {
  trend: "/icons/religion/trend.png",
  map: "/icons/religion/map.png",
} as const;
