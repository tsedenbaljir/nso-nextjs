import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const FILE = "DT_NSO_4000_001.px";

export const sdg: IntroDashboardConfig = {
  id: "sdg",
  subsector: "Sustainable Development Goals",
  title: {
    mn: "Тогтвортой хөгжлийн зорилго",
    en: "Sustainable Development Goals",
  },
  subtitle: { mn: "1.2.1 · үндэсний ядуурлын түвшин", en: "1.2.1 · national poverty line" },
  palette: ["#E5243B", "#1A5CAD", "#0E7C7B", "#5B6B80"],
  dimensions: {
    time: "ОН",
  },
  tables: [
    {
      id: "rate",
      file: FILE,
      label: { mn: "Ядуурлын түвшин", en: "Poverty rate" },
      icon: "sdg",
      format: "percent",
      select: { Үзүүлэлт: ["0"] },
    },
    {
      id: "child",
      file: FILE,
      label: { mn: "0–18 нас", en: "Age 0–18" },
      icon: "child",
      format: "percent",
      select: { Үзүүлэлт: ["3"] },
    },
    {
      id: "elderly",
      file: FILE,
      label: { mn: "60+ нас", en: "Age 60+" },
      icon: "elder",
      format: "percent",
      select: { Үзүүлэлт: ["8"] },
    },
    {
      id: "ages",
      file: FILE,
      label: { mn: "Насны бүлгээр", en: "By age group" },
      format: "percent",
      select: { Үзүүлэлт: ["3", "4", "5", "6", "7", "8"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["rate", "child", "elderly"] },
    {
      type: "category-bars",
      table: "ages",
      dimension: "Үзүүлэлт",
      span: "full",
      height: 300,
      labelMap: { "60<": "60+" },
      title: { mn: "Ядуурлын түвшин, насны бүлгээр", en: "Poverty rate by age group" },
    },
    { type: "trend", tables: ["rate", "child"], yAxis: "nice", span: "full", height: 300 },
  ],
};
