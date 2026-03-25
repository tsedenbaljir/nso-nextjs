import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const info = searchParams.get('info');
    const type = searchParams.get('type');
    try {
        // SELECT * FROM web_1212_download
        // WHERE info = ? and language = ? and published = 1 and file_type = ?
        // order by published_date desc
        const results = await db.raw(`
            SELECT *
                FROM [NSOweb].[dbo].[web_1212_download]
                WHERE info = ? and language = ? and published = 1 and file_type = ?
                order by published_date desc
        `, [info, lng, type]);

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
            UPDATE [NSOweb].[dbo].[web_1212_download]
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