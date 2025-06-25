import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const lng = searchParams.get('lng') || 'MN';
  const type = searchParams.get('type') || 'LATEST';
  
  try {
    const response = await axios.get(`https://gateway.1212.mn/services/1212/api/public/contents`, {
      params: {
        size: 10,
        page: page - 1,
        sort: 'publishedDate,desc',
        total: 0,
        'language.equals': lng.toUpperCase(),
        'contentType.equals': 'NEWS',
        'newsType.equals': type.toUpperCase()
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });

    const totalCount = response.headers['x-total-count'];
    const results = response.data;
    
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

    nextResponse.headers.set('X-Total-Count', totalCount || '0');
    nextResponse.headers.set('X-Page', page.toString());
    nextResponse.headers.set('X-Page-Size', pageSize.toString());

    return nextResponse;

  } catch (error) {
    return NextResponse.json(
      { 
        status: false, 
        data: null,
        pagination: {
          page,
          pageSize,
          total: 0
        },
        message: "Failed to fetch articles" 
      }, 
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(req) {
  // Handle POST requests if needed
}