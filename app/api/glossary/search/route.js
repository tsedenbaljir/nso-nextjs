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
                id, name, sector_type, source, info, published,
                list_order, created_by, created_date, 
                last_modified_by, last_modified_date,
                name_eng, source_eng, info_eng
            FROM [NSOweb].[dbo].[web_1212_glossary]
            WHERE published = 1
            AND (
                ${lng === 'mn' 
                    ? 'name LIKE ? OR info LIKE ?' 
                    : 'name_eng LIKE ? OR info_eng LIKE ?'
                }
            )
            ORDER BY list_order ASC
        `;

        const searchPattern = `%${searchTerm}%`;
        const params = [searchPattern, searchPattern];

        const results = await db.raw(query, params);
        const data = results[0];

        return NextResponse.json({
            status: true,
            data: Array.isArray(data) ? data : [data],
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