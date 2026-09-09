import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const PPI_FOLDER = "CHANGES OF INDUSTRIAL PRODUCER PRICE INDEX";
const FILE = "DT_NSO_1100_016V4_1.px";
const YOY = { Үзүүлэлт: ["1"] };

export const producerPriceIndex: IntroDashboardConfig = {
  id: "producer-price-index",
  subsector: "Producer price index",
  title: { mn: "Үйлдвэрлэгчийн үнэ", en: "Producer price index" },
  subtitle: { mn: "аж үйлдвэр, өмнөх оны мөн үе", en: "industry, year-on-year" },
  palette: ["#E67E22", "#1A5CAD", "#0E7C7B", "#5B6B80"],
  dimensions: { time: "Сар" },
  tables: [
    {
      id: "industry",
      file: FILE,
      subtables: PPI_FOLDER,
      label: { mn: "Аж үйлдвэрийн ҮҮИ", en: "Industrial PPI" },
      icon: "ppi",
      format: "percent",
      select: { ...YOY, "Дэд салбар": ["0"] },
    },
    {
      id: "mining",
      file: FILE,
      subtables: PPI_FOLDER,
      label: { mn: "Уул уурхай, олборлолт", en: "Mining and quarrying" },
      icon: "mining",
      format: "percent",
      select: { ...YOY, "Дэд салбар": ["1"] },
    },
    {
      id: "manufacturing",
      file: FILE,
      subtables: PPI_FOLDER,
      label: { mn: "Боловсруулах үйлдвэрлэл", en: "Manufacturing" },
      icon: "manufacturing",
      format: "percent",
      select: { ...YOY, "Дэд салбар": ["7"] },
    },
    {
      id: "utilities",
      file: FILE,
      subtables: PPI_FOLDER,
      label: { mn: "Цахилгаан, хий, уур", en: "Electricity, gas, steam" },
      icon: "utilities",
      format: "percent",
      select: { ...YOY, "Дэд салбар": ["26"] },
    },
    {
      id: "subsectors",
      file: FILE,
      subtables: PPI_FOLDER,
      label: { mn: "Дэд салбараар", en: "By subsector" },
      format: "percent",
      select: { ...YOY, "Дэд салбар": ["0", "1", "7", "26", "27"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["industry", "mining", "manufacturing", "utilities"] },
    {
      type: "category-bars",
      table: "subsectors",
      dimension: "Дэд салбар",
      layout: "horizontal",
      totals: ["Ерөнхий индекс"],
      labelMap: {
        "Цахилгаан, хий, уур, агааржуулалт": "Цахилгаан, хий, уур",
        "Ус хангамж, бохир ус зайлуулах систем, хог хаягдлын менежмент болон цэвэрлэх үйл ажиллагаа": "Ус хангамж",
      },
      title: {
        mn: "ҮҮИ, дэд салбараар",
        en: "PPI by industrial subsector",
      },
    },
    { type: "trend", tables: ["industry", "mining", "manufacturing"], yAxis: "nice", title: { mn: "ҮҮИ-ийн өөрчлөлт", en: "PPI change" } },
  ],
};
