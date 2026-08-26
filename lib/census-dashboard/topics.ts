import type { MapLayer } from "@/lib/census-dashboard/geo";

export type TopicIconId =
  | "population"
  | "household"
  | "employment"
  | "protection"
  | "education"
  | "health";

export type SubFilter = {
  id: string;
  label: string;
};

export type Topic = {
  id: string;
  label: string;
  kicker: string;
  icon: TopicIconId;
  dataFile?: string;
  subFilters: SubFilter[];
};

export const CENSUS_TYPES = [
  { value: "phc", label: "Хүн ам, орон сууцны тооллого" },
] as const;

export const LAYER_ITEMS: { id: MapLayer; label: string; shortLabel: string }[] = [
  { id: "aimag", label: "Аймаг, нийслэл", shortLabel: "Аймаг" },
  { id: "soum", label: "Сум, дүүрэг", shortLabel: "Сум" },
  { id: "bag", label: "Баг, хороо", shortLabel: "Баг" },
];

export const DEFAULT_LAYERS: MapLayer[] = LAYER_ITEMS.map((item) => item.id);

export const LAYER_SCOPE_LABEL: Record<MapLayer, string> = {
  aimag: "Аймгаар",
  soum: "Сумаар",
  bag: "Багаар",
};

export const TOPICS: Topic[] = [
  {
    id: "population",
    label: "Хүн ам",
    kicker: "Тооллого",
    icon: "population",
    dataFile: "/census-dashboard/data/indicators.json",
    subFilters: [
      { id: "resident", label: "Оршин суугаа хүн ам" },
      { id: "sex-ratio", label: "Хүйсийн харьцаа" },
      { id: "dependency", label: "Хүн ам зүйн ачаалал" },
      { id: "ethnicity", label: "Үндэс, угсаа" },
      { id: "birthplace", label: "Төрсөн газрын харьяалал" },
      { id: "marital", label: "Гэрлэлтийн байдал" },
    ],
  },
  {
    id: "household",
    label: "Өрх",
    kicker: "Тооллого",
    icon: "household",
    dataFile: "/census-dashboard/data/household.json",
    subFilters: [
      { id: "household-head-sex", label: "Өрхийн тэргүүлэгчийн хүйс" },
      { id: "household-type", label: "Өрхийн төрөл" },
      { id: "household-size", label: "Өрхийн ам бүлийн тоо" },
      { id: "household-children", label: "Өрх, хүүхдийн тооны бүлгээр" },
      { id: "housing-type", label: "Өрхийн сууцны төрөл" },
      { id: "heating", label: "Өрхийн дулааны эх үүсвэр" },
      { id: "electricity", label: "Өрхийн цахилгаан хангамж" },
      { id: "water", label: "Өрхийн усан хангамж" },
      { id: "sewage", label: "Бохир ус зайлуулалт" },
      { id: "toilet", label: "Бие засах газар" },
      { id: "ownership", label: "Сууцны өмчийн хэлбэр" },
      { id: "tenure", label: "Сууцны эзэмшлийн хэлбэр" },
      { id: "transport", label: "Тээврийн хэрэгсэлтэй өрх" },
      { id: "household-other", label: "Өрхийн бусад үзүүлэлт" },
    ],
  },
  {
    id: "employment",
    label: "Хөдөлмөр эрхлэлт",
    kicker: "Тооллого",
    icon: "employment",
    dataFile: "/census-dashboard/data/employment.json",
    subFilters: [
      { id: "employment-rate", label: "Хөдөлмөр эрхлэлтийн түвшин" },
      { id: "employment-status", label: "Хөдөлмөр эрхлэлтийн байдал" },
      { id: "labor-insurance", label: "Ажиллах хүчний хүн ам нийгмийн даатгалд хамрагдалт" },
      { id: "working-age-insurance", label: "Хөдөлмөрийн насны хүн амын нийгмийн даатгалд хамрагдалт" },
    ],
  },
  {
    id: "protection",
    label: "Нийгмийн хамгаалал",
    kicker: "Тооллого",
    icon: "protection",
    dataFile: "/census-dashboard/data/protection.json",
    subFilters: [
      { id: "protection-coverage", label: "Нийгмийн хамгаалалд хамрагдалт" },
      { id: "pension-coverage", label: "Өндөр насны тэтгэвэрт хамрагдалт" },
      {
        id: "protection-status",
        label: "Нийгмийн хамгаалалд хамрагдалтын байдал",
      },
      {
        id: "pension-status",
        label: "Өндөр насны тэтгэвэрт хамрагдалтын байдал",
      },
    ],
  },
  {
    id: "education",
    label: "Боловсрол",
    kicker: "Тооллого",
    icon: "education",
    dataFile: "/census-dashboard/data/education.json",
    subFilters: [
      { id: "education-level", label: "Боловсролын түвшин" },
      { id: "uneducated", label: "Боловсролгүй хүн ам" },
      { id: "enrollment", label: "Сургуульд хамрагдалт" },
      { id: "out-of-school", label: "Сургуульд сурдаггүй хүн ам" },
    ],
  },
  {
    id: "health",
    label: "Эрүүл мэнд",
    kicker: "Тооллого",
    icon: "health",
    dataFile: "/census-dashboard/data/health.json",
    subFilters: [{ id: "disability", label: "Хөгжлийн бэрхшээл" }],
  },
];

export function getTopic(id: string) {
  return TOPICS.find((topic) => topic.id === id);
}
