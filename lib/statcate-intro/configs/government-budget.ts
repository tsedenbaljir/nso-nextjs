import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const FILE = "DT_NSO_0800_001V1.px";
const NATIONAL = { "Улсын дүн": ["0"] };

export const governmentBudget: IntroDashboardConfig = {
  id: "government-budget",
  subsector: "Government budget",
  title: { mn: "Улсын төсөв", en: "Government budget" },
  subtitle: { mn: "нэгдсэн төсөв, татвар, орон нутаг", en: "consolidated budget, tax, local" },
  palette: ["#5B2C6F", "#1A5CAD", "#C0392B", "#0E7C7B"],
  mapColors: ["#F3E5F5", "#CE93D8", "#8E24AA", "#5B2C6F", "#3A1A4A"],
  dimensions: { time: "Он", geo: "Бүс" },
  tables: [
    {
      id: "revenue",
      file: FILE,
      label: { mn: "Тэнцвэржүүлсэн орлого", en: "Balanced revenue" },
      unit: { mn: "сая ₮", en: "million ₮" },
      icon: "budget",
      format: "currency",
      select: { ...NATIONAL, Үзүүлэлт: ["0"] },
    },
    {
      id: "expenditure",
      file: FILE,
      label: { mn: "Зарлага", en: "Expenditure" },
      unit: { mn: "сая ₮", en: "million ₮" },
      icon: "expense",
      format: "currency",
      select: { ...NATIONAL, Үзүүлэлт: ["1"] },
    },
    {
      id: "balance",
      file: FILE,
      label: { mn: "Тэнцэл", en: "Balance" },
      unit: { mn: "сая ₮", en: "million ₮" },
      icon: "balance",
      format: "currency",
      select: { ...NATIONAL, Үзүүлэлт: ["2"] },
    },
    {
      id: "taxTypes",
      file: "DT_NSO_0800_003V1.px",
      label: { mn: "Татварын орлого", en: "Tax revenue" },
      unit: { mn: "сая ₮", en: "million ₮" },
      format: "currency",
      select: { Үзүүлэлт: ["6", "11", "14", "18"] },
    },
    {
      id: "expenseTypes",
      file: "DT_NSO_0800_006V1.px",
      label: { mn: "Зарлага, төрлөөр", en: "Expenditure by type" },
      unit: { mn: "сая ₮", en: "million ₮" },
      format: "currency",
      select: { Үзүүлэлт: ["1", "8", "17"] },
    },
    {
      id: "localRevenue",
      file: "DT_NSO_0800_031V1.px",
      geo: "Бүс",
      label: { mn: "Орон нутгийн төсвийн орлого", en: "Local budget revenue" },
      unit: { mn: "сая ₮", en: "million ₮" },
      format: "currency",
    },
  ],
  widgets: [
    { type: "kpis", tables: ["revenue", "expenditure", "balance"] },
    {
      type: "category-bars",
      table: "taxTypes",
      dimension: "Үзүүлэлт",
      layout: "horizontal",
      title: { mn: "Татварын орлогын бүтэц", en: "Tax revenue by type" },
    },
    {
      type: "category-bars",
      table: "expenseTypes",
      dimension: "Үзүүлэлт",
      layout: "horizontal",
      title: { mn: "Төсвийн зарлага, төрлөөр", en: "Expenditure by type" },
    },
    { type: "trend", tables: ["revenue", "expenditure"], yAxis: "fromZero", title: { mn: "Орлого, зарлага", en: "Revenue and expenditure" } },
    {
      type: "region-map",
      table: "localRevenue",
      layout: { legend: "horizontal" },
    },
  ],
};
