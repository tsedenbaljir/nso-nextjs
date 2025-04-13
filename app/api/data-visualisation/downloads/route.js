import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const data_viz_id = searchParams.get('data_viz_id');

        if (!data_viz_id) {
            return NextResponse.json({ error: 'data_viz_id is required' }, { status: 400 });
        }

        const query = `
            SELECT [id]
                ,[name]
                ,[language]
                ,[file_type]
                ,[file_info]
                ,[file_size]
                ,[views]
                ,[published]
                ,[published_date]
                ,[list_order]
                ,[info]
                ,[data_viz_id]
            FROM [NSOweb].[dbo].[web_1212_download] 
            WHERE [data_viz_id] = ? AND [published] = 1
            ORDER BY [list_order], [created_date] DESC
        `;

        const results = await db.raw(query, [data_viz_id]);
        return NextResponse.json(Array.isArray(results) ? results : [results]);
    } catch (error) {
        console.error('Error fetching download data:', error);
        return NextResponse.json({ error: 'Failed to fetch download data' }, { status: 500 });
    }
} 