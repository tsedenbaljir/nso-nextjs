/**
 * Монгол Улсын сонгуулийн тойрог (Бүс_сонгууль_code) болон аймаг/дүүргийн холбоо.
 * Acode = статистикийн код (аймаг/дүүрэг)
 */

/** Аймаг/дүүргийн код → Тойрог (1-13) */
export const ACODE_TO_TOIROG: Record<number, number> = {
  65: 1,
  64: 1,
  62: 1,
  82: 2,
  81: 2,
  85: 2,
  84: 2,
  83: 3,
  67: 4,
  43: 4,
  61: 4,
  45: 4,
  63: 5,
  48: 5,
  42: 5,
  44: 6,
  46: 6,
  41: 7,
  22: 8,
  23: 8,
  21: 9,
  11: 13,
};

/** Тойрогийн нэр */
export const TOIROG_NAMES: Record<number, string> = {
  1: "I тойрог",
  2: "II тойрог",
  3: "III тойрог",
  4: "IV тойрог",
  5: "V тойрог",
  6: "VI тойрог",
  7: "VII тойрог",
  8: "VIII тойрог",
  9: "IX тойрог",
  10: "X тойрог",
  11: "XI тойрог",
  12: "XII тойрог",
  13: "XIII тойрог (Улаанбаатар)",
};

/** Аймгийн нэр → Acode (шинэ стандарт) */
export const AIMAG_NAME_TO_ACODE: Record<string, number> = {
  Улаанбаатар: 11,
  Дорнод: 21,
  Сүхбаатар: 22,
  Хэнтий: 23,
  Төв: 41,
  Говьсүмбэр: 42,
  Сэлэнгэ: 43,
  Дорноговь: 44,
  "Дархан-Уул": 45,
  Өмнөговь: 46,
  Дундговь: 48,
  Орхон: 61,
  Өвөрхангай: 62,
  Булган: 63,
  Баянхонгор: 64,
  Архангай: 65,
  Хөвсгөл: 67,
  Завхан: 81,
  "Говь-Алтай": 82,
  "Баян-Өлгий": 83,
  Ховд: 84,
  Увс: 85,
};

export function getToirogFromAcode(acode: number): number | undefined {
  return ACODE_TO_TOIROG[acode];
}

export function getToirogFromAimagName(name: string): number | undefined {
  const acode = AIMAG_NAME_TO_ACODE[name?.trim() ?? ""];
  return acode != null ? ACODE_TO_TOIROG[acode] : undefined;
}
