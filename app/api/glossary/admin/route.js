import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

// Create new glossary entry
export async function POST(req) {
    try {
        const body = await req.json();
        
        // Get the max ID
        const [maxIdResult] = await db.raw(`
            SELECT MAX(id) as maxId 
            FROM [NSOweb].[dbo].[web_1212_glossary]
        `);
        
        const newId = (parseInt(maxIdResult[0]?.maxId) || 0) + 1;

        const query = `
            INSERT INTO [NSOweb].[dbo].[web_1212_glossary]
            (
                id, name, name_eng, sector_type, source, source_eng,
                info, info_eng, published, created_by, created_date,
                last_modified_by, last_modified_date
            )
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?, GETDATE())
        `;

        const params = [
            newId,
            body.name,
            body.name_eng,
            body.sector_type,
            body.source || '',
            body.source_eng || '',
            body.info,
            body.info_eng,
            body.published || 1,
            body.created_by,
            body.last_modified_by
        ];

        await db.raw(query, params);

        return NextResponse.json({
            status: true,
            data: { id: newId },
            message: "Амжилттай нэмэгдлээ"
        });

    } catch (error) {
        console.error('Error creating glossary entry:', error);
        return NextResponse.json({
            status: false,
            message: "Бичлэг нэмэх үед алдаа гарлаа"
        }, { status: 500 });
    }
}

// Update existing glossary entry
export async function PUT(req) {
    try {
        const body = await req.json();
        const {
            id,
            name,
            name_eng,
            sector_type,
            source,
            source_eng,
            info,
            info_eng,
            published,
            last_modified_by
        } = body;

        const query = `
            UPDATE [NSOweb].[dbo].[web_1212_glossary]
            SET
                name = ?,
                name_eng = ?,
                sector_type = ?,
                source = ?,
                source_eng = ?,
                info = ?,
                info_eng = ?,
                published = ?,
                last_modified_by = ?,
                last_modified_date = GETDATE()
            WHERE id = ?;
        `;

        const params = [
            name, name_eng, sector_type, source, source_eng,
            info, info_eng, published, last_modified_by, id
        ];

        await db.raw(query, params);

        return NextResponse.json({
            status: true,
            message: "Glossary entry updated successfully"
        });

    } catch (error) {
        console.error('Error updating glossary entry:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to update glossary entry"
        }, { status: 500 });
    }
}

// Delete glossary entry
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                status: false,
                message: "ID is required"
            }, { status: 400 });
        }

        const query = `
            DELETE FROM [NSOweb].[dbo].[web_1212_glossary]
            WHERE id = ?;
        `;

        await db.raw(query, [id]);

        return NextResponse.json({
            status: true,
            message: "Glossary entry deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting glossary entry:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to delete glossary entry"
        }, { status: 500 });
    }
}

// Get single glossary entry for editing
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                status: false,
                message: "ID is required"
            }, { status: 400 });
        }

        const query = `
            SELECT 
                wg.[id],
                wg.[name],
                wg.[sector_type],
                wg.[source],
                wg.[info],
                wg.[published],
                wg.[created_by],
                wg.[created_date],
                wg.[last_modified_by],
                wg.[last_modified_date],
                wg.[name_eng],
                wg.[source_eng],
                wg.[info_eng],
                scc.[namemn] as sector_name_mn,
                scc.[nameen] as sector_name_en
            FROM [NSOweb].[dbo].[web_1212_glossary] wg
            LEFT JOIN [NSOweb].[dbo].[sub_classification_code] scc 
                ON wg.[sector_type] = scc.[code]
            WHERE wg.id = ?
        `;

        const result = await db.raw(query, [id]);
        const data = result[0];

        if (!data) {
            return NextResponse.json({
                status: false,
                message: "Glossary entry not found"
            }, { status: 404 });
        }

        // Convert sector_type to string if it exists
        if (data.sector_type != null) {
            data.sector_type = data.sector_type.toString();
        }

        return NextResponse.json({
            status: true,
            data: data,
            message: ""
        });

    } catch (error) {
        console.error('Error fetching glossary entry:', error);
        return NextResponse.json({
            status: false,
            message: "Failed to fetch glossary entry"
        }, { status: 500 });
    }
} 