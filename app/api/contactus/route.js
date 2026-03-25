import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

// GET - Fetch all contact-us entries with pagination
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 0;
        const pageSize = parseInt(searchParams.get('pageSize')) || 10;
        const offset = page * pageSize;

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM [NSOweb].[dbo].[contactus]`;
        const countResult = await db.raw(countQuery);
        const total = countResult[0]?.total || 0;

        // Get paginated data
        const query = `
            SELECT [id]
                ,[titleMn]
                ,[titleEn]
                ,[bodyMn]
                ,[bodyEn]
            FROM [NSOweb].[dbo].[contactus]
            ORDER BY [id] DESC
            OFFSET ${offset} ROWS
            FETCH NEXT ${pageSize} ROWS ONLY
        `;

        const results = await db.raw(query);
        const data = Array.isArray(results) ? results : [results];

        return NextResponse.json({
            data,
            pagination: {
                total,
                page: page + 1,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error('Error fetching contact-us:', error);
        return NextResponse.json({ error: 'Failed to fetch contact-us data' }, { status: 500 });
    }
}

// POST - Create new contact-us entry
export async function POST(request) {
    try {
        const body = await request.json();
        const { titleMn, titleEn, bodyMn, bodyEn } = body;

        if (!titleMn || !titleEn) {
            return NextResponse.json({ error: 'Title in both languages is required' }, { status: 400 });
        }

        const query = `
            INSERT INTO [NSOweb].[dbo].[contactus] ([titleMn], [titleEn], [bodyMn], [bodyEn])
            VALUES (?, ?, ?, ?)
        `;

        await db.raw(query, [titleMn, titleEn, bodyMn || null, bodyEn || null]);

        return NextResponse.json({ message: 'Contact-us entry created successfully' });
    } catch (error) {
        console.error('Error creating contact-us:', error);
        return NextResponse.json({ error: 'Failed to create contact-us entry' }, { status: 500 });
    }
}

// PUT - Update contact-us entry
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, titleMn, titleEn, bodyMn, bodyEn } = body;

        if (!id || !titleMn || !titleEn) {
            return NextResponse.json({ error: 'ID and title in both languages are required' }, { status: 400 });
        }

        const query = `
            UPDATE [NSOweb].[dbo].[contactus]
            SET [titleMn] = ?, [titleEn] = ?, [bodyMn] = ?, [bodyEn] = ?
            WHERE [id] = ?
        `;

        const result = await db.raw(query, [titleMn, titleEn, bodyMn || null, bodyEn || null, id]);

        if (result.rowsAffected === 0) {
            return NextResponse.json({ error: 'Contact-us entry not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Contact-us entry updated successfully' });
    } catch (error) {
        console.error('Error updating contact-us:', error);
        return NextResponse.json({ error: 'Failed to update contact-us entry' }, { status: 500 });
    }
}

// DELETE - Delete contact-us entry
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const query = `DELETE FROM [NSOweb].[dbo].[contactus] WHERE [id] = ?`;
        const result = await db.raw(query, [id]);

        if (result.rowsAffected === 0) {
            return NextResponse.json({ error: 'Contact-us entry not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Contact-us entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact-us:', error);
        return NextResponse.json({ error: 'Failed to delete contact-us entry' }, { status: 500 });
    }
}
