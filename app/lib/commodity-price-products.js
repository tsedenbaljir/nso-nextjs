/** Columns of [NSOweb].[dbo].[price_data] excluding Year/Month */
export const PRICE_DATA_PRODUCTS = [
    { code: "FLOUR_HG", name: "Гурил, дээд зэрэг, кг", unit: "кг", phrase: "1 кг гурилын (дээд зэрэг)" },
    { code: "FLOUR_G1", name: "Гурил, 1-р зэрэг, кг", unit: "кг", phrase: "1 кг гурилын (1-р зэрэг)" },
    { code: "FLOUR_G2", name: "Гурил, 2-р зэрэг, кг", unit: "кг", phrase: "1 кг гурилын (2-р зэрэг)" },
    { code: "BREAD_ATAR", name: "Талх, кг", unit: "кг", phrase: "1 кг талхны" },
    { code: "RICE", name: "Цагаан будаа, кг", unit: "кг", phrase: "1 кг цагаан будааны" },
    { code: "MUTTON_G1", name: "Хонины мах, ястай, кг", unit: "кг", phrase: "1 кг хонины махны" },
    { code: "BEEF_G1", name: "Үхрийн мах, ястай, кг", unit: "кг", phrase: "1 кг үхрийн махны" },
    { code: "MILK", name: "Сүү, л", unit: "л", phrase: "1 л сүүний" },
    { code: "YOGURT", name: "Тараг, л", unit: "л", phrase: "1 л тарагны" },
    { code: "SUGAR", name: "Элсэн чихэр, кг", unit: "кг", phrase: "1 кг элсэн чихрийн" },
    { code: "APPLE", name: "Алим, кг", unit: "кг", phrase: "1 кг алимын" },
    { code: "POTATO", name: "Төмс, кг", unit: "кг", phrase: "1 кг төмсний" },
    { code: "CABBAGE", name: "Байцаа, кг", unit: "кг", phrase: "1 кг байцааны" },
    { code: "CARROT", name: "Лууван, кг", unit: "кг", phrase: "1 кг луувангийн" },
    { code: "ONION", name: "Сонгино, кг", unit: "кг", phrase: "1 кг сонгинын" },
    { code: "SALT", name: "Давс, кг", unit: "кг", phrase: "1 кг давсны" },
    { code: "VEG_OIL", name: "Ургамлын тос, л", unit: "л", phrase: "1 л ургамлын тосны" },
    { code: "EGG", name: "Өндөг, ш", unit: "ш", phrase: "1 ширхэг өндөгний" },
    { code: "PETROL_HIGH", name: "Бензин, А-92, л", unit: "л", phrase: "1 л бензиний (А-92)" },
];

export const PRICE_PRODUCT_CODES = PRICE_DATA_PRODUCTS.map((p) => p.code);

export const PRICE_PRODUCT_BY_CODE = Object.fromEntries(
    PRICE_DATA_PRODUCTS.map((p) => [p.code, p])
);

export const PRICE_DATA_TABLE = "[NSOweb].[dbo].[price_data]";

export function isAllowedProductCode(code) {
    return Boolean(PRICE_PRODUCT_BY_CODE[code]);
}

/** Parse form/API price: empty → null; otherwise finite number */
export function normalizePriceValue(value) {
    if (value === "" || value == null) return null;
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return n;
}

export function pickPricesFromBody(body) {
    const prices = {};
    for (const code of PRICE_PRODUCT_CODES) {
        prices[code] = normalizePriceValue(body[code] ?? body.prices?.[code]);
    }
    return prices;
}
