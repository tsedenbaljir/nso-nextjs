import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';
import { uploadFile } from '@/utils/fileUpload';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    const results = await db.raw(`
      SELECT [id], [name], [name_eng], [indicator_type], [catalogue_id], [indicator], [measure_type], [image], [info], [info_eng], [tableau], [tableau_eng], [updated_date], [published], [list_order], [created_by], [created_date], [last_modified_by], [last_modified_date], [indicator_perc]
      FROM [NSOweb].[dbo].[web_1212_main_indicator]
      WHERE id = ?
    `, [id]);

    return NextResponse.json({ 
      status: true, 
      data: results, 
      message: "" 
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      status: false, 
      data: null, 
      message: "Internal server error" 
    }, { status: 500 });
  }
}

