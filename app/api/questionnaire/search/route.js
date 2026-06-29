import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search');
    const lng = searchParams.get('lng') || 'mn';

    if (!searchTerm) {
        return NextResponse.json({
            status: false,
            message: 'Search term is required',
            data: null,
        }, { status: 400 });
    }

    try {
        const decodedSearchTerm = decodeURIComponent(searchTerm).trim();
        const searchPattern = `%${decodedSearchTerm}%`;

        const nameCol = lng === 'mn' ? 'label' : 'label_en';
        const descCol = lng === 'mn' ? 'descriptionmn' : 'descriptionen';

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
            FROM [NSOweb].[dbo].[dynamic_object]
            WHERE active = 1 AND is_secret = 0
            AND (${nameCol} LIKE ? OR ${descCol} LIKE ? OR [code] LIKE ?)
            ORDER BY [last_modified_date] DESC
        `;

        const results = await db.raw(query, [searchPattern, searchPattern, searchPattern]);
        const data = Array.isArray(results) ? results : [results];

        return NextResponse.json({
            status: true,
            data: data.filter(Boolean),
            message: '',
        });
    } catch (error) {
        console.error('Error searching questionnaire:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: 'Failed to search questionnaire',
        }, { status: 500 });
    }
}
