import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';
import { uploadFile } from '@/utils/fileUpload';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const lng = searchParams.get('lng') || 'mn';
  
  try {
    let query = `
      SELECT * FROM web_1212_transparency
      WHERE lng = ?
    `;
    
    const params = [lng];
    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY created_date DESC`;
    
    const results = await db.raw(query, params);

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

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const category = formData.get('category');
    const description = formData.get('description');
    const lng = formData.get('lng') || 'mn';

    let file_path = null;
    if (file && file.size > 0) {
      try {
        file_path = await uploadFile(file);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return NextResponse.json({ 
          status: false, 
          message: "File upload failed" 
        }, { status: 500 });
      }
    }

    await db.raw(`
      INSERT INTO web_1212_transparency (
        title,
        category,
        description,
        file_path,
        lng,
        created_date,
        updated_date,
        insert_user,
        edit_user
      ) 
      VALUES (?, ?, ?, ?, ?, GETDATE(), GETDATE(), ?, ?)
    `, [title, category, description, file_path, lng, 'admin', 'admin']);

    return NextResponse.json({ 
      status: true, 
      message: "Transparency item added successfully"
    });
  } catch (error) {
    console.error('Error adding transparency item:', error);
    return NextResponse.json({ 
      status: false, 
      message: error.message || "Failed to add transparency item" 
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const id = formData.get('id');
    const title = formData.get('title');
    const category = formData.get('category');
    const description = formData.get('description');
    const file = formData.get('file');

    let updateQuery = `
      UPDATE web_1212_transparency 
      SET title = ?,
          category = ?,
          description = ?,
          updated_date = GETDATE()
    `;
    
    const params = [title, category, description];

    // Handle file upload if a new file is provided
    if (file && file.size > 0) {
      try {
        const file_path = await uploadFile(file);
        updateQuery += `, file_path = ?`;
        params.push(file_path);
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return NextResponse.json({ 
          status: false, 
          message: "File upload failed" 
        }, { status: 500 });
      }
    }

    updateQuery += ` WHERE id = ?`;
    params.push(id);

    await db.raw(updateQuery, params);

    return NextResponse.json({ 
      status: true, 
      message: "Transparency item updated successfully" 
    });
  } catch (error) {
    console.error('Error updating transparency item:', error);
    return NextResponse.json({ 
      status: false, 
      message: "Failed to update transparency item" 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await db.raw(`
      DELETE FROM web_1212_transparency 
      WHERE id = ?
    `, [id]);

    return NextResponse.json({ 
      status: true, 
      message: "Transparency item deleted successfully" 
    });
  } catch (error) {
    console.error('Error deleting transparency item:', error);
    return NextResponse.json({ 
      status: false, 
      message: "Failed to delete transparency item" 
    }, { status: 500 });
  }
} 