import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';
import { uploadFile } from '@/utils/fileUpload';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  try {
    const results = await db.raw(`
      SELECT * FROM web_1212_downloadnew
      WHERE file_type = ?
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
    const { id, name, description, file_type } = body;

    await db.raw(`
      UPDATE web_1212_downloadnew 
      SET name = ?, 
          file_description = ?, 
          file_type = ?,
          updated_date = GETDATE()
      WHERE id = ?
    `, [name, description, file_type, id]);

    return NextResponse.json({ 
      status: true, 
      message: "Law updated successfully" 
    });
  } catch (error) {
    console.error('Error updating law:', error);
    return NextResponse.json({ 
      status: false, 
      message: "Failed to update law" 
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    const file_type = formData.get('file_type');
    const description = formData.get('description');

    if (!file) {
      return NextResponse.json({ 
        status: false, 
        message: "File is required" 
      }, { status: 400 });
    }

    // Upload file and get the file path
    const file_path = await uploadFile(file);

    // Insert into database using MSSQL syntax
    await db.raw(`
      INSERT INTO web_1212_downloadnew (
        name, 
        file_type, 
        file_description, 
        file_path,
        created_date,
        updated_date,
        insert_user,
        edit_user
      ) 
      VALUES (
        ?, 
        ?, 
        ?, 
        ?,
        GETDATE(),
        GETDATE(),
        ?,
        ?
      )
    `, [name, file_type, description, file_path, 'admin', 'admin']);

    return NextResponse.json({ 
      status: true, 
      message: "Law added successfully"
    });
  } catch (error) {
    console.error('Error adding law:', error);
    return NextResponse.json({ 
      status: false, 
      message: error.message || "Failed to add law" 
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
      DELETE FROM web_1212_downloadnew 
      WHERE id = ?
    `, [id]);

    return NextResponse.json({ 
      status: true, 
      message: "Law deleted successfully" 
    });
  } catch (error) {
    console.error('Error deleting law:', error);
    return NextResponse.json({ 
      status: false, 
      message: "Failed to delete law" 
    }, { status: 500 });
  }
}
