import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';
import { checkAdminAuth } from '@/app/api/auth/adminAuth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const q = decodeURIComponent(searchParams.get('q') || '').trim();

    const offset = page * pageSize;

    let poolFilter = `WHERE [active] = 1`;
    if (q) {
      poolFilter += ` AND (
        [label] LIKE N'%${q}%' OR
        [label_en] LIKE N'%${q}%' OR
        [descriptionmn] LIKE N'%${q}%' OR
        [descriptionen] LIKE N'%${q}%'
      )`;
    }

    const query = `
      SELECT [id]
          ,[common_code_id]
          ,[code]
          ,[before_version]
          ,[version]
          ,[label_en] as name_eng
          ,[label] as name
          ,[description]
          ,[start_date]
          ,[end_date]
          ,[published]
          ,[active]
          ,[last_version]
          ,[is_secret]
          ,[created_by]
          ,[created_date]
          ,[last_modified_by]
          ,[last_modified_date]
          ,[form_status]
          ,[observe_interval]
          ,[descriptionen]
          ,[descriptionmn]
          ,[organization_ids]
          ,[approved_date]
          ,[views]
      FROM [NSOweb].[dbo].[dynamic_object]
      ${poolFilter}
      ORDER BY [id] ASC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;

    const results = await db.raw(query, [offset, pageSize]);

    const countQuery = `SELECT COUNT(*) as total FROM [NSOweb].[dbo].[dynamic_object] ${poolFilter}`;
    const countRows = await db.raw(countQuery);
    const total = Array.isArray(countRows)
      ? (countRows[0]?.total ?? 0)
      : (countRows?.total ?? 0);

    return NextResponse.json({
      status: true,
      data: results,
      pagination: { page, pageSize, total },
      message: ''
    });
  } catch (error) {
    console.error('Metadata GET error:', error);
    return NextResponse.json(
      { status: false, data: null, message: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}



