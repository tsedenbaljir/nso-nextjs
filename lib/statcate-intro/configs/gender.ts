import type { IntroDashboardConfig, IntroTableConfig, LocalizedText } from "@/lib/statcate-intro/types";

const CURRENT_FILE = "DT_NSO_0100_001D1.px";
const HISTORICAL_FILE = "DT_NSO_0400_081V7.px";

function representatives(
  id: string,
  label: LocalizedText,
  sex: string,
  historicalSex: string,
): IntroTableConfig {
  return {
    id,
    label,
    file: CURRENT_FILE,
    icon: sex === "1" ? "male" : sex === "2" ? "female" : "representatives",
    format: "count",
    // Representatives only; chairpersons and secretaries are separate indicators.
    select: { "ИТХ-ын төлөөлөгч": ["1"], Хүйс: [sex], "Насны бүлэг": ["0"] },
    files: [{
      file: HISTORICAL_FILE,
      // 2020–2021 combines age and sex and uses a different representative code.
      select: { "ИТХ-ын төлөөлөгч": ["2"], "Нас, хүйс": [historicalSex] },
    }],
  };
}

export const gender: IntroDashboardConfig = {
  id: "gender",
  subsector: "Gender",
  title: { mn: "Жендэр", en: "Gender" },
  subtitle: { mn: "ИТХ-ын төлөөлөгчид, хүйсээр", en: "Local council representatives by sex" },
  palette: ["#12658F", "#8A146F", "#EF9A00", "#E40418"],
  mapColors: ["#E8F1FA", "#ADCDE8", "#5B9BC9", "#12658F"],
  dimensions: { time: "Он", geo: "Бүс" },
  tables: [
    representatives("total", { mn: "Нийт төлөөлөгч", en: "Total representatives" }, "0", "0"),
    representatives("male", { mn: "Эрэгтэй", en: "Male" }, "1", "1"),
    representatives("female", { mn: "Эмэгтэй", en: "Female" }, "2", "6"),
  ],
  widgets: [
    { type: "kpis", tables: ["total", "male", "female"] },
    {
      type: "trend",
      tables: ["male", "female"],
      title: { mn: "ИТХ-ын төлөөлөгчид, хүйс ба жилээр", en: "Local council representatives by sex and year" },
      yAxis: "fromZero",
      span: "full",
    },
    {
      type: "region-bars",
      table: "male",
      title: { mn: "Эрэгтэй төлөөлөгчид, аймаг, нийслэлээр", en: "Male representatives by aimag and capital" },
      geoMode: "aimags",
    },
    {
      type: "region-bars",
      table: "female",
      title: { mn: "Эмэгтэй төлөөлөгчид, аймаг, нийслэлээр", en: "Female representatives by aimag and capital" },
      geoMode: "aimags",
    },
    {
      type: "region-map",
      table: "female",
      title: { mn: "Эмэгтэй төлөөлөгчдийн газар зүйн тархалт", en: "Female representatives by location" },
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
  ],
};
