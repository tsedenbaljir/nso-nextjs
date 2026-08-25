import products from "@/lib/commodity-price-dashboard/products.json";

export const GROUPS = [
  { id: "all", label: "Бүгд" },
  { id: "food", label: "Хүнс", category: "хүнс" },
  { id: "meat", label: "Мах", category: "мах" },
  { id: "dairy", label: "Сүү, цагаан идээ", category: "сүү" },
  { id: "fuel", label: "Шатахуун", category: "түлш" },
] as const;

const CATEGORY_BY_NAME = new Map(
  products.products.map((product) => [product.name, product.category]),
);

export type GroupId = (typeof GROUPS)[number]["id"];

export function matchesGroup(product: string, groupId: GroupId) {
  if (groupId === "all") return true;
  const group = GROUPS.find((item) => item.id === groupId);
  if (!group || !("category" in group)) return true;
  return CATEGORY_BY_NAME.get(product) === group.category;
}
