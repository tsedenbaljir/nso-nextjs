import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    try {
        const offset = page * pageSize;
        
        // Define the SQL query with necessary filters and pagination
        const query = `
            SELECT [id]
                ,[common_code_id]
                ,[code]
                ,[before_version]
                ,[version]
                ,[label_en] as name_eng
                ,[label] as name
                ,[description]
                ,[start_date]
                ,[end_date]
                ,[published]
                ,[active]
                ,[last_version]
                ,[is_secret]
                ,[created_by]
                ,[created_date]
                ,[last_modified_by]
                ,[last_modified_date]
                ,[form_status]
                ,[observe_interval]
                ,[descriptionen]
                ,[descriptionmn]
                ,[organization_ids]
                ,[approved_date]
                ,[views]
            FROM [NSOweb].[dbo].[dynamic_object] where active = 1 and is_secret = 0
            ORDER BY [last_modified_date] DESC
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        `;

        // Execute the query with pagination parameters
        const results = await db.raw(query, [offset, pageSize]);
        const data = Array.isArray(results) ? results : [results];

        // Optionally, calculate total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM [NSOweb].[dbo].[dynamic_object]
            where active = 1 and is_secret = 0
        `;

        const totalResult = await db.raw(countQuery);
        const totalCount = totalResult[0]?.total || 0;

        return NextResponse.json({
            status: true,
            data: data,
            pagination: {
                page,
                pageSize,
                total: totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({
            status: false,
            data: null,
            pagination: {
                page,
                pageSize,
                total: 0
            },
            message: "Failed to fetch data"
        }, { status: 500 });
    }
}