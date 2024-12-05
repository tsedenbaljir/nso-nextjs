import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sectorType = searchParams.get('sectorType');
    
    try {
        const offset = page * pageSize;
        
        // First, get total count with the same filters
        const countQuery = `
            SELECT COUNT(*) as total
            FROM [NSOweb].[dbo].[web_1212_glossary] wg
            LEFT JOIN [NSOweb].[dbo].[sub_classification_code] scc 
                ON wg.[sector_type] = scc.[code]
            WHERE wg.published = 1
            ${sectorType ? 'AND wg.sector_type = ?' : ''}
        `;

        const countParams = sectorType ? [sectorType] : [];
        const totalResult = await db.raw(countQuery, countParams);
        const totalCount = totalResult[0]?.total || 0;

        // Then get the paginated data
        const query = `
            SELECT 
                wg.[id],
                wg.[name],
                wg.[sector_type],
                wg.[source],
                wg.[info],
                wg.[published],
                wg.[list_order],
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
            WHERE wg.published = 1
            ${sectorType ? 'AND wg.sector_type = ?' : ''}
            ORDER BY wg.name ASC
            OFFSET ? ROWS
            FETCH NEXT ? ROWS ONLY
        `;

        const params = [...countParams, offset, pageSize];
        const results = await db.raw(query, params);
        const data = Array.isArray(results) ? results : [results];

        const nextResponse = NextResponse.json({
            status: true,
            data: data,
            pagination: {
                page,
                pageSize,
                total: totalCount
            },
            message: ""
        });

        nextResponse.headers.set('X-Total-Count', totalCount.toString());
        nextResponse.headers.set('X-Page', page.toString());
        nextResponse.headers.set('X-Page-Size', pageSize.toString());

        return nextResponse;

    } catch (error) {
        console.error('Error fetching glossary:', error);
        return NextResponse.json(
            {
                status: false,
                data: null,
                pagination: {
                    page,
                    pageSize,
                    total: 0
                },
                message: "Failed to fetch glossary"
            },
            { status: 500 }
        );
    }
} 