import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

// GET - Fetch single contact-us entry by ID
export async function GET(request, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const query = `
            SELECT [id]
                ,[titleMn]
                ,[titleEn]
                ,[bodyMn]
                ,[bodyEn]
            FROM [NSOweb].[dbo].[contactus]
            WHERE [id] = ?
        `;

        const results = await db.raw(query, [id]);
        const data = Array.isArray(results) ? results[0] : results;

        if (!data) {
            return NextResponse.json({ error: 'Contact-us entry not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching contact-us entry:', error);
        return NextResponse.json({ error: 'Failed to fetch contact-us entry' }, { status: 500 });
    }
}
