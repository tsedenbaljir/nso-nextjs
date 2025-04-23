import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET() {
    try {
        const query = `
<<<<<<< HEAD
            SELECT [first_name]
=======
            SELECT [id]
                  ,[first_name]
>>>>>>> 348110fab2f04ac67f6dcc7a04f5199ac1a4dbf0
                  ,[last_name]
                  ,[phone_number]
                  ,[country]
                  ,[city]
                  ,[district]
                  ,[khoroo]
                  ,[letter]
                  ,[created_by]
                  ,[created_date]
            FROM [NSOweb].[dbo].[web_1212_contact_us]
            ORDER BY [created_date]
        `;
        
        const results = await db.raw(query);
        return NextResponse.json(Array.isArray(results) ? results : [results]);
    } catch (error) {
        console.error('Error fetching sectors:', error);
        return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
    }
} 