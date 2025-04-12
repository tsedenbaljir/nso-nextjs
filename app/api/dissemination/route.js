import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const lng = searchParams.get('lng');
  const type = searchParams.get('type');
  const searchTerm = searchParams.get('searchTerm');

  const offset = (page - 1) * pageSize;

  let query = `
    SELECT * FROM web_1212_content
    WHERE content_type = 'NEWS'
      AND language = ?
      AND news_type = ?
      AND published = 1
  `;
  try {
    // Get paginated results
    const queryParams = [lng, type];
    
    // Add search filter if applicable
    if (searchTerm && searchTerm !== "") {
      query += ` AND name LIKE ?`;
      queryParams.push(`%${searchTerm}%`);
    }

    // Append ORDER BY and pagination at the end
    query += `
      ORDER BY published_date ${type === "latest" ? 'DESC' : 'ASC'}
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;

    queryParams.push(offset, pageSize);

    // Run the query
    const results = await db.raw(query, queryParams);
    // Get total count
    const [totalPage] = await db.raw(`
      SELECT count(1) as totalPage FROM web_1212_content 
      where language = ? and content_type = 'NEWS' and news_type = ? and published = 1
    `, [lng, type]);

    return NextResponse.json({
      status: true,
      data: results,
      totalPage: totalPage.totalPage,
      message: ""
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({
      status: false,
      data: null,
      message: "Internal server error"
    }, {
      status: 500
    });
  }
}

export async function POST(req) {
  // Handle POST requests if needed
}