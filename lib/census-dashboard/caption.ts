import { formatNumber } from "@/lib/census-dashboard/dashboard";
import { TOTAL_CATEGORY } from "@/lib/census-dashboard/indicators";
import type { MapLayer } from "@/lib/census-dashboard/geo";

export const LAYER_GENITIVE: Record<MapLayer, string> = {
  aimag: "аймаг/нийслэлийн",
  soum: "сум/дүүргийн",
  bag: "баг/хорооны",
};

export function isAllChoice(id?: string | null, label?: string | null) {
  if (!id && !label) return true;
  return id === TOTAL_CATEGORY || label === "Бүгд";
}

export function formatShareCaption(input: {
  place: string;
  layer: MapLayer;
  value: number;
  category: string;
  sex?: string | null;
  age?: string | null;
  noun?: "хүн амын" | "өрхийн";
  national?: boolean;
}) {
  const noun = input.noun ?? "хүн амын";
  const head =
    input.national || input.place === "Монгол Улс"
      ? "Монгол Улсын"
      : `${input.place} ${LAYER_GENITIVE[input.layer]}`;
  const demo = [input.sex, input.age].filter(Boolean).join(" ");
  const who = demo ? `${demo} ${noun}` : noun;
  return `${head} ${who} ${formatNumber(input.value)} хувь нь ${input.category} байна.`;
}

export function captionNotes(indicatorId: string): string[] {
  if (indicatorId === "sex-ratio") {
    return ["Хүйсийн харьцаа: 100 эмэгтэйд ногдох эрэгтэйчүүдийн тоог хэлнэ."];
  }
  if (indicatorId === "dependency") {
    return [
      "Хүн ам зүйн ачаалал: Хөдөлмөрийн насны 100 хүнд ногдох хөдөлмөрийн насны бус хүн амын тоог илэрхийлнэ.",
    ];
  }
  if (indicatorId === "employment-rate") {
    return [
      "Ажиллах хүчний оролцооны түвшин: Хөдөлмөрийн насны хүн амын хэдэн хувийг ажиллах хүчин эзэлж байгааг ойлгоно.",
      "Ажилгүйдлийн түвшин: Ажиллах хүчинд ажилгүй хүн амын эзлэх хувийг хэлнэ.",
    ];
  }
  return [];
}
