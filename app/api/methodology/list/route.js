import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const catalogueId = searchParams.get('catalogue_id');
    const lng = searchParams.get('lng') || 'mn';

    try {
        const offset = page * pageSize;

        // Build WHERE clause
        let whereConditions = ['published = 1', 'language = ?'];
        const params = [lng];

        // Add catalogue_id filter if provided
        if (catalogueId) {
            whereConditions.push('catalogue_id = ?');
            params.push(catalogueId);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM web_1212_methodology
            WHERE ${whereClause}
        `;

        const totalResult = await db.raw(countQuery, params);
        const totalCount = totalResult[0]?.total || 0;

        // Get paginated data
        const query = `
            SELECT * 
            FROM web_1212_methodology
            WHERE ${whereClause}
            ORDER BY approved_date DESC
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
        console.error('Error fetching methodology:', error);
        return NextResponse.json({
            status: false,
            data: null,
            pagination: {
                page,
                pageSize,
                total: 0
            },
            message: "Failed to fetch methodology"
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { id } = body || {};

        if (!id) {
            return NextResponse.json({
                status: false,
                message: 'id is required'
            }, { status: 400 });
        }

        await db.raw(`
            UPDATE [NSOweb].[dbo].[web_1212_methodology]
            SET views = COALESCE(CAST(views AS INT), 0) + 1
            WHERE id = ?
        `, [id]);

        return NextResponse.json({
            status: true,
            message: 'Views incremented'
        });
    } catch (error) {
        console.error('Error updating download views:', error);
        return NextResponse.json({
            status: false,
            message: 'Failed to update views: ' + error.message
        }, { status: 500 });
    }
}