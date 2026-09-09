import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const SECTOR_LABELS = {
  "Хөдөө аж ахуй, ойн аж ахуй, загас барилт, ан агнуур": "Хөдөө аж ахуй",
  "Цахилгаан, хий, уур, агааржуулалтын хангамж": "Цахилгаан, хий, уур",
  "Усан хангамж; бохир ус, хог,хаягдлын менежмент болон цэвэрлэх үйл ажиллагаа": "Усан хангамж",
  "Бөөний болон жижиглэн худалдаа,машин, мотоциклийн засвар үйлчилгээ": "Худалдаа",
  "Бөөний болон жижиглэн худалдаа, машин, мотоциклийн засвар, үйлчилгээ": "Худалдаа",
  "Тээвэр ба агуулахын үйл ажиллагаа": "Тээвэр",
  "Зочид буудал, байр, сууц болон нийтийн хоолны үйлчилгээ": "Зочид буудал, хоол",
  "Байр, сууц болон хоол хүнсээр үйлчлэх үйл ажиллагаа": "Хоол, байр",
  "Санхүүгийн болон даатгалын үйл ажиллагаа": "Санхүү, даатгал",
  "Мэргэжлийн, шинжлэх ухаан, техникийн; захиргааны, дэмжлэг үзүүлэх үйл ажиллагаа": "Мэргэжлийн, захиргаа",
};

export const productivity: IntroDashboardConfig = {
  id: "productivity",
  subsector: "Productivity",
  title: { mn: "Бүтээмж", en: "Productivity" },
  subtitle: { mn: "хөдөлмөрийн бүтээмж, салбараар", en: "labour productivity by industry" },
  palette: ["#0E7C7B", "#1A5CAD", "#C0392B", "#5B6B80"],
  dimensions: { time: "Он" },
  tables: [
    {
      id: "level",
      file: "DT_NSO_0500_010V2.px",
      label: { mn: "Нэг ажиллагчид ногдох ДНБ", en: "GDP per worker" },
      unit: { mn: "мян. ₮", en: "thousand ₮" },
      icon: "productivity",
      format: "decimal",
      select: { Үзүүлэлт: ["0"], Салбар: ["0"] },
    },
    {
      id: "change",
      file: "DT_NSO_2500_001V2.px",
      label: { mn: "Бизнесийн секторын бүтээмж", en: "Business-sector productivity" },
      icon: "growth",
      format: "percent",
      select: { Салбар: ["0"] },
    },
    {
      id: "bySector",
      file: "DT_NSO_0500_010V2.px",
      label: { mn: "Хөдөлмөрийн бүтээмж, салбараар", en: "Labour productivity by industry" },
      unit: { mn: "мян. ₮", en: "thousand ₮" },
      format: "decimal",
      select: { Үзүүлэлт: ["0"] },
    },
    {
      id: "changeBySector",
      file: "DT_NSO_2500_001V2.px",
      label: { mn: "Бүтээмжийн өөрчлөлт, салбараар", en: "Productivity change by industry" },
      format: "percent",
    },
  ],
  widgets: [
    { type: "kpis", tables: ["level", "change"] },
    {
      type: "category-bars",
      table: "bySector",
      dimension: "Салбар",
      layout: "horizontal",
      span: "full",
      totals: ["Хөдөлмөрийн бүтээмжийн түвшин - улсын түвшинд"],
      labelMap: SECTOR_LABELS,
      title: { mn: "Нэг ажиллагчид ногдох ДНБ, салбараар", en: "GDP per worker by industry" },
    },
    {
      type: "category-bars",
      table: "changeBySector",
      dimension: "Салбар",
      layout: "horizontal",
      totals: ["Бизнесийн сектор"],
      labelMap: SECTOR_LABELS,
      title: {
        mn: "Жилийн өөрчлөлт, салбараар",
        en: "Annual change by industry",
      },
    },
    {
      type: "trend",
      tables: ["level"],
      yAxis: "fromZero",
      title: { mn: "Нэг ажиллагчид ногдох ДНБ", en: "GDP per worker" },
    },
  ],
};
