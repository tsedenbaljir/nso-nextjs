import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search');
    const lng = searchParams.get('lng') || 'mn';
    
    if (!searchTerm) {
        return NextResponse.json({
            status: false,
            message: "Search term is required",
            data: null
        }, { status: 400 });
    }

    try {
        const query = `
            SELECT 
                wg.id, 
                wg.name, 
                wg.sector_type, 
                wg.source, 
                wg.info, 
                wg.published,
                wg.list_order, 
                wg.created_by, 
                wg.created_date, 
                wg.last_modified_by, 
                wg.last_modified_date,
                wg.name_eng, 
                wg.source_eng, 
                wg.info_eng,
                scc.namemn as sector_name_mn,
                scc.nameen as sector_name_en
            FROM [NSOweb].[dbo].[web_1212_glossary] wg
            LEFT JOIN [NSOweb].[dbo].[sub_classification_code] scc 
                ON wg.sector_type = scc.code
            WHERE wg.published = 1
            AND (
                ${lng === 'mn' 
                    ? 'wg.name LIKE ? OR wg.info LIKE ?' 
                    : 'wg.name_eng LIKE ? OR wg.info_eng LIKE ?'
                }
            )
            ORDER BY wg.name ASC
        `;

        const decodedSearchTerm = decodeURIComponent(searchTerm).trim();
        const searchPattern = `%${decodedSearchTerm}%`;
        const params = [searchPattern, searchPattern];

        console.log('Search Term:', decodedSearchTerm); // For debugging
        console.log('Query:', query); // For debugging

        const results = await db.raw(query, params);
        const data = results[0];

        // Log the number of results found
        console.log('Results found:', Array.isArray(data) ? data.length : (data ? 1 : 0));

        return NextResponse.json({
            status: true,
            data: Array.isArray(data) ? data : (data ? [data] : []),
            message: ""
        });

    } catch (error) {
        console.error('Error searching glossary:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Failed to search glossary"
        }, { status: 500 });
    }
} 