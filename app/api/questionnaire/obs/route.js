import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET() {
    try {
        const query = `
            SELECT [observe_interval], [namemn], [nameen], [count], [app_order]
            FROM (
            	SELECT [observe_interval], COUNT([id]) as [count]
            	FROM [NSOweb].[dbo].[dynamic_object] 
            	WHERE [active] = 1 and [is_secret] = 0
            	GROUP BY [observe_interval]
            	) AS a
            INNER JOIN (
            	SELECT [code], [namemn], [nameen], [app_order]
            	FROM [NSOweb].[dbo].[sub_classification_code_SPS]
            	WHERE [active] = 1 AND [classification_code_id] = 833001
            	) AS b ON a.[observe_interval] = b.[code]
            ORDER BY [app_order] 
        `;
        
        const results = await db.raw(query);
        return NextResponse.json(Array.isArray(results) ? results : [results]);
    } catch (error) {
        console.error('Error fetching sectors:', error);
        return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
    }
} 