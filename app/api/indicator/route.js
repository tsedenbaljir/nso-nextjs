import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const label = decodeURIComponent(searchParams.get('label') || '');
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    try {
        const offset = page * pageSize;
        let filters = `WHERE [type] = 'indicator' AND [active] = 1 AND [version] = '1' AND [is_current] = 1 AND [is_secure] = 0 `;
        // const queryParams = [];
        if (label) {
            filters += ` AND [namemn] LIKE N'${label}%'`;
        }
        const query = `
            SELECT 
                [id],
                [version],
                [type],
                [active],
                [namemn] as name,
                [nameen] as name_eng,
                [is_current],
                [previous_version],
                [is_secure],
                [status],
                [created_by],
                [created_date],
                [last_modified_by],
                [last_modified_date],
                [deleted],
                [descriptionen],
                [descriptionmn],
                [views]
            FROM [NSOweb].[dbo].[question_pool]
            ${filters}
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
            FROM [NSOweb].[dbo].[question_pool]
            ${filters}
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
export async function POST(req) {
    const {id} = await req.json();

    try {
        const selectQuery = `
            SELECT 
                m.[id],
                m.[code],
                m.[active],
                mdv.[valueen] AS dataValueEn,
                mdv.[valuemn] AS dataValueMn,
                m.[nameen],
                m.[namemn],
                m.[data_value] AS dataValueIdEn,
                m.[data_value] AS dataValueIdMn
            FROM 
                [meta_data] m
            JOIN 
                [meta_data_value] mdv ON m.id = mdv.meta_data_id
            WHERE 
                mdv.questionpool_id = ${id}
        `;
        
        const result = await db.raw(selectQuery);

        return new Response(
            JSON.stringify({
                status: true,
                data: result,
                message: "Data fetched successfully"
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error inserting data:', error);
        return new Response(
            JSON.stringify({
                status: false,
                message: "Failed to insert data",
                error: error.message
            }),
            { status: 500 }
        );
    }
}