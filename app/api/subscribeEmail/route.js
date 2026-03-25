import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET() {
    try {
        const query = `
            SELECT [id]
                ,[email]
                ,[is_subscribe]
                ,[created_by]
                ,[created_date]
                ,[last_modified_by]
                ,[last_modified_date]
            FROM [NSOweb].[dbo].[web_1212_email_subscribe]
            ORDER BY [id]
        `;
        
        const results = await db.raw(query);
        return NextResponse.json(Array.isArray(results) ? results : [results]);
    } catch (error) {
        console.error('Error fetching sectors:', error);
        return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
    }
} 