import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const FILE = "DT_NSO_1400_001V1_year.px";

export const foreignTrade: IntroDashboardConfig = {
  id: "foreign-trade",
  subsector: "Foreign Trade",
  title: { mn: "Гадаад худалдаа", en: "Foreign trade" },
  subtitle: { mn: "эргэлт, тэнцэл, гол нэрийн бараа", en: "turnover, balance, main products" },
  palette: ["#1A5CAD", "#C0392B", "#0E7C7B", "#5B6B80"],
  dimensions: { time: "Он" },
  tables: [
    {
      id: "turnover",
      file: FILE,
      label: { mn: "Нийт эргэлт", en: "Total turnover" },
      unit: { mn: "сая $", en: "million $" },
      icon: "trade",
      format: "decimal",
      select: { "Гадаад худалдааны үндсэн үзүүлэлт": ["0"] },
    },
    {
      id: "export",
      file: FILE,
      label: { mn: "Экспорт", en: "Exports" },
      unit: { mn: "сая $", en: "million $" },
      icon: "export",
      format: "decimal",
      select: { "Гадаад худалдааны үндсэн үзүүлэлт": ["1"] },
    },
    {
      id: "import",
      file: FILE,
      label: { mn: "Импорт", en: "Imports" },
      unit: { mn: "сая $", en: "million $" },
      icon: "import",
      format: "decimal",
      select: { "Гадаад худалдааны үндсэн үзүүлэлт": ["2"] },
    },
    {
      id: "balance",
      file: FILE,
      label: { mn: "Тэнцэл", en: "Balance" },
      unit: { mn: "сая $", en: "million $" },
      icon: "balance",
      format: "decimal",
      select: { "Гадаад худалдааны үндсэн үзүүлэлт": ["3"] },
    },
    {
      id: "exportProducts",
      file: "DT_NSO_1400_006V2_year.px",
      label: { mn: "Экспортын гол нэрийн бараа", en: "Main export products" },
      unit: { mn: "мян. $", en: "thousand $" },
      format: "currency",
      select: { "Статистик үзүүлэлт": ["1"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["turnover", "export", "import", "balance"] },
    { type: "trend", tables: ["export", "import", "balance"], yAxis: "nice", span: "full", height: 300, title: { mn: "Экспорт, импорт, тэнцэл", en: "Exports, imports, balance" } },
    {
      type: "category-bars",
      table: "exportProducts",
      dimension: "Гол нэр төрлийн бараа",
      layout: "horizontal",
      span: "full",
      top: 8,
      title: { mn: "Экспортын гол нэрийн бараа", en: "Main export products" },
    },
  ],
};
