import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        const { id } = params;
        // First check if article exists
        const [article] = await db.raw(`
            SELECT * FROM web_1212_content 
            WHERE id = ?
        `, [id]);
        if (!article || article.length === 0) {
            return NextResponse.json({
                status: false,
                data: null,
                message: "Мэдээлэл олдсонгүй"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            data: article,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching dissemination:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Мэдээлэл татахад алдаа гарлаа"
        }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = params;
        const data = await req.json();

        await db.raw(`
            UPDATE web_1212_content 
            SET name = ?,
                language = ?,
                body = ?,
                published = ?,
                news_type = ?,
                published_date = ?,
                header_image = ?,
                last_modified_by = ?,
                last_modified_date = ?,
                slug = ?
            WHERE id = ? AND content_type = 'NEWS' AND news_type in('LATEST', 'FUTURE')
        `, [
            data.name,
            data.language,
            data.body,
            data.published,
            data.news_type,
            data.published_date,
            data.header_image,
            data.last_modified_by,
            data.last_modified_date,
            data.slug,
            id
        ]);

        return NextResponse.json({
            status: true,
            message: "Мэдээлэл амжилттай хадгалагдлаа"
        });

    } catch (error) {
        console.error('Error updating dissemination:', error);
        return NextResponse.json({
            status: false,
            message: "Мэдээлэл засварлахад алдаа гарлаа"
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params;

        await db.raw(`
            DELETE FROM web_1212_content 
            WHERE id = ? AND content_type = 'NEWS' AND news_type in('LATEST', 'FUTURE')
        `, [id]);

        return NextResponse.json({
            status: true,
            message: "Мэдээлэл амжилттай устгагдлаа"
        });

    } catch (error) {
        console.error('Error deleting dissemination:', error);
        return NextResponse.json({
            status: false,
            message: "Мэдээлэл устгахад алдаа гарлаа"
        }, { status: 500 });
    }
} 