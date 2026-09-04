export const AIMAG_ID_TO_NAME: Record<number, string> = {
  11: "Улаанбаатар",
  21: "Дорнод",
  22: "Сүхбаатар",
  23: "Хэнтий",
  41: "Төв",
  42: "Говьсүмбэр",
  43: "Сэлэнгэ",
  44: "Дорноговь",
  45: "Дархан-Уул",
  46: "Өмнөговь",
  48: "Дундговь",
  61: "Орхон",
  62: "Өвөрхангай",
  63: "Булган",
  64: "Баянхонгор",
  65: "Архангай",
  67: "Хөвсгөл",
  81: "Завхан",
  82: "Говь-Алтай",
  83: "Баян-Өлгий",
  84: "Ховд",
  85: "Увс",
};

const ALIAS_PAIRS: [string, string][] = [
  ["Arkhangai", "Архангай"],
  ["Arxangai", "Архангай"],
  ["Bayankhongor", "Баянхонгор"],
  ["Bayan-Ulgii", "Баян-Өлгий"],
  ["Bayan-Olgii", "Баян-Өлгий"],
  ["Bulgan", "Булган"],
  ["Darkhan-Uul", "Дархан-Уул"],
  ["Dornod", "Дорнод"],
  ["Dornogovi", "Дорноговь"],
  ["Dundgovi", "Дундговь"],
  ["Govi-Altai", "Говь-Алтай"],
  ["GoviAltai", "Говь-Алтай"],
  ["Govisumber", "Говьсүмбэр"],
  ["Khentii", "Хэнтий"],
  ["Hentii", "Хэнтий"],
  ["Khovd", "Ховд"],
  ["Khuvsgul", "Хөвсгөл"],
  ["Khovsgol", "Хөвсгөл"],
  ["Huvsgul", "Хөвсгөл"],
  ["Orkhon", "Орхон"],
  ["Selenge", "Сэлэнгэ"],
  ["Sukhbaatar", "Сүхбаатар"],
  ["Tuv", "Төв"],
  ["To'v", "Төв"],
  ["Ulaanbaatar", "Улаанбаатар"],
  ["Umnugovi", "Өмнөговь"],
  ["Omnogovi", "Өмнөговь"],
  ["Uvs", "Увс"],
  ["Uvurkhangai", "Өвөрхангай"],
  ["Ovorkhangai", "Өвөрхангай"],
  ["Zavkhan", "Завхан"],
];

function nameKey(value: string) {
  return value
    .toLowerCase()
    .replace(/аймаг\s*$/i, "")
    .replace(/хот\s*$/i, "")
    .replace(/[\s\-–'_]+/g, "")
    .trim();
}

const ALIASES = new Map<string, string>();
for (const name of Object.values(AIMAG_ID_TO_NAME)) {
  ALIASES.set(nameKey(name), name);
}
for (const [from, to] of ALIAS_PAIRS) {
  ALIASES.set(nameKey(from), to);
}

export function canonicalAimagName(label: string): string | null {
  return ALIASES.get(nameKey(label)) ?? null;
}

export const INTRO_MAP_COLORS = ["#C5D9EE", "#7BAFD9", "#3D8BDA", "#1A5CAD"];

export function mapColorPieces(values: number[], colors = INTRO_MAP_COLORS, digits = 0) {
  const positive = [...values].filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  if (!positive.length) {
    return [{ lte: 0, label: "0", color: colors[0] }];
  }

  const n = colors.length;
  const q = (p: number) => positive[Math.min(positive.length - 1, Math.round(p * (positive.length - 1)))];
  const edges: number[] = [];
  for (let i = 0; i <= n; i++) {
    const v = q(i / n);
    if (!edges.length || v > edges[edges.length - 1]) edges.push(v);
  }
  while (edges.length < 2) edges.push(edges[0] + 1);

  const fmt = (v: number) => (digits > 0 ? v.toFixed(digits) : String(Math.round(v)));
  const pieces: { gt?: number; lte?: number; label: string; color: string }[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const from = edges[i];
    const to = edges[i + 1];
    const color = colors[Math.min(i, n - 1)];
    const last = i === edges.length - 2;
    if (i === 0) {
      pieces.push({ lte: to, label: `≤ ${fmt(to)}`, color });
    } else if (last) {
      pieces.push({ gt: from, label: `> ${fmt(from)}`, color: colors[n - 1] });
    } else {
      pieces.push({ gt: from, lte: to, label: `${fmt(from)}–${fmt(to)}`, color });
    }
  }
  return pieces;
}
