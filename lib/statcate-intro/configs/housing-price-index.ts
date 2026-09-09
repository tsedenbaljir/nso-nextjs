import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const CHANGE = "DT_NSO_0300_00V1.px";
const PRICE = "DT_NSO_0300_00V4.px";
const YOY = { Үзүүлэлт: ["2"] };

export const housingPriceIndex: IntroDashboardConfig = {
  id: "housing-price-index",
  subsector: "Housing price index",
  title: {
    mn: "Орон сууцны үнэ",
    en: "Housing prices",
  },
  subtitle: {
    mn: "жилийн өөрчлөлт, дүүрэг, м² үнэ",
    en: "year-on-year change, districts, price per m²",
  },
  palette: ["#1A5CAD", "#0E7C7B", "#C0392B", "#5B6B80"],
  dimensions: { time: "Сар" },
  tables: [
    {
      id: "totalYoY",
      file: CHANGE,
      label: { mn: "Нийт үнийн өөрчлөлт", en: "Overall price change" },
      icon: "housing",
      format: "percent",
      select: { ...YOY, Бүлэг: ["0"] },
    },
    {
      id: "newYoY",
      file: CHANGE,
      label: { mn: "Шинэ орон сууц", en: "New dwellings" },
      icon: "housingNew",
      format: "percent",
      select: { ...YOY, Бүлэг: ["1"] },
    },
    {
      id: "oldYoY",
      file: CHANGE,
      label: { mn: "Хуучин орон сууц", en: "Existing dwellings" },
      icon: "housingOld",
      format: "percent",
      select: { ...YOY, Бүлэг: ["2"] },
    },
    {
      id: "avgNew",
      file: PRICE,
      label: { mn: "1 м² дундаж үнэ, шинэ", en: "Avg price per m², new" },
      unit: { mn: "сая ₮ / м²", en: "million ₮ / m²" },
      icon: "housingPrice",
      format: "decimal",
      select: { Үзүүлэлт: ["0"], Дүүрэг: ["6"] },
    },
    {
      id: "districts",
      file: PRICE,
      label: { mn: "1 м² дундаж үнэ, дүүргээр", en: "Avg price per m² by district" },
      unit: { mn: "сая ₮ / м²", en: "million ₮ / m²" },
      format: "decimal",
      select: { Үзүүлэлт: ["0"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["totalYoY", "newYoY", "oldYoY", "avgNew"] },
    {
      type: "category-bars",
      table: "districts",
      dimension: "Дүүрэг",
      layout: "horizontal",
      totals: ["Дундаж"],
      title: {
        mn: "Шинэ орон сууцны 1 м² үнэ, дүүргээр",
        en: "New dwelling price per m² by district",
      },
    },
    {
      type: "trend",
      tables: ["totalYoY", "newYoY", "oldYoY"],
      yAxis: "nice",
      title: { mn: "Үнийн жилийн өөрчлөлт", en: "Year-on-year price change" },
    },
  ],
};
