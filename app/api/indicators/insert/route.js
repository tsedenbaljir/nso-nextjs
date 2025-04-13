import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config.js';

export async function PUT(req) {
  const formData = await req.formData();

  const id = formData.get('id');
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
  const updated_date = formData.get('updated_date');
  const list_order = formData.get('list_order');
  const created_by = formData.get('created_by');
  const created_date = formData.get('created_date');
  const last_modified_by = formData.get('last_modified_by');
  const last_modified_date = formData.get('last_modified_date');
  const indicator_perc = formData.get('indicator_perc');

  for (const [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    await db('web_1212_main_indicator')
      .where({ id })
      .update({
        name,
        name_eng,
        indicator_type,
        catalogue_id,
        indicator,
        measure_type,
        image: typeof image === 'object' ? image.name : image, 
        info,
        info_eng,
        tableau,
        tableau_eng,
        published,
        updated_date,
        list_order,
        created_by,
        created_date,
        last_modified_by,
        last_modified_date,
        indicator_perc
      });

    return NextResponse.json({ status: true, message: 'Таны хүсэлтийг хүлээн авлаа.' }, { status: 200 });

  } catch (error) {
    console.error('DB алдаа:', error);
    return NextResponse.json(
      { status: false, error: 'Хүсэлт илгээхэд алдаа гарлаа. Та дахин оролдоно уу.' },
      { status: 500 }
    );
  }
}
