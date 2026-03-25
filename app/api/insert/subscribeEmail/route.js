import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function POST(req) {
  const body = await req.json();

  try {
    await db('web_1212_email_subscribe').insert({
      email: body.email,
      is_subscribe: null,
      created_by: 'web_user',
      created_date: new Date(),
      last_modified_by: null, 
      last_modified_date: null, 
    });
    return NextResponse.json({
      success: true,
      message: 'Таны хүсэлтийг хүлээн авлаа.'
    }, { status: 200 });
  } catch (error) {
    console.error('DB алдаа:', error);
    return NextResponse.json({ error: 'Хүсэлт илгээхэд асуудал гарлаа. Та дахин оролдоно уу.' }, { status: 500 });
  }
}
