import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        // First check if category is being used by any menus
        const [menuCount] = await db.raw(`
            SELECT COUNT(*) as count 
            FROM web_menus 
            WHERE category_id = ? AND is_active = 1
        `, [id]);

        if (menuCount && menuCount.count > 0) {
            return NextResponse.json({
                status: false,
                message: "Энэ ангилалд цэс бүртгэлтэй байгаа тул устгах боломжгүй"
            }, { status: 400 });
        }

        // Soft delete the category
        await db.raw(`
            UPDATE web_menu_categories 
            SET is_active = 0,
                last_modified_date = GETDATE()
            WHERE id = ?
        `, [id]);

        return NextResponse.json({
            status: true,
            message: "Ангилал амжилттай устгагдлаа"
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({
            status: false,
            message: "Ангилал устгахад алдаа гарлаа"
        }, { status: 500 });
    }
} 