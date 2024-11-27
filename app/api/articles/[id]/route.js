import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req, { params }) {
  try {
    const article = await db('web_1212_content')
      .where('id', params.id)
      .first();

    return NextResponse.json({
      status: true,
      data: article,
      message: ""
    });
  } catch (error) {
    return NextResponse.json({
      status: false,
      data: null,
      message: "Failed to fetch article: " + error.message
    }, { status: 500 });
  }
}
