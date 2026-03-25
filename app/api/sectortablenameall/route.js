import { NextResponse } from "next/server";

const BASE_API_URL = process.env.BASE_API_URL; // Use this in production instead of hardcoded localhost
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Agent } from "undici";

const insecure = new Agent({ connect: { rejectUnauthorized: false } });

const getTables = async (sectorId) => {
    if (!sectorId) {
        return [];
    }

    try {
        const lng = "mn";
        const sectorName = sectorId;

        if (!sectorName) {
            return [];
        }

        if (!lng) {
            return [];
        }

        const myHeaders = new Headers();
        myHeaders.append("access-token", "a79fb6ab-5953-4c46-a240-a20c2af9150a");
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        const API_URL = `${BASE_API_URL}/${lng}/NSO/${encodeURIComponent(sectorName)}`;

        const response = await fetch(API_URL, {
            ...requestOptions,
            cache: "no-store",
            dispatcher: insecure,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const textData = await response.text();
        const validJson = textData;
        const subcategories = JSON.parse(validJson);

        if (!Array.isArray(subcategories)) {
            return [];
        }

        // For each subsector, fetch its tables and concatenate
        const allTables = [];
        for (const subsector of subcategories) {
            try {
                const tablesResponse = await fetch(`${BASE_API_URL}/${lng}/NSO/${encodeURIComponent(sectorName)}/${encodeURIComponent(subsector.id)}`, {
                    ...requestOptions,
                    cache: "no-store",
                    dispatcher: insecure,
                });

                if (tablesResponse.ok) {
                    const tablesData = await tablesResponse.text();
                    const tables = JSON.parse(tablesData);

                    if (Array.isArray(tables)) {
                        // For each table, fetch its subtables and add context
                        for (const table of tables) {
                            try {
                                const subtablesResponse = await fetch(`${BASE_API_URL}/${lng}/NSO/${encodeURIComponent(sectorName)}/${encodeURIComponent(subsector.id)}/${encodeURIComponent(table.id)}`, {
                                    ...requestOptions,
                                    cache: "no-store",
                                    dispatcher: insecure,
                                });

                                let subtables = [];
                                if (subtablesResponse.ok) {
                                    const subtablesData = await subtablesResponse.text();
                                    const parsedSubtables = JSON.parse(subtablesData);
                                    if (Array.isArray(parsedSubtables)) {
                                        subtables = parsedSubtables;
                                    }
                                }

                                // Add sector, subsector, and subtables info to each table
                                const tableWithContext = {
                                    ...table,
                                    sector_id: sectorId,
                                    sector_name: sectorName,
                                    subsector_id: subsector.id,
                                    subsector_name: subsector.text,
                                    subtables: subtables
                                };
                                allTables.push(tableWithContext);
                            } catch (error) {
                                console.error(`Error fetching subtables for table ${table.id}:`, error);
                                // Add table without subtables if fetching fails
                                const tableWithContext = {
                                    ...table,
                                    sector_id: sectorId,
                                    sector_name: sectorName,
                                    subsector_id: subsector.id,
                                    subsector_name: subsector.text,
                                    subtables: []
                                };
                                allTables.push(tableWithContext);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching tables for subsector ${subsector.id}:`, error);
                // Continue with other subsectors even if one fails
            }
        }

        return allTables;
    } catch (error) {
        console.error("Error fetching subsectors:", error);
        return [];
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sectorId = searchParams.get("sector_id");
        const lng = searchParams.get("lng") || "mn";

        if (!lng) {
            return NextResponse.json({ error: "Missing lng parameter" }, { status: 400 });
        }

        // If sector_id is provided, return only that sector's tables
        if (sectorId) {
            const tables = await getTables(sectorId);
            return NextResponse.json({
                data: tables
            });
        }
        //---------------------------------------------------------------
        // Otherwise, return all sectors' tables
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
            // Add SSL handling for development
            dispatcher: insecure,
        });

        const textData = await response.text();

        // Ensure JSON is valid by removing unexpected wrapping object
        const validJson = textData;
        const categories = JSON.parse(validJson);

        if (!Array.isArray(categories)) {
            return NextResponse.json({ error: "Unexpected API response format." }, { status: 500 });
        }
        const allTables = [];
        for (const sector of categories.filter(e => e.id !== "Historical data")) {
            const tables = await getTables(sector.id);
            allTables.push(...tables);
        }

        return NextResponse.json({
            data: allTables
        }); // Send all tables with sector and subsector info
    } catch (error) {
        console.error("API Fetch Error:", error);
        return NextResponse.json({ error: "Internal server error1." }, { status: 500 });
    }

}

