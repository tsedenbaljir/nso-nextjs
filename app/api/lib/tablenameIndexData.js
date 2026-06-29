export async function fetchTablenameIndexData() {
  const response = await fetch(`${process.env.BASE_API_URL}/mn/NSO`, { cache: "no-store" });
  const textData = await response.text();
  const validJson = textData.replace(/^{.*?}\[/, "[");
  const categories = JSON.parse(validJson);

  if (!Array.isArray(categories)) {
    throw new Error("Invalid category data format.");
  }

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await fetch(
        `${process.env.BASE_API_URL}/mn/NSO/${encodeURIComponent(categoryId)}`,
        { cache: "no-store" }
      );
      const subText = await res.text();
      const subValidJson = subText.replace(/^{.*?}\[/, "[");
      const dt = JSON.parse(subValidJson);

      return Array.isArray(dt)
        ? dt.map((item) => ({
            id: item.id,
            label: item.text,
            parent_category: categoryId,
          }))
        : [];
    } catch (error) {
      console.error(`Error fetching subcategories for ${categoryId}:`, error);
      return [];
    }
  };

  const fetchTableName = async (sector, subsector) => {
    try {
      const tableResponse = await fetch(
        `${process.env.BASE_API_URL}/mn/NSO/${sector}/${subsector}`,
        { cache: "no-store" }
      );
      const tableText = await tableResponse.text();
      const tableJson = tableText.replace(/^{.*?}\[/, "[");
      const parsedData = JSON.parse(tableJson);

      return Array.isArray(parsedData)
        ? parsedData.map((item, index) => ({
            id: index + 1,
            link: item.id,
            name: item.text,
            date: item.updated,
            category: subsector,
            sector,
          }))
        : [];
    } catch (error) {
      console.error(`Error fetching table names for ${sector}/${subsector}:`, error);
      return [];
    }
  };

  const tableName = [];

  await Promise.all(
    categories.map(async (category) => {
      const subItems = await fetchSubcategories(category.id);
      const tables = await Promise.all(
        subItems.map(async (sub) => fetchTableName(category.id, sub.id))
      );
      tableName.push(...tables.flat());
    })
  );

  return tableName;
}
