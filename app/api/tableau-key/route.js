import { NextResponse } from "next/server";

export async function GET() {
    const params = new URLSearchParams();
    params.append('key', 'value');

    try {
        // Fetch data from the external API using `fetch`
        const response = await fetch(
            `https://gateway.1212.mn/services/dynamic/api/public/tableau-report?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store", // Prevent caching at all levels
                    "Pragma": "no-cache", // HTTP 1.0
                    "Expires": "0" // Prevent caching by proxies
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Tableau key');
        }

        const data = await response.json();
        
        // Return the response from Next.js API with no-cache headers
        const apiResponse = NextResponse.json(data, { status: 200 });

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
