import { NextResponse } from "next/server";
import { Agent } from "undici";
import { decodeQueryParam } from "@/utils/resolveMediaUrl";

const BASE_API_URL = process.env.BASE_API_URL;
// export const dynamicParams = true;
export const dynamic = 'force-dynamic';

const insecure = new Agent({ connect: { rejectUnauthorized: false } });

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get("lng");
    let subsectorName = searchParams.get("subsectorname");

    if (!subsectorName) {
      return NextResponse.json({ error: "Missing subsectorName parameter" }, { status: 400 });
    }

    subsectorName = decodeQueryParam(subsectorName);

    if (!lng) {
      return NextResponse.json({ error: "Missing lng parameter" }, { status: 400 });
    }

    if (!BASE_API_URL) {
      console.error("BASE_API_URL is not configured");
      return NextResponse.json({ error: "API not configured" }, { status: 500 });
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
      dispatcher: insecure,
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 404) {
        return NextResponse.json({ data: [] });
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const textData = await response.text();
    const validJson = textData;
    const subcategories = JSON.parse(validJson);
    
    if (!Array.isArray(subcategories)) {
      return NextResponse.json({ error: "Unexpected API response format." }, { status: 500 });
    }

    return NextResponse.json({ data: subcategories });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
