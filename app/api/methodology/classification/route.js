import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const offset = page * pageSize;

  try {
    // Total count
    const [{ count }] = await db('classification_code')
      .where({
        is_current: 1,
        is_secure: 0,
        active: 1,
        deleted: null
      })
      .count('id as count');

    // Data with pagination
    const data = await db('classification_code')
      .where({
        is_current: 1,
        is_secure: 0,
        active: 1,
        deleted: null
      })
      .orderBy('id')
      .offset(offset)
      .limit(pageSize);

    return NextResponse.json({
      status: true,
      data,
      pagination: {
        page,
        pageSize,
        total: parseInt(count, 10) || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching methodology:', error);
    return NextResponse.json({
      status: false,
      data: null,
      pagination: {
        page,
        pageSize,
        total: 0
      },
      message: "Failed to fetch methodology"
    }, { status: 500 });
  }
}
