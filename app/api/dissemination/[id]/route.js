import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const [result] = await db.raw(`
      SELECT * FROM web_1212_content 
      WHERE id = ?
    `, [id]);

    if (!result || result.length === 0) {
      return NextResponse.json({ 
        status: false, 
        data: null, 
        message: "Article not found" 
      }, {
        status: 404 
      });
    }
    
    const article = {
      ...result,
      publishedDate: result.published_date || result.created_date,
      headerImage: result.header_image || null,
      thumbImage: result.thumb_image || null,
      body: result.body,
    };

    return NextResponse.json({
      status: true, 
      data: article, 
      message: "" 
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ 
      status: false, 
      data: null, 
      message: "Internal server error" 
    }, { 
      status: 500 
    });
  }
}