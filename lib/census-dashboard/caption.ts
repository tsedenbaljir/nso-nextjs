import { TOTAL_CATEGORY } from "@/lib/census-dashboard/indicators";
import type { MapLayer } from "@/lib/census-dashboard/geo";

export const LAYER_GENITIVE: Record<MapLayer, string> = {
  aimag: "аймаг/нийслэлийн",
  soum: "сум/дүүргийн",
  bag: "баг/хорооны",
};

/** Боловсролын үзүүлэлтүүдийн 0-14-ийг өгүүлбэр/шүүлтүүрт өөр насны бүлгээр харуулна. */
const AGE_LABEL_REMAP: Record<string, string> = {
  "education-level": "10-14",
  uneducated: "10-14",
  enrollment: "6-14",
};

export function isAllChoice(id?: string | null, label?: string | null) {
  if (!id && !label) return true;
  return id === TOTAL_CATEGORY || label === "Бүгд";
}

function formatShareNumber(value: number) {
  return value.toLocaleString("mn-MN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/** Өгүүлбэрийн дунд: эхний үсгийг жижиг болгоно. ЕБС гэх мэт товчлолыг хэвээр. */
export function inSentence(value: string) {
  const text = value.trim();
  if (!text) return text;
  const first = text[0]!;
  const rest = text.slice(1);
  const firstWord = text.split(/[\s,/-]/)[0] ?? "";
  const isAcronym =
    firstWord.length >= 2 &&
    firstWord === firstWord.toLocaleUpperCase("mn") &&
    firstWord !== firstWord.toLocaleLowerCase("mn");
  if (isAcronym) return text;
  return first.toLocaleLowerCase("mn") + rest;
}

function formatAgePhrase(age?: string | null, fallback?: string) {
  const raw = (age || fallback || "").trim();
  if (!raw) return "";
  if (/насны/i.test(raw)) return raw;
  return `${raw} насны`;
}

export function displayAgeLabel(indicatorId: string, label: string) {
  if (label === "0-14" && AGE_LABEL_REMAP[indicatorId]) {
    return AGE_LABEL_REMAP[indicatorId];
  }
  return label;
}

function remapAge(indicatorId: string | undefined, age?: string | null) {
  if (!age || !indicatorId || isAllChoice(undefined, age)) return undefined;
  if (age === "0-14" && AGE_LABEL_REMAP[indicatorId]) {
    return AGE_LABEL_REMAP[indicatorId];
  }
  return age;
}

type CaptionCtx = { age?: string | null };

type CaptionSpec = {
  noun?: string | ((ctx: CaptionCtx) => string);
  defaultAge?: string;
  categoryPhrase?: (label: string) => string;
};

const CAPTION_SPEC: Record<string, CaptionSpec> = {
  "labor-insurance": {
    noun: "ажиллах хүчний",
    categoryPhrase: (label) =>
      /хамрагдаагүй/i.test(label)
        ? "нийгмийн даатгалд хамрагдаагүй"
        : "нийгмийн даатгалд хамрагдсан",
  },
  "working-age-insurance": {
    noun: "хөдөлмөрийн насны хүн амын",
    categoryPhrase: (label) =>
      /хамрагддаггүй|хамрагдаагүй/i.test(label)
        ? "нийгмийн даатгалд хамрагдаагүй"
        : "нийгмийн даатгалд хамрагдсан",
  },
  "employment-status": {
    noun: ({ age }) => (age ? "хүн амын" : "хөдөлмөрийн насны хүн амын"),
  },
  "pension-coverage": {
    noun: "ахмад насны хүн амын",
    categoryPhrase: (label) =>
      /хамрагдаагүй/i.test(label)
        ? "өндөр насны тэтгэвэрт хамрагддаггүй"
        : "өндөр насны тэтгэвэрт хамрагддаг",
  },
  "pension-status": {
    noun: "ахмад насны хүн амын",
    categoryPhrase: () => "өндөр насны тэтгэвэрт хамрагддаг",
  },
  enrollment: {
    noun: "сургуульд суралцдаг хүн амын",
  },
  "education-level": {
    noun: ({ age }) =>
      age ? "хүн амын" : "10, түүнээс дээш насны боловсролтой хүн амын",
  },
  uneducated: {
    noun: ({ age }) => (age ? "хүн амын" : "10, түүнээс дээш насны хүн амын"),
    categoryPhrase: () => "боловсролгүй",
  },
  "out-of-school": {
    noun: "хүн амын",
    defaultAge: "6-29",
    categoryPhrase: () => "сургуульд сурдаггүй",
  },
  "protection-status": {
    noun: "хүн амын",
    categoryPhrase: (label) =>
      /ороогүй/i.test(label)
        ? "нийгмийн хамгаалалд хамрагддаг /хүүхдийн мөнгө ороогүй/"
        : "нийгмийн хамгаалалд хамрагддаг /хүүхдийн мөнгө орсон/",
  },
  "household-head-sex": {
    noun: "өрхийн",
    categoryPhrase: (label) => `${inSentence(label)} өрхийн тэргүүлэгчтэй`,
  },
  ownership: {
    noun: "өрхийн",
    categoryPhrase: (label) =>
      /^бусад$/i.test(label.trim())
        ? "бусдын сууцанд амьдардаг"
        : inSentence(label),
  },
  tenure: {
    noun: "өрхийн",
    categoryPhrase: (label) => {
      const base = inSentence(label);
      return /амьдардаг/.test(base) ? base : `${base} сууцанд амьдардаг`;
    },
  },
  "household-other": {
    noun: "өрхийн",
    categoryPhrase: (label) => {
      if (/гишүүд/.test(label) && /Монголд/.test(label)) {
        return "өрхийн бүх гишүүд Монголд амьдардаг өрх";
      }
      return inSentence(label);
    },
  },
};

export function displayCategoryLabel(indicatorId: string, label: string) {
  if (indicatorId === "protection-status") {
    if (/ороогүй/i.test(label)) {
      return "Нийгмийн хамгаалалд хамрагддаг /Хүүхдийн мөнгө ороогүй/";
    }
    if (/орсон/i.test(label)) {
      return "Нийгмийн хамгаалалд хамрагддаг /Хүүхдийн мөнгө орсон/";
    }
  }
  return label;
}

export function formatShareCaption(input: {
  place: string;
  layer: MapLayer;
  value: number;
  category: string;
  sex?: string | null;
  age?: string | null;
  indicatorId?: string;
  noun?: string;
  national?: boolean;
}) {
  const spec = input.indicatorId ? CAPTION_SPEC[input.indicatorId] : undefined;
  const age = remapAge(input.indicatorId, input.age);
  const noun =
    (typeof spec?.noun === "function" ? spec.noun({ age }) : spec?.noun) ??
    input.noun ??
    "хүн амын";
  const head =
    input.national || input.place === "Монгол Улс"
      ? "Монгол Улсын"
      : `${input.place} ${LAYER_GENITIVE[input.layer]}`;
  const agePhrase = formatAgePhrase(age, spec?.defaultAge);
  const sex = input.sex ? inSentence(input.sex) : undefined;
  const demo = [sex, agePhrase].filter(Boolean).join(" ");
  const who = demo ? `${demo} ${noun}` : noun;
  const category = inSentence(
    spec?.categoryPhrase ? spec.categoryPhrase(input.category) : input.category,
  );
  return `${head} ${who} ${formatShareNumber(input.value)} хувь нь ${category} байна.`;
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
