import { NextResponse } from "next/server";

const BASE_API_URL = process.env.BASE_API_URL; // Use this in production instead of hardcoded localhost
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function to fetch subsectors by ID
const getSubsectors = async (subsectorId) => {
  if (!subsectorId) {
    return [];
  }

  try {
    const lng = "mn";
    const subsectorName = subsectorId;

    if (!subsectorName) {
      return NextResponse.json({ error: "Missing subsectorName parameter" }, { status: 400 });
    }

    if (!lng) {
      return NextResponse.json({ error: "Missing lng parameter" }, { status: 400 });
    }

    const myHeaders = new Headers();
    myHeaders.append("access-token", "a79fb6ab-5953-4c46-a240-a20c2af9150a");
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    const API_URL = `${BASE_API_URL}/${lng}/NSO/${encodeURIComponent(subsectorName)}`;

    const response = await fetch(API_URL, {
      ...requestOptions,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const textData = await response.text();
    const validJson = textData;
    const subcategories = JSON.parse(validJson);

    if (!Array.isArray(subcategories)) {
      return NextResponse.json({ error: "Unexpected API response format." }, { status: 500 });
    }

    return subcategories || [];
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
};

export async function GET(req) {
  try {
    const lng = "mn";
    // const lng = searchParams.get("lng");

    if (!lng) {
      return NextResponse.json({ error: "Missing lng parameter" }, { status: 400 });
    }

    const API_URL = `${BASE_API_URL}/${lng}/NSO`;

    const myHeaders = new Headers();
    myHeaders.append("access-token", "a79fb6ab-5953-4c46-a240-a20c2af9150a");
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    // Fetch categories from API
    const response = await fetch(API_URL, {
      ...requestOptions,
      cache: 'no-store',
    });

    const textData = await response.text();

    // Ensure JSON is valid by removing unexpected wrapping object
    const validJson = textData;
    const categories = JSON.parse(validJson);

    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Unexpected API response format." }, { status: 500 });
    }
    const allSubsectors = [];
    console.log(categories);
    for (const sector of categories.filter(sector => sector.text !== "Түүхэн Статистик")) {
      const subs = await getSubsectors(sector.id);
      allSubsectors.push(...subs.map(sub => ({ ...sub, sector: sector.text })));
    }


    return NextResponse.json({
      data: allSubsectors
    }); // Send categories as response
  } catch (error) {
    console.error("API Fetch Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }

}

