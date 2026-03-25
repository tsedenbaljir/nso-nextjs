import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const lng = searchParams.get('lng');
  const type = searchParams.get('type');
  const searchTerm = searchParams.get('searchTerm');
  const year = parseInt(searchParams.get('year'));
  const month = parseInt(searchParams.get('month'));
  const orderBy = searchParams.get('orderBy') || 'updated';

  const offset = (page - 1) * pageSize;

  let query = `
    SELECT * FROM web_1212_content
    WHERE content_type = 'NEWS'
      AND language = ?
      AND news_type = ?
      AND published = 1
  `;
  const queryParams = [lng, type];

  if (searchTerm && searchTerm !== "") {
    query += ` AND name LIKE ?`;
    queryParams.push(`%${searchTerm}%`);
  }

  if (year) {
    query += ` AND YEAR(published_date) = ?`;
    queryParams.push(year);
  }

  if (month) {
    query += ` AND MONTH(published_date) = ?`;
    queryParams.push(month);
  }

  // ✅ Эрэмбэлэх нөхцөл
  let orderClause = '';
  switch (orderBy) {
    case 'updated':
      orderClause = `ORDER BY published_date ${type === 'future' ? 'ASC' : 'DESC'}`;
      break;
    case 'alphabet':
      orderClause = 'ORDER BY name ASC';
      break;
    case 'views':
      orderClause = 'ORDER BY view_count DESC'; // Хандалтын тоо хадгалах багана байгаа гэж үзэв
      break;
    default:
      orderClause = 'ORDER BY published_date DESC';
      break;
  }

  query += `
    ${orderClause}
    OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
  `;
  queryParams.push(offset, pageSize);

  try {
    const results = await db.raw(query, queryParams);

    // ✅ Нийт хуудасны тоо
    const [totalPage] = await db.raw(`
      SELECT COUNT(1) AS totalPage FROM web_1212_content 
      WHERE content_type = 'NEWS'
        AND language = ?
        AND news_type = ?
        AND published = 1
        ${searchTerm && searchTerm !== "" ? ` AND name LIKE '%${searchTerm}%'` : ''}
        ${year ? ` AND YEAR(published_date) = ${year}` : ''}
        ${month ? ` AND MONTH(published_date) = ${month}` : ''}
    `, [lng, type]);

    // ✅ Он, сар авах
    let yearsMonthsQuery = `
      SELECT YEAR(published_date) AS Year, MONTH(published_date) AS Month
      FROM web_1212_content
      WHERE content_type = 'NEWS'
        AND language = ?
        AND news_type = ?
        AND published = 1
    `;
    const yearsMonthsParams = [lng, type];

    if (searchTerm && searchTerm !== "") {
      yearsMonthsQuery += ` AND name LIKE ?`;
      yearsMonthsParams.push(`%${searchTerm}%`);
    }

    yearsMonthsQuery += `
      GROUP BY YEAR(published_date), MONTH(published_date)
      ORDER BY YEAR(published_date) DESC, MONTH(published_date) DESC
    `;

    const yearsMonths = await db.raw(yearsMonthsQuery, yearsMonthsParams);

    return NextResponse.json({
      status: true,
      data: results,
      totalPage: totalPage.totalPage,
      yearsMonths: yearsMonths
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
