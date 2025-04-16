import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const lng = searchParams.get('lng');
    const catalogue_id = searchParams.get('catalogue_id');
    try {
        const results = await db.raw(`
            SELECT * FROM web_1212_methodology
            WHERE catalogue_id = ? and language = ? and published = 1
            order by approved_date desc
        `, [catalogue_id, lng]);
            
        return NextResponse.json({
            status: true,
            data: results,
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
        const { id } = await req.json();
        
        if (!id) {
            return NextResponse.json({
                status: false,
                message: "Missing required parameters (id, lng)"
            }, { status: 400 });
        }

        const results = await db.raw(`
            SELECT * FROM web_1212_methodology
            WHERE id = ? AND published = 1
        `, [id]);

        if (!results || results.length === 0) {
            return NextResponse.json({
                status: false,
                message: "Methodology not found",
                data: null
            }, { status: 404 });
        }

        return NextResponse.json({
            status: true,
            data: results[0], // ✅ Return only one item
            message: "Methodology retrieved successfully"
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
