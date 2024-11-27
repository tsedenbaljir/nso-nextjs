import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const [results] = await db.raw(`
      SELECT * FROM web_1212_content WHERE id = ${id}
    `, []);

    return NextResponse.json({ status: true, data: results, message: "" });
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