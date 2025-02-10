import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const info = searchParams.get('info');
    try {
        const results = await db.raw(`
            SELECT * FROM web_1212_download
            WHERE info = ? and language = ? and published = 1 and file_type = 'report'
            order by published_date desc
        `, [info, lng]);
            
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
