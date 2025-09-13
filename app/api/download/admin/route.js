import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const info = searchParams.get('info');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page')) || 0;
    const pageSize = parseInt(searchParams.get('pageSize')) || 20;
    const fetchAll = searchParams.get('fetchAll') === 'true' || pageSize > 100000;
    const offset = page * pageSize;

    try {
        let query = `
            SELECT *
            FROM [NSOweb].[dbo].[web_1212_download]
            WHERE file_type in('report','reportSector') and 1=1
        `;
        let params = [];

        if (lng) {
            query += ` AND language = ?`;
            params.push(lng);
        }
        if (info && info !== 'all') {
            query += ` AND info LIKE ?`;
            params.push(`%${info}%`);
        }
        if (type) {
            query += ` AND file_type = ?`;
            params.push(type);
        }

        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [totalResult] = await db.raw(countQuery, params);
        const total = totalResult.total || 0;

        // Add ordering and pagination (or fetch all)
        query += ` ORDER BY published_date DESC`;
        
        if (!fetchAll) {
            query += ` OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`;
            params.push(offset, pageSize);
        }

        const results = await db.raw(query, params);
            
        return NextResponse.json({
            status: true,
            data: results,
            pagination: {
                total: total,
                page: page + 1,
                pageSize: pageSize,
                totalPages: Math.ceil(total / pageSize)
            },
            message: ""
        });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: "Internal server error"
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const data = await req.json();

        // Validate required fields
        if (!data.name || !data.language || !data.file_type) {
            return NextResponse.json({
                status: false,
                message: "Шаардлагатай талбаруудыг бөглөнө үү"
            }, { status: 400 });
        }

        // Get the maximum ID from the table
        const [maxIdResult] = await db.raw(`
            SELECT MAX(id) as maxId FROM [NSOweb].[dbo].[web_1212_download]
        `);
        const newId = (parseInt(maxIdResult.maxId) || 0) + 1;

        // Format dates
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const publishedDate = data.published_date ? 
            new Date(data.published_date).toISOString().slice(0, 19).replace('T', ' ') : 
            currentDate;

        // Parse file_info JSON if provided
        let fileInfo = null;
        if (data.file_url) {
            fileInfo = JSON.stringify({
                originalName: data.file_url.split('/').pop() || data.file_url,
                pathName: data.file_url,
                fileSize: data.file_size || 0,
                extension: data.file_url.split('.').pop() || 'pdf',
                mediaType: 'application/pdf',
                pages: 1,
                downloads: 0,
                isPublic: true,
                createdDate: currentDate
            });
        }

        const insertData = {
            id: newId,
            name: data.name,
            language: data.language,
            file_type: data.file_type,
            file_info: fileInfo,
            file_size: data.file_size || 0,
            views: data.views || 0,
            published: data.published !== undefined ? data.published : 1,
            published_date: publishedDate,
            list_order: data.list_order || null,
            created_by: data.created_by || 'admin',
            created_date: currentDate,
            last_modified_by: data.last_modified_by || 'admin',
            last_modified_date: currentDate,
            info: data.info || data.name,
            data_viz_id: data.data_viz_id || null
        };

        // Insert the new download item
        await db.raw(`
            INSERT INTO [NSOweb].[dbo].[web_1212_download] 
            (id, name, language, file_type, file_info, file_size, views, published, published_date, list_order, created_by, created_date, last_modified_by, last_modified_date, info, data_viz_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            insertData.id,
            insertData.name,
            insertData.language,
            insertData.file_type,
            insertData.file_info,
            insertData.file_size,
            insertData.views,
            insertData.published,
            insertData.published_date,
            insertData.list_order,
            insertData.created_by,
            insertData.created_date,
            insertData.last_modified_by,
            insertData.last_modified_date,
            insertData.info,
            insertData.data_viz_id
        ]);

        return NextResponse.json({
            status: true,
            data: insertData,
            message: "Татаж авах файл амжилттай нэмэгдлээ"
        });

    } catch (error) {
        console.error('Error creating download item:', error);
        return NextResponse.json({
            status: false,
            message: "Файл нэмэхэд алдаа гарлаа: " + error.message
        }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const data = await req.json();

        // Validate required fields
        if (!data.id || !data.name || !data.language || !data.file_type) {
            return NextResponse.json({
                status: false,
                message: "Шаардлагатай талбаруудыг бөглөнө үү"
            }, { status: 400 });
        }

        // Format dates
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const publishedDate = data.published_date ? 
            new Date(data.published_date).toISOString().slice(0, 19).replace('T', ' ') : 
            currentDate;

        // If a new file is provided, construct file_info. Otherwise we will not touch file_info/file_size.
        let shouldUpdateFileFields = false;
        let fileInfo = null;
        if (data.file_url) {
            shouldUpdateFileFields = true;
            fileInfo = JSON.stringify({
                originalName: data.file_url.split('/').pop() || data.file_url,
                pathName: data.file_url,
                fileSize: data.file_size || 0,
                extension: data.file_url.split('.').pop() || 'pdf',
                mediaType: 'application/pdf',
                pages: 1,
                downloads: 0,
                isPublic: true,
                createdDate: currentDate
            });
        }

        // Build dynamic update to preserve file_info/file_size when no new file uploaded
        const setClauses = [
            'name = ?',
            'language = ?',
            'file_type = ?',
            'views = ?',
            'published = ?',
            'published_date = ?',
            'list_order = ?',
            'last_modified_by = ?',
            'last_modified_date = ?',
            'info = ?',
            'data_viz_id = ?'
        ];
        const params = [
            data.name,
            data.language,
            data.file_type,
            data.views || 0,
            data.published !== undefined ? data.published : 1,
            publishedDate,
            data.list_order || null,
            data.last_modified_by || 'admin',
            currentDate,
            data.info || data.name,
            data.data_viz_id || null
        ];

        if (shouldUpdateFileFields) {
            setClauses.splice(3, 0, 'file_info = ?', 'file_size = ?');
            params.splice(3, 0, fileInfo, data.file_size || 0);
        }

        const updateSql = `
            UPDATE [NSOweb].[dbo].[web_1212_download]
            SET ${setClauses.join(', ')}
            WHERE id = ?
        `;
        params.push(data.id);

        const result = await db.raw(updateSql, params);

        if (result.affectedRows === 0) {
            return NextResponse.json({
                status: false,
                message: "Файл олдсонгүй"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            message: "Татаж авах файл амжилттай шинэчлэгдлээ"
        });

    } catch (error) {
        console.error('Error updating download item:', error);
        return NextResponse.json({
            status: false,
            message: "Файл засварлахад алдаа гарлаа: " + error.message
        }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                status: false,
                message: "ID шаардлагатай"
            }, { status: 400 });
        }

        // Delete the download item
        const result = await db.raw(`
            DELETE FROM [NSOweb].[dbo].[web_1212_download] 
            WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({
                status: false,
                message: "Файл олдсонгүй"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            message: "Татаж авах файл амжилттай устгагдлаа"
        });

    } catch (error) {
        console.error('Error deleting download item:', error);
        return NextResponse.json({
            status: false,
            message: "Файл устгахад алдаа гарлаа: " + error.message
        }, { status: 500 });
    }
}
