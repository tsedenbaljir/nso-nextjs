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

        // Validate required fields
        if (!data.name || !data.language || !data.body) {
            return NextResponse.json({
                status: false,
                message: "Шаардлагатай талбаруудыг бөглөнө үү"
            }, { status: 400 });
        }

        // Ensure all values are properly defined and convert to appropriate types
        const updateData = {
            name: data.name,
            language: data.language,
            body: data.body,
            published: data.published,
            news_type: data.news_type,
            published_date: data.published_date || null,
            header_image: data.header_image,
            last_modified_by: data.last_modified_by,
            last_modified_date: data.last_modified_date || new Date().toISOString(),
            slug: data.slug
        };

        // Create the parameters array
        const sqlParams = [
            updateData.name,
            updateData.language,
            updateData.body,
            updateData.published,
            updateData.news_type,
            updateData.published_date,
            updateData.header_image,
            updateData.header_image,
            updateData.last_modified_by,
            updateData.last_modified_date,
            updateData.slug,
            parseInt(id)
        ];

        // Check for any undefined values
        const undefinedIndexes = sqlParams.map((param, index) => param === undefined ? index : -1).filter(index => index !== -1);
        if (undefinedIndexes.length > 0) {
            console.error('Undefined parameters at indexes:', undefinedIndexes);
            return NextResponse.json({
                status: false,
                message: "Өгөгдлийн алдаа: undefined утгууд байна"
            }, { status: 400 });
        }

        await db.raw(`
            UPDATE web_1212_content 
            SET name = ?,
                language = ?,
                body = ?,
                published = ?,
                news_type = ?,
                published_date = ?,
                header_image = ?,
                thumb_image = ?,
                last_modified_by = ?,
                last_modified_date = ?,
                slug = ?
            WHERE id = ? AND content_type = 'NEWS' AND news_type in('LATEST', 'FUTURE')
        `, sqlParams);

        return NextResponse.json({
            status: true,
            message: "Мэдээлэл амжилттай хадгалагдлаа"
        });

    } catch (error) {
        console.error('Error updating dissemination:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
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