import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Set query parameters
        const params = new URLSearchParams();
        params.append("username", "ViewerUser");

        // Fetch data from the external API
        const response = await axios.get(
            "https://gateway.1212.mn/services/dynamic/api/public/tableau-report",
            { params }
        );

        // Return response data
        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Error fetching Tableau report:", error);
        return NextResponse.json({ error: "Failed to fetch Tableau report" }, { status: 500 });
    }
}
