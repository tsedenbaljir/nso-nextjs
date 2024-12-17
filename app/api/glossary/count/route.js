import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET() {
    try {
        const result = await db.raw(`
            SELECT COUNT(*) as count 
            FROM web_1212_glossary 
        `);
        return NextResponse.json(result[0].count);
    } catch (error) {
        console.error('Error in glossary count:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 