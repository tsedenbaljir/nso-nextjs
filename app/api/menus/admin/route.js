import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results = await db.raw(`
            SELECT * FROM web_menus 
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

export async function POST(req) {
    try {
        const data = await req.json();
        const currentDate = new Date().toISOString();

        await db.raw(`
            INSERT INTO web_menus (
                name_mn, name_en, url, parent_id, category_id,
                list_order, created_by, created_date,
                last_modified_by, last_modified_date,
                is_active, path
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?, ?
            )
        `, [
            data.name_mn,
            data.name_en,
            data.url,
            data.parent_id || null,
            data.category_id || null,
            data.list_order || 0,
            data.created_by || 'admin',
            currentDate,
            data.created_by || 'admin',
            currentDate,
            data.is_active ?? true,
            data.path || null
        ]);

        return NextResponse.json({
            status: true,
            message: "Цэс амжилттай нэмэгдлээ"
        });

    } catch (error) {
        console.error('Error creating menu:', error);
        return NextResponse.json({
            status: false,
            message: "Цэс нэмэхэд алдаа гарлаа"
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const data = await req.json();
        const currentDate = new Date().toISOString();

        await db.raw(`
            UPDATE web_menus 
            SET name_mn = ?,
                name_en = ?,
                url = ?,
                parent_id = ?,
                category_id = ?,
                list_order = ?,
                last_modified_by = ?,
                last_modified_date = ?,
                is_active = ?,
                path = ?
            WHERE id = ?
        `, [
            data.name_mn,
            data.name_en,
            data.url,
            data.parent_id || null,
            data.category_id || null,
            data.list_order || 0,
            data.last_modified_by || 'admin',
            currentDate,
            data.is_active ?? true,
            data.path || null,
            data.id
        ]);

        return NextResponse.json({
            status: true,
            message: "Цэс амжилттай засагдлаа"
        });

    } catch (error) {
        console.error('Error updating menu:', error);
        return NextResponse.json({
            status: false,
            message: "Цэс засварлахад алдаа гарлаа",
            error: error.message
        }, { status: 500 });
    }
} 