import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function POST(req) {
  const body = await req.json();

  try {
    const query = `
      INSERT INTO [NSOweb].[dbo].[web_1212_contact_us] 
      ( [first_name], [last_name], [phone_number], [country], [city], [district], [khoroo], [apartment_number], [letter], [created_by], [created_date])
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())
    `;

    await db.raw(query, [
      body.firstName,
      body.lastName,
      body.phoneNumber,
      body.country,
      body.city,
      body.district,
      body.khoroo,
      body.apartment,
      body.letter,
      'web_user'
    ]);

    return NextResponse.json({ message: 'Таны хүсэлтийг хүлээн авлаа.' }, { status: 200 });
  } catch (error) {
    console.error('DB алдаа:', error);
    return NextResponse.json({ error: 'Хүсэлт илгээхэд асуудал гарлаа. Та дахин оролдоно уу.' }, { status: 500 });
  }
}
