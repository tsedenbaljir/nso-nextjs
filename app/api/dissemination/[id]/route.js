import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req, { params }) {
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const lng = searchParams.get('lng') || 'MN';

  try {
    const response = await axios.get(`http://10.0.10.211/services/1212/api/public/content/${id}`, {
      params: {
        'language.equals': lng.toUpperCase(),
      },
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });

    const article = {
      ...response.data,
      publishedDate: response.data.publishedDate || response.data.createdDate,
      headerImage: response.data.headerImage || null,
      thumbImage: response.data.thumbImage || null,
      body: response.data.body?.replace(/\\n/g, '\n') || '',
    };

    return NextResponse.json({ 
      status: true, 
      data: article, 
      message: "" 
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { 
        status: false, 
        data: null, 
        message: "Failed to fetch article" 
      }, 
      { status: error.response?.status || 500 }
    );
  }
}