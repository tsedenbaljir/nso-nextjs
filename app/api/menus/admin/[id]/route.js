import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        const { id } = params;
        const [menu] = await db.raw(`
            SELECT * FROM web_menus 
            WHERE id = ?
        `, [id]);

        if (!menu) {
            return NextResponse.json({
                status: false,
                message: "Цэс олдсонгүй"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            data: menu,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching menu:', error);
        return NextResponse.json({
            status: false,
            message: "Цэс татахад алдаа гарлаа"
        }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = params;
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
            id
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

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        await db.raw(`
            DELETE FROM web_menus 
            WHERE id = ?
        `, [id]);

        return NextResponse.json({
            status: true,
            message: "Цэс амжилттай устгагдлаа"
        });

    } catch (error) {
        console.error('Error deleting menu:', error);
        return NextResponse.json({
            status: false,
            message: "Цэс устгахад алдаа гарлаа",
            error: error.message
        }, { status: 500 });
    }
} 