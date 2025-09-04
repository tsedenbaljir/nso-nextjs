import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req, { params }) {
    const { id } = params;
    try {
        const query = `
SELECT a.[id], a.[labelmn], a.[labelen], a.[last_modified_date], a.[descriptionen], a.[descriptionmn], a.[is_secure], a.[active]
FROM (
    SELECT [id], [namemn] AS [labelmn], [nameen] AS [labelen], [last_modified_date], [descriptionen], [descriptionmn], [is_secure], [active]
    FROM [NSOweb].[dbo].[question_pool]
    WHERE [id] = ?
) AS a`;
        const rows = await db.raw(query, [id]);

        const metaValues = await db('meta_data_value')
            .select('*')
            .where({ questionpool_id: id, active: 1 });

        if (!rows || rows.length === 0) {
            return NextResponse.json({ status: false, data: null, message: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ status: true, data: { ...rows[0], metaValues }, message: '' });
    } catch (error) {
        console.error('Metadata GET by id error:', error);
        return NextResponse.json({ status: false, data: null, message: 'Failed to fetch' }, { status: 500 });
    }
}


