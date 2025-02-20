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
                    "Cache-Control": "no-store", // Ensures no caching
                    "Pragma": "no-cache", // HTTP 1.0
                    "Expires": "0" // Proxies
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Tableau key');
        }

        const data = await response.json();
        
        // Return response with no-cache headers
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Error fetching Tableau key:", error);
        return NextResponse.json({ error: 'Failed to fetch Tableau key' }, { status: 500 });
    }
}
