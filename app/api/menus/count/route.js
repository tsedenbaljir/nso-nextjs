import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET() {
    try {
        const result = await db('web_menus')
            .count('id as count')
            .where('is_active', '1')
            // .where('parent_id', null)
            .first();

        return NextResponse.json(result.count);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 