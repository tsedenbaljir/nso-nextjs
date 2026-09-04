import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const RELIGION_COLORS = {
  Будда: "#E40418",
  Христ: "#8A146F",
  Ислам: "#12658F",
  Бусад: "#EF9A00",
  Buddhism: "#E40418",
  Christianity: "#8A146F",
  Islam: "#12658F",
  Other: "#EF9A00",
};

export const monasteries: IntroDashboardConfig = {
  id: "monasteries",
  subsector: "Monasteries, Temples and Churches",
  title: {
    mn: "Сүм хийд, хурлын лам, санваартан номлогчдын тоо",
    en: "Monasteries, temples and clergy",
  },
  subtitle: { mn: "улсын хэмжээнд", en: "nationwide" },
  palette: ["#E40418", "#8A146F", "#12658F", "#EF9A00"],
  mapColors: ["#FDE9C8", "#E8A06A", "#C45A78", "#12658F"],
  sectionIcons: {
    trend: "/icons/religion/trend.png",
    map: "/icons/religion/map.png",
  },
  dimensions: {
    time: "Он",
    category: "Шашны төрөл",
    geo: "Бүс",
  },
  tables: [
    {
      id: "monasteries",
      file: "DT_NSO_2003_001V1.px",
      label: { mn: "Сүм хийд", en: "Monasteries" },
      icon: "temple",
    },
    {
      id: "clergy",
      file: "DT_NSO_2003_002V1.px",
      label: { mn: "Хурлын лам, санваартан", en: "Clergy" },
      icon: "people",
    },
    {
      id: "students",
      file: "DT_NSO_2003_003V1.px",
      label: { mn: "Суралцагч", en: "Students" },
      icon: "book",
    },
  ],
  widgets: [
    { type: "kpis" },
    {
      type: "category-flow",
      source: "monasteries",
      target: "clergy",
      extra: "students",
      colors: RELIGION_COLORS,
      categoryIcons: {
        будд: "dharma",
        buddh: "dharma",
        христ: "church",
        christ: "church",
        ислам: "mosque",
        islam: "mosque",
      },
    },
    { type: "trend", yAxis: "fromZero" },
    {
      type: "region-map",
      table: "monasteries",
      layout: {
        legend: "vertical",
        layoutCenter: ["50%", "52%"],
        layoutSize: "118%",
        aspectScale: 0.75,
      },
    },
  ],
};
