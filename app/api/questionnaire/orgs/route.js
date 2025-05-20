import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET() {
    try {
        const query = `
            SELECT a.[id], [name], [fullname], b.total
            FROM [NSOweb].[dbo].[organizations] as a
                left join (
                    SELECT organization_ids, count(1) as total
                    from [NSOweb].[dbo].[dynamic_object]
                    where active = 1 and is_secret = 0
                    group by organization_ids
                ) as b on a.id = b.organization_ids
			order by a.[fullname] asc
        `;
        
        const results = await db.raw(query);
        return NextResponse.json(Array.isArray(results) ? results : [results]);
    } catch (error) {
        console.error('Error fetching sectors:', error);
        return NextResponse.json({ error: 'Failed to fetch sectors' }, { status: 500 });
    }
} 