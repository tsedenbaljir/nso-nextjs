import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const INEQUALITY_FOLDER = "INEQUALITY, Gini index, Theil index";

export const poverty: IntroDashboardConfig = {
  id: "poverty",
  subsector: "Poverty, inequality and minimum subsistence level",
  title: {
    mn: "Ядуурал, тэгш бус байдал, амьжиргааны доод түвшин",
    en: "Poverty, inequality and minimum subsistence level",
  },
  subtitle: { mn: "улсын хэмжээнд", en: "nationwide" },
  dimensions: {
    time: "Он",
    geo: "Аймаг",
  },
  tables: [
    {
      id: "poverty",
      file: "DT_NSO_1900_007V1.px",
      files: ["DT_NSO_1900_007V12.px"],
      label: { mn: "Ядуурлын хамралтын хүрээ", en: "Poverty headcount" },
      icon: "poverty",
      format: "percent",
      geo: "Суурьшил",
      select: { Үзүүлэлт: ["0"] },
    },
    {
      id: "gini",
      file: "DT_NSO_1900_036V1.px",
      subtables: INEQUALITY_FOLDER,
      label: { mn: "Жини коэффициент", en: "Gini coefficient" },
      icon: "gini",
      format: "decimal",
      geo: "Суурьшил",
      select: { Үзүүлэлт: ["0"] },
    },
    {
      id: "adt",
      file: "DT_NSO_1900_010V1.px",
      label: { mn: "Амьжиргааны доод түвшин", en: "Minimum subsistence level" },
      unit: { mn: "төг / хүн / сар", en: "MNT / person / month" },
      icon: "subsistence",
      format: "currency",
      geo: "Бүс",
      nationalMode: "average",
    },
    {
      id: "povertyMap",
      file: "DT_NSO_1900_035V1.px",
      label: { mn: "Ядуурлын хамралтын хүрээ", en: "Poverty headcount" },
      format: "percent",
      geo: "Аймаг",
      select: { Үзүүлэлт: ["0"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["poverty", "gini", "adt"] },
    { type: "trend", tables: ["poverty"], yAxis: "nice" },
    {
      type: "region-map",
      table: "povertyMap",
      layout: {
        legend: "horizontal",
        aspectScale: 1.05,
        left: 8,
        right: 8,
        top: 22,
        bottom: 56,
      },
    },
    {
      type: "region-bars",
      table: "adt",
      geoMode: "all",
      span: "full",
      title: { mn: "АДТ, бүсээр", en: "Minimum subsistence by region" },
    },
  ],
};
