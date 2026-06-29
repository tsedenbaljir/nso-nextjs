import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results = await db.raw(`
            SELECT * FROM web_menus 
            WHERE is_active = 1
            ORDER BY list_order ASC
        `);

        return NextResponse.json({
            status: true,
            data: results,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching menus:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Цэс татахад алдаа гарлаа"
        }, { status: 500 });
    }
}
