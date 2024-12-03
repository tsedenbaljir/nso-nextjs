import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    const results = await db.raw(`
      SELECT * FROM web_1212_transparency
      WHERE id = ?
    `, [id]);

    if (results && results[0]) {
      return NextResponse.json({ 
        status: true, 
        data: results[0], 
        message: "" 
      });
    } else {
      return NextResponse.json({ 
        status: false, 
        data: null, 
        message: "Item not found" 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching transparency item:', error);
    return NextResponse.json({ 
      status: false, 
      data: null, 
      message: "Internal server error" 
    }, { status: 500 });
  }
} 