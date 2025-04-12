import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';
import { uploadFile } from '@/utils/fileUpload';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  try {
    const results = await db.raw(`
      SELECT * FROM web_1212_main_indicator
      WHERE indicator_type = ?
      ORDER BY created_date DESC
    `, [type]);

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

export async function PUT(req) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      name_eng,
      indicator_type,
      catalogue_id,
      indicator,
      measure_type,
      image,
      info,
      info_eng,
      tableau,
      tableau_eng,
      published,
      list_order,
      indicator_perc,
      last_modified_by,
      last_modified_date
    } = body;

    await db.raw(`
      UPDATE web_1212_main_indicator 
      SET name = ?,
          name_eng = ?,
          indicator_type = ?,
          catalogue_id = ?,
          indicator = ?,
          measure_type = ?,
          image = ?,
          info = ?,
          info_eng = ?,
          tableau = ?,
          tableau_eng = ?,
          published = ?,
          list_order = ?,
          indicator_perc = ?,
          last_modified_by = ?,
          last_modified_date = ?,
          updated_date = GETDATE()
      WHERE id = ?
    `, [
      name,
      name_eng,
      indicator_type,
      catalogue_id,
      indicator,
      measure_type,
      image,
      info,
      info_eng,
      tableau,
      tableau_eng,
      published,
      list_order,
      indicator_perc,
      last_modified_by,
      last_modified_date,
      id
    ]);

    return NextResponse.json({ 
      status: true, 
      message: "Indicator updated successfully" 
    });
  } catch (error) {
    console.error('Error updating indicator:', error);
    return NextResponse.json({ 
      status: false, 
      message: "Failed to update indicator" 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    const file = formData.get('file');
    const name = formData.get('name');
    const name_eng = formData.get('name_eng');
    const indicator_type = formData.get('indicator_type');
    const catalogue_id = formData.get('catalogue_id');
    const indicator = formData.get('indicator');
    const measure_type = formData.get('measure_type');
    const image = formData.get('image');
    const info = formData.get('info');
    const info_eng = formData.get('info_eng');
    const tableau = formData.get('tableau');
    const tableau_eng = formData.get('tableau_eng');
    const published = formData.get('published') === 'true';
    const list_order = parseInt(formData.get('list_order'));
    const indicator_perc = parseFloat(formData.get('indicator_perc'));
    const created_by = formData.get('created_by');
    const created_date = formData.get('created_date');
    const last_modified_by = formData.get('last_modified_by');
    const last_modified_date = formData.get('last_modified_date');

    // Upload file and get the file path if file exists
    let file_path = null;
    if (file) {
      file_path = await uploadFile(file);
    }

    // Insert into database using MSSQL syntax
    await db.raw(`
      INSERT INTO web_1212_main_indicator (
        name,
        name_eng,
        indicator_type,
        catalogue_id,
        indicator,
        measure_type,
        image,
        info,
        info_eng,
        tableau,
        tableau_eng,
        published,
        list_order,
        indicator_perc,
        created_by,
        created_date,
        last_modified_by,
        last_modified_date,
        file_path,
        updated_date,
        insert_user,
        edit_user
      ) 
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?, ?
      )
    `, [
      name,
      name_eng,
      indicator_type,
      catalogue_id,
      indicator,
      measure_type,
      image,
      info,
      info_eng,
      tableau,
      tableau_eng,
      published,
      list_order,
      indicator_perc,
      created_by,
      created_date,
      last_modified_by,
      last_modified_date,
      file_path,
      'admin',
      'admin'
    ]);

    return NextResponse.json({ 
      status: true, 
      message: "Indicator added successfully"
    });
  } catch (error) {
    console.error('Error adding indicator:', error);
    return NextResponse.json({ 
      status: false, 
      message: error.message || "Failed to add indicator" 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ 
        status: false, 
        message: "ID is required" 
      }, { status: 400 });
    }

    await db.raw(`
      DELETE FROM web_1212_main_indicator 
      WHERE id = ?
    `, [id]);

    return NextResponse.json({ 
      status: true, 
      message: "Indicator deleted successfully" 
    });
  } catch (error) {
    console.error('Error deleting indicator:', error);
    return NextResponse.json({ 
      status: false, 
      message: "Failed to delete indicator" 
    }, { status: 500 });
  }
}
