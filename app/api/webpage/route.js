import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const slug = searchParams.get('slug');
        const language = searchParams.get('language');

        const query = `
            SELECT * FROM web_1212_content 
            WHERE content_type = 'WEBPAGE' 
            AND slug = ?
            AND language = ?
        `;

        const result = await db.raw(query, [slug, language]);
        
        if (result[0].length === 0) {
            return NextResponse.json(null);
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error fetching webpage content:', error);
        return NextResponse.error(new Error('Failed to fetch webpage content'));
    }
}

// Create new webpage
export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            name, 
            slug, 
            language, 
            body: content, 
            created_by = 'anonymousUser',
            created_date,
            last_modified_date
        } = body;

        const [maxIdResult] = await db('web_1212_content')
            .max('id as maxId');

        const newId = (parseInt(maxIdResult.maxId) || 0) + 1;
        const currentDate = created_date || new Date().toISOString();

        const query = `
            INSERT INTO web_1212_content (
                id, slug, name, language, body, content_type, published,
                created_by, created_date, last_modified_by, last_modified_date
            )
            VALUES (?, ?, ?, ?, ?, 'WEBPAGE', 1, ?, ?, ?, ?)
        `;
        
        const params = [
            newId,
            slug,
            name,
            language,
            content,
            created_by,
            currentDate,
            created_by,
            last_modified_date || currentDate
        ];

        await db.raw(query, params);
        
        return NextResponse.json({ message: 'Webpage created successfully' });
    } catch (error) {
        console.error('Error creating webpage:', error);
        return NextResponse.error(new Error('Failed to create webpage'));
    }
} 