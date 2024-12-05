import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET() {
    try {
        const query = `
            SELECT DISTINCT 
                scc.[id],
                scc.[namemn],
                scc.[nameen],
                scc.[code],
                scc.[app_order],
                COUNT(wg.id) as count
            FROM [NSOweb].[dbo].[sub_classification_code] scc
            LEFT JOIN [NSOweb].[dbo].[web_1212_glossary] wg 
                ON scc.[code] = wg.[sector_type]
                AND wg.published = 1
            GROUP BY 
                scc.[id],
                scc.[namemn],
                scc.[nameen],
                scc.[code],
                scc.[app_order]
            HAVING COUNT(wg.id) > 0
            ORDER BY scc.[app_order]
        `;
        
        const results = await db.raw(query);
        return NextResponse.json(Array.isArray(results) ? results : [results]);
    } catch (error) {
        console.error('Error fetching sectors:', error);
        return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
    }
} 