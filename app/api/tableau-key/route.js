import { NextResponse } from "next/server";
import axios from 'axios';

export const dynamic = "force-dynamic";

export async function GET() {
    const params = new URLSearchParams();
    params.append('key', 'value');

    try {
        // Fetch data using axios instead of fetch
        const response = await axios.get(
            `https://gateway.1212.mn/services/dynamic/api/public/tableau-report?${params.toString()}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store", // Prevent caching at all levels
                    "Pragma": "no-cache", // HTTP 1.0
                    "Expires": "0" // Prevent caching by proxies
                },
            }
        );

        // With axios, the data is already parsed (no need for .json())
        const apiResponse = NextResponse.json(response.data, { status: 200 });

        // Prevent caching for the API response
        apiResponse.headers.set('Cache-Control', 'no-store'); // no-store prevents any caching
        apiResponse.headers.set('Pragma', 'no-cache'); // Disable caching in HTTP/1.0
        apiResponse.headers.set('Expires', '0'); // Expired immediately

        return apiResponse;
    } catch (error) {
        console.error("Error fetching Tableau key:", error);
        return NextResponse.json({ error: 'Failed to fetch Tableau key' }, { status: 500 });
    }
}
