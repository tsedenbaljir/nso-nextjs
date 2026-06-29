
export type BusTreeNode = {
  title: string;
  key: string;
  value: string;
  children?: { title: string; key: string; value: string }[];
};

export function buildBusTreeData(
  values: string[],
  valueTexts: string[]
): { treeData: BusTreeNode[]; expandToLeafCodes: (selected: string[]) => string[] } {
  const treeData: BusTreeNode[] = [];
  const parentToChildren: Record<string, string[]> = {};
  let currentParent: (BusTreeNode & { children: { title: string; key: string; value: string }[] }) | null = null;
  const REGION_CODES = new Set(["1", "2", "3", "4", "5"]);

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const label = valueTexts?.[i] ?? val;
    const isRegion =
      REGION_CODES.has(String(val)) ||
      (typeof label === "string" && label.includes("бүс"));
    if (isRegion) {
      currentParent = { title: label, key: val, value: val, children: [] };
      treeData.push(currentParent);
      parentToChildren[val] = [];
    } else if (currentParent) {
      currentParent.children!.push({ title: label, key: val, value: val });
      parentToChildren[currentParent.value].push(val);
    } else {
      treeData.push({ title: label, key: val, value: val });
    }
  }

  const expandToLeafCodes = (selected: string[]): string[] => {
    const out: string[] = [];
    for (const code of selected) {
      if (parentToChildren[code]?.length) out.push(...parentToChildren[code]);
      else out.push(code);
    }
    return [...new Set(out)];
  };
  return { treeData, expandToLeafCodes };
}
