import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sectorType = searchParams.get('sectorType');
    const search = searchParams.get('search');
    const lng = searchParams.get('lng') || 'mn';
    const role = searchParams.get('role');

    try {
        const offset = page * pageSize;

        // Build WHERE clause
        let whereConditions = [];
        const params = [];

        // Add published condition
        whereConditions.push(role === "admin" ? 'wg.published in(0,1)' : 'wg.published = 1');

        // Add sector type condition if provided
        if (sectorType) {
            whereConditions.push('wg.sector_type = ?');
            params.push(sectorType);
        }

        // Add search condition if provided
        if (search) {
            const searchCondition = lng === 'mn' 
                ? '(wg.name LIKE ? OR wg.info LIKE ?)'
                : '(wg.name_eng LIKE ? OR wg.info_eng LIKE ?)';
            whereConditions.push(searchCondition);
            const searchPattern = `%${decodeURIComponent(search)}%`;
            params.push(searchPattern, searchPattern);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM [NSOweb].[dbo].[web_1212_glossary] wg
            LEFT JOIN [NSOweb].[dbo].[sub_classification_code] scc 
                ON wg.[sector_type] = scc.[code]
            WHERE ${whereClause}
        `;

        const totalResult = await db.raw(countQuery, params);
        const totalCount = totalResult[0]?.total || 0;

        // Get paginated data
        const query = `
            SELECT 
                wg.[id],
                wg.[name],
                wg.[sector_type],
                wg.[source],
                wg.[info],
                wg.[published],
                wg.[created_by],
                wg.[created_date],
                wg.[last_modified_by],
                wg.[last_modified_date],
                wg.[name_eng],
                wg.[source_eng],
                wg.[info_eng],
                scc.[namemn] as sector_name_mn,
                scc.[nameen] as sector_name_en
            FROM [NSOweb].[dbo].[web_1212_glossary] wg
            LEFT JOIN [NSOweb].[dbo].[sub_classification_code] scc 
                ON wg.[sector_type] = scc.[code]
            WHERE ${whereClause}
            ORDER BY ${role === "admin" ? 'wg.created_date DESC' : 'wg.name ASC'}
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        `;

        const results = await db.raw(query, [...params, offset, pageSize]);
        const data = Array.isArray(results) ? results : [results];

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
        console.error('Error fetching glossary:', error);
        return NextResponse.json({
            status: false,
            data: null,
            pagination: {
                page,
                pageSize,
                total: 0
            },
            message: "Failed to fetch glossary"
        }, { status: 500 });
    }
} 