import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const FILE = "DT_NSO_0100_001V10_year.px";

export const balanceOfPayments: IntroDashboardConfig = {
  id: "balance-of-payments",
  subsector: "Balance of Payments",
  title: { mn: "Төлбөрийн тэнцэл", en: "Balance of payments" },
  subtitle: { mn: "жилийн хураангуй, сая $", en: "annual summary, million $" },
  palette: ["#0F6A6A", "#1A5CAD", "#C45A2A", "#5B6B80"],
  dimensions: { time: "Жил" },
  tables: [
    {
      id: "current",
      file: FILE,
      label: { mn: "Урсгал данс", en: "Current account" },
      unit: { mn: "сая $", en: "million $" },
      icon: "bop",
      format: "decimal",
      select: { Үзүүлэлт: ["1"] },
    },
    {
      id: "goods",
      file: FILE,
      label: { mn: "Бараа", en: "Goods" },
      unit: { mn: "сая $", en: "million $" },
      icon: "goods",
      format: "decimal",
      select: { Үзүүлэлт: ["5"] },
    },
    {
      id: "services",
      file: FILE,
      label: { mn: "Үйлчилгээ", en: "Services" },
      unit: { mn: "сая $", en: "million $" },
      icon: "services",
      format: "decimal",
      select: { Үзүүлэлт: ["8"] },
    },
    {
      id: "reserves",
      file: FILE,
      label: { mn: "Нөөц хөрөнгө", en: "Reserve assets" },
      unit: { mn: "сая $", en: "million $" },
      icon: "reserves",
      format: "decimal",
      select: { Үзүүлэлт: ["67"] },
    },
    {
      id: "otherAccounts",
      file: FILE,
      label: { mn: "Бусад данс", en: "Other accounts" },
      unit: { mn: "сая $", en: "million $" },
      format: "decimal",
      select: { Үзүүлэлт: ["20", "26", "30", "37"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["current", "goods", "services", "reserves"] },
    {
      type: "category-stats",
      table: "otherAccounts",
      dimension: "Үзүүлэлт",
      labelMap: {
        "3. Анхдагч орлого": "Анхдагч орлого",
        "4. Хоёрдогч орлого": "Хоёрдогч орлого",
        "II. ХӨРӨНГИЙН ДАНС": "Хөрөнгийн данс",
        "III. САНХҮҮГИЙН ДАНС": "Санхүүгийн данс",
      },
      title: { mn: "Орлого, хөрөнгө, санхүүгийн данс", en: "Income, capital and financial accounts" },
    },
    {
      type: "trend",
      tables: ["current", "goods", "reserves"],
      yAxis: "nice",
      span: "full",
      height: 320,
      title: { mn: "Урсгал данс, бараа, нөөц хөрөнгө", en: "Current account, goods, reserves" },
    },
  ],
};
