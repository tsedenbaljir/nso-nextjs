import { db } from '@/app/api/config/db_csweb.config'; // зөв экспорт хийсэн эсэхээ шалгаарай

export async function POST(req) {
  try {
    const body = await req.json();
    const { q1, q2, q3, q4, q5 } = body;

    const q4Parsed = {
      Q4_1: q4["0"] ? parseInt(q4["0"]) : null,
      Q4_2: q4["1"] ? parseInt(q4["1"]) : null,
      Q4_3: q4["2"] ? parseInt(q4["2"]) : null,
      Q4_4: q4["3"] ? parseInt(q4["3"]) : null,
      Q4_5: q4["4"] ? parseInt(q4["4"]) : null,
      Q4_6: q4["5"] ? parseInt(q4["5"]) : null,
    };

    const [inserted] = await db('SurveyResponses').insert({
      Q1: q1,
      Q2: q2,
      Q3: Array.isArray(q3) ? q3.join(',') : null, 
      ...q4Parsed,
      Q5: q5,
    }).returning('Id');

    return new Response(JSON.stringify({ success: true, id: inserted.Id || inserted }), { status: 200 });

  } catch (err) {
    console.error("Survey POST error:", err);
    return new Response(JSON.stringify({ error: 'Failed to save survey' }), { status: 400 });
  }
}
