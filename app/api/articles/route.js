import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
  const lng = searchParams.get('lng') || 'MN';
  const type = searchParams.get('type') || 'LATEST';

  try {
    // Get total count
    const [countResult] = await db('web_1212_content')
      .count('* as total')
      .where({
        language: lng.toUpperCase(),
        content_type: 'NSONEWS',
        published: true,
        news_type: type.toUpperCase()
      });

    // Get paginated results
    const results = await db('web_1212_content')
      .select('*')
      .where({
        language: lng.toUpperCase(),
        content_type: 'NSONEWS',
        published: true,
        news_type: type.toUpperCase()
      })
      .orderBy('created_date', 'desc')
      .offset((page - 1) * pageSize)
      .limit(pageSize);

    const totalCount = countResult.total;

    const nextResponse = NextResponse.json({
      status: true,
      data: results,
      pagination: {
        page,
        pageSize,
        total: parseInt(totalCount || '0', 10)
      },
      message: ""
    });

    nextResponse.headers.set('X-Total-Count', totalCount.toString());
    nextResponse.headers.set('X-Page', page.toString());
    nextResponse.headers.set('X-Page-Size', pageSize.toString());

    return nextResponse;

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      {
        status: false,
        data: null,
        pagination: {
          page,
          pageSize,
          total: 0
        },
        message: "Failed to fetch articles: " + error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // First, get the maximum ID from the table
    const [maxIdResult] = await db('web_1212_content')
      .max('id as maxId');
    
    const newId = (parseInt(maxIdResult.maxId) || 0) + 1;

    // Transform the data to match your database structure
    const articleData = {
      id: newId, // Add the new ID
      name: body.name,
      language: body.language.toUpperCase(),
      body: body.body,
      published: body.published,
      created_by: body.created_by,
      created_date: body.created_date,
      last_modified_by: body.created_by,
      last_modified_date: body.last_modified_date,
      content_type: 'NSONEWS',
      news_type: body.news_type === 1 ? 'LATEST' : body.news_type === 2 ? 'MEDIA' : 'TENDER',
      published_date: body.published_date,
      header_image: body.header_image,
      views: 0
    };

    // Insert with the new ID
    const response = await db('web_1212_content').insert(articleData);

    return NextResponse.json({
      status: true,
      data: response,
      message: "Article created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating article:', error);

    return NextResponse.json({
      status: false,
      data: null,
      message: error.message || 'Failed to create article'
    }, {
      status: 500
    });
  }
}