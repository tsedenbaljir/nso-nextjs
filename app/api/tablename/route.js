import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch categories from API
    const response = await fetch(`${process.env.BASE_API_URL}/mn/NSO`);
    const textData = await response.text();
    const validJson = textData.replace(/^{.*?}\[/, "[");
    const categories = JSON.parse(validJson);

    if (!Array.isArray(categories)) {
      console.error("Unexpected API response format:", categories);
      return NextResponse.json({ error: "Invalid category data format." }, { status: 500 });
    }

    // Function to fetch subcategories for a given category
    const fetchSubcategories = async (categoryId) => {
      try {
        const res = await fetch(`${process.env.BASE_API_URL}/mn/NSO/${encodeURIComponent(categoryId)}`);
        const subText = await res.text();
        const subValidJson = subText.replace(/^{.*?}\[/, "[");
        const dt = JSON.parse(subValidJson);

        return Array.isArray(dt) ? dt.map((item) => ({
          id: item.id,
          label: item.text,
          parent_category: categoryId,
        })) : [];
      } catch (error) {
        console.error(`Error fetching subcategories for ${categoryId}:`, error);
        return [];
      }
    };

    // Function to fetch table names for sector/subsector
    const fetchTableName = async (sector, subsector) => {
      try {
        const response = await fetch(`${process.env.BASE_API_URL}/mn/NSO/${sector}/${subsector}`);
        const textData = await response.text();
        const validJson = textData.replace(/^{.*?}\[/, "[");
        const parsedData = JSON.parse(validJson);

        return Array.isArray(parsedData)
          ? parsedData.map((item, index) => ({
              id: index + 1,
              link: item.id,
              name: item.text,
              date: item.updated,
              category: subsector,
              sector: sector,
            }))
          : [];
      } catch (error) {
        console.error(`Error fetching table names for ${sector}/${subsector}:`, error);
        return [];
      }
    };

    let TableName = [];

    // Fetch subcategories for all categories & then fetch table names
    await Promise.all(
      categories.map(async (category) => {
        const subItems = await fetchSubcategories(category.id);

        const tables = await Promise.all(
          subItems.map(async (sub) => {
            return await fetchTableName(category.id, sub.id);
          })
        );

        // Flatten array & add to TableName
        TableName.push(...tables.flat());
      })
    );

    return NextResponse.json({ response: TableName });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
