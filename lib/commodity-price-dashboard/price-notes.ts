export const MARKET_PRICE_NOTE =
  "Хэрэглэгчдийн худалдаж авсан бараа, үйлчилгээний дундаж үнэ";

export const CPI_PRICE_NOTE =
  "Хэрэглээний гол нэрийн барааны зах зээлийн сарын дундаж үнэ";

export const PPI_BORDER_PRODUCTS = [
  "Аи-92 автобензин, л",
  "Дизелийн түлш, л",
] as const;

export const PPI_PRODUCER_PRODUCTS = [
  "Гурил, дээд зэрэг, савласан, 1 кг",
  "Гурил, I зэрэг, савласан, кг",
  "Талх, 600 гр",
  "Талх, зүссэн, 600 гр",
  "Хар талх, 300 гр",
  "Үхрийн мах, ястай, кг",
  "Үхрийн мах, цул, кг",
  "Хонины мах, ястай, кг",
  "Ямааны мах, ястай, кг",
  "Адууны мах, ястай, кг",
  "Сүү, ууттай, 0.5 л",
  "Сүү, савтай, л",
  "Тараг, савласан, 900 гр",
  "Өндөг, ш",
  "Цөцгийн тос, 200 гр",
  "Ногоон цай, савласан, 90 г",
] as const;

export const PPI_BORDER_SET = new Set<string>(PPI_BORDER_PRODUCTS);
export const PPI_PRODUCER_SET = new Set<string>(PPI_PRODUCER_PRODUCTS);

export function ppiProductStars(name: string): 0 | 1 | 2 {
  if (PPI_PRODUCER_SET.has(name)) return 2;
  if (PPI_BORDER_SET.has(name)) return 1;
  return 0;
}

export const PPI_BORDER_NOTE = "Гаалийн ерөнхий газрын мэдээллийн санг ашиглан нэгжийн үнийг тооцсон.";
export const PPI_PRODUCER_NOTE = "Үйлдвэрлэгчийн үнэ";
