import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const results = await db.raw(`
            SELECT * FROM web_menu_categories 
            WHERE is_active = 1
            ORDER BY list_order ASC
        `);

        return NextResponse.json({
            status: true,
            data: results,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Ангилал татахад алдаа гарлаа"
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const currentDate = new Date().toISOString();

        await db.raw(`
            INSERT INTO web_menu_categories (
                name, list_order,
                created_by, created_date,
                last_modified_by, last_modified_date,
                is_active
            ) VALUES (
                ?, ?,
                ?, ?,
                ?, ?,
                1
            )
        `, [
            data.name,
            data.list_order || 0,
            data.created_by || 'admin',
            currentDate,
            data.created_by || 'admin',
            currentDate
        ]);

        return NextResponse.json({
            status: true,
            message: "Ангилал амжилттай нэмэгдлээ"
        });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({
            status: false,
            message: "Ангилал нэмэхэд алдаа гарлаа"
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const data = await req.json();
        const currentDate = new Date().toISOString();

        await db.raw(`
            UPDATE web_menu_categories 
            SET name = ?,
                list_order = ?,
                last_modified_by = ?,
                last_modified_date = ?
            WHERE id = ?
        `, [
            data.name,
            data.list_order || 0,
            data.last_modified_by || 'admin',
            currentDate,
            data.id
        ]);

        return NextResponse.json({
            status: true,
            message: "Ангилал амжилттай засагдлаа"
        });

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({
            status: false,
            message: "Ангилал засварлахад алдаа гарлаа"
        }, { status: 500 });
    }
} 