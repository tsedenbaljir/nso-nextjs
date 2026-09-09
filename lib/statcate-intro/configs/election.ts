import type { IntroDashboardConfig } from "@/lib/statcate-intro/types";

const TURNOUT_FILE = "DT_NSO_0200_003V1.px";
const PRESIDENT_FILE = "DT_NSO_0200_001V1.px";

export const election: IntroDashboardConfig = {
  id: "election",
  subsector: "Election",
  title: { mn: "Сонгууль", en: "Elections" },
  subtitle: { mn: "улсын хэмжээнд, сонгуулийн жилээр", en: "nationwide, by election year" },
  palette: ["#12658F", "#8A146F", "#EF9A00", "#E40418"],
  dimensions: { time: "Он" },
  tables: [
    {
      id: "registered",
      file: TURNOUT_FILE,
      label: { mn: "УИХ · Бүртгэлтэй сонгогч", en: "Parliament · Registered voters" },
      unit: { mn: "мян. хүн", en: "thousand persons" },
      icon: "people",
      format: "decimal",
      select: { Төрөл: ["0"], Үзүүлэлт: ["0"] },
    },
    {
      id: "voted",
      file: TURNOUT_FILE,
      label: { mn: "УИХ · Санал өгсөн сонгогч", en: "Parliament · Voters who voted" },
      unit: { mn: "мян. хүн", en: "thousand persons" },
      icon: "people",
      format: "decimal",
      select: { Төрөл: ["0"], Үзүүлэлт: ["1"] },
    },
    {
      id: "parliamentTurnout",
      file: TURNOUT_FILE,
      label: { mn: "УИХ · Сонгогчдын оролцоо", en: "Parliament · Voter turnout" },
      icon: "people",
      format: "percent",
      select: { Төрөл: ["0"], Үзүүлэлт: ["2"] },
    },
    {
      id: "localTurnout",
      file: TURNOUT_FILE,
      label: { mn: "ИТХ · Сонгогчдын оролцоо", en: "Local councils · Voter turnout" },
      icon: "people",
      format: "percent",
      select: { Төрөл: ["1"], Үзүүлэлт: ["2"] },
    },
    {
      id: "professions",
      file: "DT_NSO_0200_005V1.px",
      label: { mn: "УИХ-ын гишүүдийн мэргэжлийн бүтэц", en: "Members of Parliament by profession" },
      format: "percent",
      // The source's total is 100 percent, not a count of members.
      select: { Мэргэжил: ["1", "2", "3", "4", "5", "6", "7", "8"] },
    },
    {
      id: "presidentialCandidates",
      file: PRESIDENT_FILE,
      label: { mn: "Нэр дэвшигчийн авсан санал", en: "Votes received by candidate" },
      unit: { mn: "санал", en: "votes" },
      format: "count",
      // Candidate rows only; exclude turnout totals and the 2017 runoff.
      select: {
        "Нэр дэвшигчид": [
          "1", "2", "4", "5", "6", "8", "9", "10", "12", "13", "14", "15",
          "17", "18", "20", "21", "22", "24", "25", "26", "31", "32", "33",
        ],
      },
    },
    {
      id: "presidentialRunoff",
      file: PRESIDENT_FILE,
      label: { mn: "Хоёр дахь санал хураалтын санал", en: "Runoff votes by candidate" },
      unit: { mn: "санал", en: "votes" },
      format: "count",
      select: { "Нэр дэвшигчид": ["28", "29"], Он: ["1"] },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["registered", "voted", "parliamentTurnout", "localTurnout"] },
    {
      type: "category-stats",
      table: "professions",
      dimension: "Мэргэжил",
      title: { mn: "УИХ-ын гишүүд, мэргэжлээр · дүнд эзлэх хувь", en: "Members of Parliament by profession · share of total" },
    },
    {
      type: "trend",
      tables: ["parliamentTurnout", "localTurnout"],
      title: { mn: "Сонгогчдын оролцоо, сонгуулийн жилээр · %", en: "Voter turnout by election year · %" },
      yAxis: "fromZero",
    },
    {
      type: "category-bars",
      table: "professions",
      dimension: "Мэргэжил",
      title: { mn: "УИХ-ын гишүүдийн мэргэжлийн харьцуулалт · %", en: "Comparison of MPs' professions · %" },
      layout: "horizontal",
      height: 400,
    },
    {
      type: "category-bars",
      table: "presidentialCandidates",
      dimension: "Нэр дэвшигчид",
      title: { mn: "Ерөнхийлөгчийн сонгууль · Эхний санал хураалт", en: "Presidential election · First ballot" },
      layout: "horizontal",
      span: "full",
      height: 320,
    },
    {
      type: "category-bars",
      table: "presidentialRunoff",
      dimension: "Нэр дэвшигчид",
      title: { mn: "Ерөнхийлөгчийн сонгууль · 2017 оны хоёр дахь санал хураалт", en: "Presidential election · 2017 runoff" },
      layout: "horizontal",
      span: "full",
      height: 260,
      fallbackYear: false,
    },
  ],
};
