import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET() {
    try {
        const query = `
            SELECT * FROM web_1212_content 
            WHERE content_type = 'WEBPAGE'
            ORDER BY id DESC
        `;
        
        const result = await db.raw(query);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching webpages:', error);
        return NextResponse.error(new Error('Failed to fetch webpages'));
    }
} 