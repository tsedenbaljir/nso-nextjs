import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const FILE = "DT_NSO_4000_001.px";
const SOCIETY = "Society, development";
const POVERTY_SUB = "Poverty, inequality and minimum subsistence level";

const SEX_LABELS = {
  "Ядуурлын үндэсний түвшнээс доогуур амьжиргаатай эрэгтэйчүүдийн эзлэх хувь": {
    mn: "Эрэгтэй",
    en: "Male",
  },
  "Ядуурлын үндэсний түвшнээс доогуур амьжиргаатай эмэгтэйчүүдийн эзлэх хувь": {
    mn: "Эмэгтэй",
    en: "Female",
  },
} as const;

const AGE_LABEL_MAP: Record<string, string> = {
  "0-18": "0–18",
  "19-29": "19–29",
  "30-39": "30–39",
  "40-49": "40–49",
  "50-59": "50–59",
  "60<": "60+",
};

export const sdg: IntroDashboardConfig = {
  id: "sdg",
  subsector: "Sustainable Development Goals",
  title: {
    mn: "Тогтвортой хөгжлийн зорилго",
    en: "Sustainable Development Goals",
  },
  subtitle: {
    mn: "SDG 1.2.1 · ядуурал, хүйс, нас",
    en: "SDG 1.2.1 · poverty by sex and age",
  },
  palette: ["#E5243B", "#12658F", "#C2185B", "#1A5CAD", "#0E7C7B", "#5B6B80"],
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
      id: "male",
      file: FILE,
      label: SEX_LABELS["Ядуурлын үндэсний түвшнээс доогуур амьжиргаатай эрэгтэйчүүдийн эзлэх хувь"],
      icon: "male",
      format: "percent",
      select: { Үзүүлэлт: ["1"] },
    },
    {
      id: "female",
      file: FILE,
      label: SEX_LABELS["Ядуурлын үндэсний түвшнээс доогуур амьжиргаатай эмэгтэйчүүдийн эзлэх хувь"],
      icon: "female",
      format: "percent",
      select: { Үзүүлэлт: ["2"] },
    },
    {
      id: "ages",
      file: FILE,
      label: { mn: "Насны бүлгээр", en: "By age group" },
      format: "percent",
      select: { Үзүүлэлт: ["3", "4", "5", "6", "7", "8"] },
    },
    {
      id: "povertyTrend",
      file: "DT_NSO_1900_007V1.px",
      files: ["DT_NSO_1900_007V12.px"],
      sourceSector: SOCIETY,
      sourceSubsector: POVERTY_SUB,
      label: { mn: "Ядуурлын хамралтын хүрээ", en: "Poverty headcount" },
      format: "percent",
      time: "Он",
      geo: "Суурьшил",
      select: { Үзүүлэлт: ["0"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["rate", "male", "female"] },
    {
      type: "category-bars",
      table: "ages",
      dimension: "Үзүүлэлт",
      layout: "horizontal",
      labelMap: AGE_LABEL_MAP,
      title: { mn: "Ядуурал, насны бүлгээр", en: "Poverty by age group" },
    },
    {
      type: "trend",
      tables: ["povertyTrend"],
      yAxis: "nice",
      title: { mn: "Ядуурлын түвшин, жилийн явц", en: "Poverty rate over time" },
    },
  ],
};
