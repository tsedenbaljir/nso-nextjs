export const AIMAG_NAMES: Record<number, { mn: string; en: string }> = {
  11: { mn: "Улаанбаатар", en: "Ulaanbaatar" },
  21: { mn: "Дорнод", en: "Dornod" },
  22: { mn: "Сүхбаатар", en: "Sükhbaatar" },
  23: { mn: "Хэнтий", en: "Khentii" },
  41: { mn: "Төв", en: "Töv" },
  42: { mn: "Говьсүмбэр", en: "Govisümber" },
  43: { mn: "Сэлэнгэ", en: "Selenge" },
  44: { mn: "Дорноговь", en: "Dornogovi" },
  45: { mn: "Дархан-Уул", en: "Darkhan-Uul" },
  46: { mn: "Өмнөговь", en: "Ömnögovi" },
  48: { mn: "Дундговь", en: "Dundgovi" },
  61: { mn: "Орхон", en: "Orkhon" },
  62: { mn: "Өвөрхангай", en: "Övörkhangai" },
  63: { mn: "Булган", en: "Bulgan" },
  64: { mn: "Баянхонгор", en: "Bayankhongor" },
  65: { mn: "Архангай", en: "Arkhangai" },
  67: { mn: "Хөвсгөл", en: "Khövsgöl" },
  81: { mn: "Завхан", en: "Zavkhan" },
  82: { mn: "Говь-Алтай", en: "Govi-Altai" },
  83: { mn: "Баян-Өлгий", en: "Bayan-Ölgii" },
  84: { mn: "Ховд", en: "Khovd" },
  85: { mn: "Увс", en: "Uvs" },
};

export function aimagName(id: number) {
  return AIMAG_NAMES[id]?.mn ?? `Аймаг ${id}`;
}

export const AIMAG_LABEL_OFFSET: Record<number, [number, number]> = {
  11: [22, 20],
  41: [-16, -18],
  42: [18, 14],
  43: [-8, -20],
  45: [22, 16],
  61: [20, 12],
  63: [-22, -6],
};

export const AIMAG_OPTIONS = Object.entries(AIMAG_NAMES)
  .map(([id, names]) => ({ value: Number(id), label: names.mn }))
  .sort((a, b) => a.label.localeCompare(b.label, "mn"));
