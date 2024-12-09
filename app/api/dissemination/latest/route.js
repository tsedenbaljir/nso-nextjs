import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    try {
        const results = await db.raw(`
            SELECT top(7) * FROM web_1212_content
            where content_type = 'NEWS' and language = ? and news_type = 'latest'
            ORDER BY published_date DESC
        `, [lng]);

        return NextResponse.json({
            status: true,
            data: results,
            message: ''
        });
    } catch (error) {
        console.error('Error fetching dissemination news:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: 'Failed to fetch dissemination news'
        }, { status: 500 });
    }
} 