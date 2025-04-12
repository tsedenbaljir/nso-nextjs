import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function POST(req) {
  const body = await req.json();

  try {
    await db('web_1212_contact_us').insert({
      first_name: body.firstName,
      last_name: body.lastName,
      phone_number: body.phoneNumber,
      country: body.country,
      city: body.city,
      district: body.district,
      khoroo: body.khoroo,
      apartment_number: body.apartment,
      letter: body.letter,
      created_by: 'web_user',
      created_date: new Date()
    });

    return NextResponse.json({ message: 'Таны хүсэлтийг хүлээн авлаа.' }, { status: 200 });
  } catch (error) {
    console.error('DB алдаа:', error);
    return NextResponse.json({ error: 'Хүсэлт илгээхэд асуудал гарлаа. Та дахин оролдоно уу.' }, { status: 500 });
  }
}
