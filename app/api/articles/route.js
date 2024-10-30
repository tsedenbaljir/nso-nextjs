import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req, { params }) {
  const { hhid } = params;

  try {
    const [results] = await db.raw(`
      SELECT * FROM vw_mobilehses WHERE hhid = ${hhid} ORDER BY Name ASC
    `, []);

    return NextResponse.json({ status: true, data: results, message: "" });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ status: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}