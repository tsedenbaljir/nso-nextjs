import type { IntroDashboardConfig, LocalizedText } from "@/lib/statcate-intro/types";

const PRODUCT = "Бүтээгдэхүүний төрөл";
const SUPPLY_FILE = "DT_NSO_1003_002V1.px";
const SOURCE_FILE = "DT_NSO_1003_005V1.px";

// Source-share charts keep parent groups without overlapping meat/flour subcategories.
const SOURCE_PRODUCTS = ["0", "4", "5", "6", "9", "10", "11", "12", "13", "14", "15", "16", "17"];

// Match products by their table-specific codes, with identical labels and row order.
const COMPARISON_PRODUCTS: { requirement?: string; supply: string; label: LocalizedText }[] = [
  { requirement: "0", supply: "1", label: { mn: "Мах, махан бүтээгдэхүүн", en: "Meat and meat products" } },
  { requirement: "1", supply: "5", label: { mn: "Сүү", en: "Milk" } },
  { requirement: "2", supply: "6", label: { mn: "Сүүн бүтээгдэхүүн", en: "Dairy products" } },
  { requirement: "3", supply: "8", label: { mn: "Гурил", en: "Flour" } },
  { requirement: "4", supply: "9", label: { mn: "Гурилан бүтээгдэхүүн", en: "Flour products" } },
  { requirement: "5", supply: "10", label: { mn: "Төрөл бүрийн будаа", en: "Rice and cereals" } },
  { requirement: "6", supply: "18", label: { mn: "Сахар, чихрийн зүйл", en: "Sugar and confectionery" } },
  { requirement: "7", supply: "11", label: { mn: "Төмс", en: "Potatoes" } },
  { requirement: "8", supply: "12", label: { mn: "Хүнсний ногоо", en: "Vegetables" } },
  { requirement: "9", supply: "14", label: { mn: "Жимс, жимсгэнэ", en: "Fruit and berries" } },
  { requirement: "10", supply: "13", label: { mn: "Буурцагт ургамал", en: "Pulses" } },
  { requirement: "11", supply: "15", label: { mn: "Өндөг", en: "Eggs" } },
  { requirement: "12", supply: "16", label: { mn: "Ургамлын тос", en: "Vegetable oil" } },
  { supply: "17", label: { mn: "Цөцгийн тос, 72% тослогтой", en: "Butter, 72% fat" } },
];

export const foodSecurity: IntroDashboardConfig = {
  id: "food-security",
  subsector: "Food Security",
  title: { mn: "Хүнсний аюулгүй байдал", en: "Food security" },
  subtitle: { mn: "улсын дундаж, бүтээгдэхүүний төрлөөр", en: "national average, by product type" },
  palette: ["#12658F", "#8A146F", "#EF9A00", "#E40418"],
  dimensions: { time: "Он" },
  tables: [
    {
      id: "meatSupply",
      file: SUPPLY_FILE,
      label: { mn: "Мах", en: "Meat" },
      icon: "meat",
      format: "percent",
      select: { [PRODUCT]: ["1"] },
    },
    {
      id: "milkSupply",
      file: SUPPLY_FILE,
      label: { mn: "Сүү", en: "Milk" },
      icon: "milk",
      format: "percent",
      select: { [PRODUCT]: ["5"] },
    },
    {
      id: "potatoSupply",
      file: SUPPLY_FILE,
      label: { mn: "Төмс", en: "Potatoes" },
      icon: "potato",
      format: "percent",
      select: { [PRODUCT]: ["11"] },
    },
    {
      id: "vegetableSupply",
      file: SUPPLY_FILE,
      label: { mn: "Хүнсний ногоо", en: "Vegetables" },
      icon: "vegetables",
      format: "percent",
      select: { [PRODUCT]: ["12"] },
    },
    {
      id: "annualRequirement",
      file: "DT_NSO_1003_001V1.px",
      label: { mn: "Жишсэн хүн амын жилийн хүнсний хэрэгцээ", en: "Annual food requirements of the equivalent population" },
      unit: { mn: "мян. тонн", en: "thousand tonnes" },
      format: "decimal",
    },
    {
      id: "supplyByProduct",
      file: SUPPLY_FILE,
      label: { mn: "Хүнсний хангамжийн түвшин", en: "Food supply adequacy" },
      format: "percent",
      select: { [PRODUCT]: COMPARISON_PRODUCTS.map((item) => item.supply) },
    },
    {
      id: "domesticShare",
      file: SOURCE_FILE,
      label: { mn: "Дотоодын үйлдвэрлэлийн эзлэх хувь", en: "Domestic production share" },
      format: "percent",
      select: { "Эх үүсвэр": ["0"], [PRODUCT]: SOURCE_PRODUCTS },
    },
    {
      id: "importShare",
      file: SOURCE_FILE,
      label: { mn: "Импортын эзлэх хувь", en: "Import share" },
      format: "percent",
      select: { "Эх үүсвэр": ["1"], [PRODUCT]: SOURCE_PRODUCTS },
    },
  ],
  widgets: [
    { type: "kpis", tables: ["meatSupply", "milkSupply", "potatoSupply", "vegetableSupply"] },
    {
      type: "trend",
      tables: ["meatSupply", "milkSupply", "potatoSupply", "vegetableSupply"],
      title: { mn: "Гол нэрийн хүнсний хангамжийн түвшин, жилээр · %", en: "Supply adequacy of key food products by year · %" },
      yAxis: "fromZero",
      span: "full",
    },
    {
      type: "category-bars",
      table: "annualRequirement",
      dimension: PRODUCT,
      categories: COMPARISON_PRODUCTS.map((item) => ({ code: item.requirement, label: item.label })),
      title: { mn: "Жилийн хүнсний хэрэгцээ · мян. тонн", en: "Annual food requirements · thousand tonnes" },
      layout: "horizontal",
      height: 480,
    },
    {
      type: "category-bars",
      table: "supplyByProduct",
      dimension: PRODUCT,
      valueColorBands: [
        { min: 100, color: "#16A34A" },
        { min: 50, max: 100, color: "#EAB308" },
        { max: 50, color: "#DC2626" },
      ],
      categories: COMPARISON_PRODUCTS.map((item) => ({ code: item.supply, label: item.label })),
      title: { mn: "Хангамжийн түвшин · хэрэгцээнд харьцуулсан %", en: "Supply adequacy · % of requirements" },
      layout: "horizontal",
      height: 480,
    },
    {
      type: "category-bars",
      table: "domesticShare",
      dimension: PRODUCT,
      title: { mn: "Хангамжид дотоодын үйлдвэрлэлийн эзлэх хувь · %", en: "Domestic production share of supply · %" },
      layout: "horizontal",
      height: 480,
    },
    {
      type: "category-bars",
      table: "importShare",
      dimension: PRODUCT,
      title: { mn: "Хангамжид импортын эзлэх хувь · %", en: "Import share of supply · %" },
      layout: "horizontal",
      height: 480,
    },
  ],
};
