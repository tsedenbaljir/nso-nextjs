import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const label = searchParams.get('label');
    const interval = searchParams.get('interval');
    const orgId = searchParams.get('orgId');
    const offset = page * pageSize;

    try {
        let filters = `WHERE active = 1 AND is_secret = 0`;
        const queryParams = [];

        if (label) {
            filters += ` AND label LIKE ?`;
            queryParams.push(`${label}%`);
        }
        
        if (interval) {
            filters += ` AND observe_interval = ?`;
            queryParams.push(interval);
        }
        
        if (orgId) {
            filters += ` AND organization_ids LIKE ?`;
            queryParams.push(`%${orgId}%`);
        }

        const dataQuery = `
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
            FROM [NSOweb].[dbo].[dynamic_object]
            ${filters}
            ORDER BY [last_modified_date] DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        `;

        queryParams.push(offset, pageSize);

        const results = await db.raw(dataQuery, queryParams);
        const data = Array.isArray(results) ? results : [results];

        const countQuery = `
            SELECT COUNT(*) as total
            FROM [NSOweb].[dbo].[dynamic_object]
            ${filters}
        `;
        const totalCountResult = await db.raw(countQuery, queryParams.slice(0, -2)); // skip offset, pageSize
        const totalCount = totalCountResult[0]?.total || 0;

        return NextResponse.json({
            status: true,
            data,
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
