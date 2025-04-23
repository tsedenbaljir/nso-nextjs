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
                ,[tableau]
                ,[tableau_eng]
                ,[published]
                ,[published_date]
                ,[created_by]
                ,[created_date]
                ,[last_modified_by]
                ,[last_modified_date]
                ,[data_viz_id]
                ,[list_order]
                ,[name]
                ,[name_eng]
                ,[file_info]
            FROM [NSOweb].[dbo].[web_1212_data_viz_tableau]
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