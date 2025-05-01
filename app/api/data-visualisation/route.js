import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const query = `
                SELECT  [id]
                    ,[name]
                    ,[name_eng]
                    ,[info]
                    ,[info_eng]
                    ,[views]
                    ,[list_order]
                    ,[tableau]
                    ,[tableau_mobile]
                    ,[published]
                    ,[published_date]
                    ,[created_by]
                    ,[created_date]
                    ,[last_modified_by]
                    ,[last_modified_date]
                    ,[file_info]
                FROM [NSOweb].[dbo].[web_1212_data_viz]
                WHERE published = 1 AND id = ?
            `;
            const results = await db.raw(query, [id]);
            return NextResponse.json(Array.isArray(results) ? results[0] : results);
        } else {
            const query = `
                SELECT  [id]
                    ,[name]
                    ,[name_eng]
                    ,[info]
                    ,[info_eng]
                    ,[views]
                    ,[list_order]
                    ,[tableau]
                    ,[tableau_mobile]
                    ,[published]
                    ,[published_date]
                    ,[created_by]
                    ,[created_date]
                    ,[last_modified_by]
                    ,[last_modified_date]
                    ,[file_info]
                FROM [NSOweb].[dbo].[web_1212_data_viz]
                WHERE published = 1
                ORDER BY created_date DESC
            `;
            const results = await db.raw(query);
            return NextResponse.json(Array.isArray(results) ? results : [results]);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
} 