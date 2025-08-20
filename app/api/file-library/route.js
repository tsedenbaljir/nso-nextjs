import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const type = searchParams.get('type');
    const searchTerm = searchParams.get('searchTerm');

    try {
        let baseQuery = `
            SELECT * FROM web_1212_download
            WHERE language = ?
            AND published = 1
        `;
        const queryParams = [lng];

        if (type === "all") {
            baseQuery += ` AND file_type IN (
                'nso-magazine', 'magazine', 'census', 'survey', 'infographic',
                'weekprice', 'foreigntrade', 'presentation', 'bulletin', 'annual',
                'livingstandart', 'agricultural_census', 'enterprise_census',
                'livestock_census', 'pahc'
            )`;
        } else {
            baseQuery += ` AND file_type = ?`;
            queryParams.push(type);
        }

        if (searchTerm?.trim()) {
            baseQuery += ` AND name LIKE ?`;
            queryParams.push(`%${searchTerm.trim()}%`);
        }

        baseQuery += ` ORDER BY published_date DESC`;

        const results = await db.raw(baseQuery, queryParams);

        return NextResponse.json({
            status: true,
            data: results,
            message: ""
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Internal server error"
        }, { status: 500 });
    }
}

export async function POST(req) {
    const body = await req.json();
    const { id } = body;

    try {
        // Update total views count only if article exists
        await db.raw(`
            UPDATE web_1212_download 
            SET views = COALESCE(CAST(views AS INT), 0) + 1 
            WHERE id = ?
            `, [id]);

        return NextResponse.json({
            status: true,
            message: ""
        });
    } catch (error) {
        return NextResponse.json({
            status: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}
