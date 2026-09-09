import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const DISABILITY_TYPE = "Хөгжлийн бэрхшээлийн хэлбэр";
const TOTALS = ["Бүгд", "Нийт", "Total", "All"];
const REGIONAL_FILE = "DT_NSO_3900_002V1.px";

export const disability: IntroDashboardConfig = {
  id: "disability",
  subsector: "Disability",
  title: {
    mn: "Хөгжлийн бэрхшээлтэй хүний тоо",
    en: "Persons with disabilities",
  },
  subtitle: { mn: "хүйс, хэлбэр, аймаг, нийслэлээр", en: "by sex, disability type and region" },
  palette: ["#12658F", "#8A146F", "#EF9A00", "#E40418"],
  mapColors: ["#E8F1FA", "#ADCDE8", "#5B9BC9", "#12658F"],
  dimensions: { time: "Он", geo: "Бүс" },
  // This table uses code 5 for Ulaanbaatar itself, not a duplicate region group.
  geo: { nationalCode: "0", groupCodes: ["0", "1", "2", "3", "4"] },
  totals: TOTALS,
  tables: [
    {
      id: "disability",
      file: REGIONAL_FILE,
      label: { mn: "Нийт", en: "Total" },
      icon: "representatives",
      format: "count",
      select: { Хүйс: ["0"] },
    },
    {
      id: "male",
      file: REGIONAL_FILE,
      label: { mn: "Эрэгтэй", en: "Male" },
      icon: "male",
      format: "count",
      select: { Хүйс: ["2"] },
    },
    {
      id: "female",
      file: REGIONAL_FILE,
      label: { mn: "Эмэгтэй", en: "Female" },
      icon: "female",
      format: "count",
      select: { Хүйс: ["1"] },
    },
    {
      id: "disabilityTypes",
      file: "DT_NSO_3900_004V1.px",
      label: { mn: "Хөгжлийн бэрхшээлийн хэлбэр", en: "Type of disability" },
      format: "count",
      select: { [DISABILITY_TYPE]: ["1", "2", "3", "4", "5", "6", "7", "8"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["disability", "male", "female"] },
    {
      type: "trend",
      tables: ["male", "female"],
      title: { mn: "Хүйсээрх өөрчлөлт, жилээр", en: "Trends by sex and year" },
      yAxis: "fromZero",
      height: 400,
    },
    {
      type: "category-bars",
      table: "disabilityTypes",
      dimension: DISABILITY_TYPE,
      totals: TOTALS,
      title: { mn: "Хөгжлийн бэрхшээлийн хэлбэрийн харьцуулалт", en: "Comparison by type of disability" },
      layout: "horizontal",
      height: 400,
    },
    {
      type: "region-map",
      table: "disability",
      title: { mn: "Хөгжлийн бэрхшээлтэй хүний тоо, аймаг, нийслэлээр", en: "Persons with disabilities by aimag and capital" },
      span: "full",
      layout: {
        fitToContainer: true,
        legend: "horizontal",
        aspectScale: 0.75,
        layoutCenter: ["50%", "45%"],
        layoutSize: "85%",
        height: 460,
      },
    },
    {
      type: "region-bars",
      table: "disability",
      title: { mn: "Аймаг, нийслэлийн харьцуулалт", en: "Comparison by aimag and capital" },
      geoMode: "aimags",
      span: "full",
    },
  ],
};
