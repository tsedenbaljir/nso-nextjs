import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const body = searchParams.get('body') || '';

    try {
        // Get paginated results
        const results = await db('web_1212_content')
            .select('header_image')
            .where({
                body: body
            })

        const nextResponse = NextResponse.json({
            status: true,
            data: results
        });

        return nextResponse;

    } catch (error) {
        return NextResponse.json(
            {
                status: false,
                data: null,
                message: "Failed to fetch articles: " + error.message
            },
            { status: 500 }
        );
    }
}