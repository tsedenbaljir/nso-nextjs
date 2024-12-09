import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

// Update webpage
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { slug, language, body: content } = body;

        const query = `
            UPDATE web_1212_content 
            SET slug = ?, language = ?, body = ?
            WHERE id = ? AND content_type = 'WEBPAGE'
        `;
        
        await db.raw(query, [slug, language, content, id]);
        return NextResponse.json({ message: 'Webpage updated successfully' });
    } catch (error) {
        console.error('Error updating webpage:', error);
        return NextResponse.error(new Error('Failed to update webpage'));
    }
}

// Delete webpage
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        const query = `
            DELETE FROM web_1212_content 
            WHERE id = ? AND content_type = 'WEBPAGE'
        `;
        
        await db.raw(query, [id]);
        return NextResponse.json({ message: 'Webpage deleted successfully' });
    } catch (error) {
        console.error('Error deleting webpage:', error);
        return NextResponse.error(new Error('Failed to delete webpage'));
    }
} 