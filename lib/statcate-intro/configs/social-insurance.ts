import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const INSURERS_FOLDER = "THE NUMBER OF INSURERS, by type";
const PENSION_TYPES_FOLDER =
  "NUMBER OF PENSIONARIES, WHO RECEIPT PENSIONS FROM THE SOCIAL INSURANCE FUND, by type of pension, annual";
const WELFARE_FOLDER = "PERSONS INVOLVED SOCIAL WELFARE ACTIVITIES, by type";

export const socialInsurance: IntroDashboardConfig = {
  id: "social-insurance",
  subsector: "Social Insurance and Welfare",
  title: {
    mn: "Нийгмийн даатгал, халамж",
    en: "Social insurance and welfare",
  },
  subtitle: { mn: "улсын хэмжээнд", en: "nationwide" },
  dimensions: {
    time: "Он",
    geo: "Бүс",
  },
  tables: [
    {
      id: "insurers",
      file: "DT_NSO_2200_008V3.px",
      subtables: INSURERS_FOLDER,
      label: { mn: "Даатгуулагчид", en: "Insured persons" },
      unit: { mn: "мян. хүн", en: "thousand persons" },
      icon: "insured",
      format: "decimal",
      select: { Үзүүлэлт: ["0"] },
    },
    {
      id: "pensioners",
      file: "DT_NSO_2025_04.px",
      label: { mn: "Тэтгэвэр авагчид", en: "Pensioners" },
      icon: "pensioner",
      format: "count",
    },
    {
      id: "avgPension",
      file: "DT_NSO_2025_03.px",
      label: { mn: "Сарын дундаж тэтгэвэр", en: "Average monthly pension" },
      unit: { mn: "мян. ₮ / сар", en: "thousand ₮ / month" },
      icon: "avgPension",
      format: "decimal",
      select: { Төрөл: ["7"] },
    },
    {
      id: "welfare",
      file: "DT_NSO_2200_016V1_1.px",
      subtables: WELFARE_FOLDER,
      label: { mn: "Халамжид хамрагдсан", en: "Welfare recipients" },
      unit: { mn: "мян. хүн", en: "thousand persons" },
      icon: "welfare",
      format: "decimal",
      select: { Үзүүлэлт: ["0"] },
    },
    {
      id: "pensionTypes",
      file: "DT_NSO_2200_001V1_1.px",
      subtables: PENSION_TYPES_FOLDER,
      label: { mn: "Тэтгэвэр авагчид, төрлөөр", en: "Pensioners by type" },
      unit: { mn: "мян. хүн", en: "thousand persons" },
      format: "decimal",
    },
  ],
  widgets: [
    { type: "kpis", tables: ["insurers", "pensioners", "avgPension", "welfare"] },
    {
      type: "category-stats",
      table: "pensionTypes",
      dimension: "Үзүүлэлт",
      totals: ["Тэтгэвэр авагчид", "Бүгд", "Нийт", "Total"],
      title: { mn: "Тэтгэвэр авагчид, төрлөөр", en: "Pensioners by type" },
    },
    { type: "trend", tables: ["pensioners"], yAxis: "fromZero" },
    {
      type: "region-map",
      table: "pensioners",
      layout: { legend: "horizontal" },
    },
  ],
};
