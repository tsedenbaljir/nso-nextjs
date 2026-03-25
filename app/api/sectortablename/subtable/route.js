import { NextResponse } from "next/server";
import { Agent } from "undici";

export const dynamic = 'force-dynamic';

const insecure = new Agent({ connect: { rejectUnauthorized: false } });

export async function GET(req) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get("lng");
    const sector = searchParams.get("sector");
    const subsector = searchParams.get("subsector");
    const subtables = searchParams.get("subtables");

    // Validate input
    if (!sector || !subsector) {
      return NextResponse.json(
        { error: "Missing required parameters: sector and subsector" },
        { status: 400 }
      );
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

    // Construct the API URL
    const API_URL = `${process.env.BASE_API_URL}/${lng}/NSO/${encodeURIComponent(sector)}/${encodeURIComponent(subsector)}/${encodeURIComponent(subtables)}`;
    
    // Fetch data from the external API
    const response = await fetch(API_URL, {
      ...requestOptions,
      cache: "no-store",
      dispatcher: insecure,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Convert response to JSON
    const textData = await response.text();
    
    const validJson = textData;
    const parsedData = JSON.parse(validJson);

    // Ensure it's an array before returning
    if (!Array.isArray(parsedData)) {
      return NextResponse.json(
        { error: "Unexpected API response format." },
        { status: 500 }
      );
    }

    // Return the formatted response
    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error.", details: error.message },
      { status: 500 }
    );
  }
}
