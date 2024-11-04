import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const lng = searchParams.get('lng');
  const type = searchParams.get('type');
  
  const offset = (page - 1) * pageSize;

  try {
    const results = await db.raw(`
      SELECT * FROM web_1212_content
      where content_type = 'NEWS' and language = ? and news_type = ?
      ORDER BY published_date DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `, [lng, type, offset, pageSize]);

    const [totalPage] = await db.raw(`
      SELECT count(1) as totalPage FROM web_1212_content 
      where language = ? and content_type = 'NEWS' and news_type = ?
    `, [lng, type]);

    return NextResponse.json({ status: true, data: [results, totalPage], message: "" });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ status: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
