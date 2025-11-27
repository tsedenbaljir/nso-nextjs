import { NextResponse } from "next/server";
import { homoStatistic } from "@/app/api/config/db_csweb.config.js";

/**
 * GET /api/historical-names
 * Fetches historical given names and their population counts
 */
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Call stored procedure for historical given names
        const result = await homoStatistic.raw('EXEC [dbo].[ServiceByHistoricalGivenName]');

        // Extract data from stored procedure result
        // Knex raw() returns the result directly for MSSQL
        let data = Array.isArray(result) ? result : [];

        if (!Array.isArray(data) || data.length === 0) {
            console.error('No data returned from stored procedure');
            return NextResponse.json({
                success: false,
                error: 'Өгөгдөл олдсонгүй',
                names: []
            });
        }

        // Format the data - use Cyrillic names directly for image filenames
        const names = data.map(row => {
            const givenName = row.GivenName || '';
            const population = row.Pop || 0;
            const imageUrl = givenName ? `${givenName}.jpg` : '';
            
            return {
                givenName,
                population,
                imageUrl
            };
        });

        return NextResponse.json({
            success: true,
            names
        });
    } catch (error) {
        console.error('Historical names API error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Өгөгдөл татахад алдаа гарлаа',
                names: []
            },
            { status: 500 }
        );
    }
}

