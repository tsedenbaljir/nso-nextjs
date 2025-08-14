import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const results = await db.raw(`
            SELECT * FROM web_1212_content 
            WHERE content_type = 'NEWS' 
            AND news_type in('LATEST', 'FUTURE') 
            ORDER BY published_date DESC
        `);

        return NextResponse.json({
            status: true,
            data: results,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching dissemination:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();
        const currentDate = new Date().toISOString();

        // First, get the maximum ID from the table
        const [maxIdResult] = await db('web_1212_content')
            .max('id as maxId');

        const newId = (parseInt(maxIdResult.maxId) || 0) + 1;

        // Handle published_date properly
        let publishedDate = currentDate;
        if (data.published_date) {
            try {
                publishedDate = new Date(data.published_date).toISOString();
            } catch (error) {
                console.warn('Invalid published_date format, using current date:', data.published_date);
                publishedDate = currentDate;
            }
        }

        const [result] = await db.raw(`
            INSERT INTO web_1212_content (
                id, name, language, body, published, list_order,
                created_by, created_date, last_modified_date,
                content_type, news_type, published_date, header_image, views,
                slug, thumb_image
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                'NEWS', ?, ?, ?, 0,
                ?, ?
            )
        `, [
            newId,
            data.name,
            data.language,
            data.body,
            data.published,
            data.list_order || 0,
            data.created_by,
            currentDate,
            currentDate,
            data.news_type,
            publishedDate,
            data.header_image,
            data.slug,
            data.header_image
        ]);

        return NextResponse.json({
            status: true,
            message: "Dissemination created successfully"
        });

    } catch (error) {
        console.error('Error creating dissemination:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to create dissemination"
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const data = await req.json();
        const currentDate = new Date().toISOString();

        // Handle published_date properly
        let publishedDate = currentDate;
        if (data.published_date) {
            try {
                publishedDate = new Date(data.published_date).toISOString();
            } catch (error) {
                console.warn('Invalid published_date format, using current date:', data.published_date);
                publishedDate = currentDate;
            }
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
                last_modified_date = ?
            WHERE id = ?
        `, [
            data.name,
            data.language,
            data.body,
            data.published,
            data.news_type,
            publishedDate,
            data.header_image,
            data.header_image,
            data.last_modified_by,
            currentDate,
            data.id
        ]);

        return NextResponse.json({
            status: true,
            message: "Dissemination updated successfully"
        });

    } catch (error) {
        console.error('Error updating dissemination:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to update dissemination"
        }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const id = params.id;

        await db.raw(`
            DELETE FROM web_1212_content 
            WHERE id = ? AND content_type = 'NEWS'
        `, [id]);

        return NextResponse.json({
            status: true,
            message: "Dissemination deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting dissemination:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to delete dissemination"
        }, { status: 500 });
    }
} 