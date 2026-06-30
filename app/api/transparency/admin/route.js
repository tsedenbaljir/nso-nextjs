import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

import { requireAdminApi } from '@/app/api/auth/adminAuth';
export const dynamic = "force-dynamic";
export async function GET(req) {
    const denied = await requireAdminApi(req);
    if (denied) return denied;

    try {
        const results = await db.raw('SELECT * FROM web_1212_transparency ORDER BY created_date DESC',[]);

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