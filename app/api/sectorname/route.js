import { NextResponse } from "next/server";

    
const BASE_API_URL = process.env.BASE_API_URL; // Ensure environment variable is set
export const dynamicParams = true;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get("lng");
    
    const API_URL = `${BASE_API_URL}/${lng}/NSO`;
    
    // Fetch categories from API
    const response = await fetch(API_URL);
    
    const textData = await response.text();
    
    // Ensure JSON is valid by removing unexpected wrapping object
    const validJson = textData.replace(/^{.*?}\[/, "[");
    const categories = JSON.parse(validJson);

    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: "Unexpected API response format." }, { status: 500 });
    }

    return NextResponse.json({ data: categories }); // Send categories as response
  } catch (error) {
    console.error("API Fetch Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
