import { NextResponse } from "next/server";
import { db } from '@/app/api/config/db_csweb.config';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { sendMail } from '@/services/MailService';

export async function POST(request) {
  if (!request.headers.get("X-API-Key")) {
    return NextResponse.json({ status: false, message: "Unauthorized" });
  }

  if (request.headers.get("X-API-Key") === process.env.X_API_KEY) {
    const data = await request.json();
    const {
      id,
      user_level,
      organisation_name,
      firstname,
      lastname,
      email,
      position,
      mobile,
      specification,
    } = data;

    try {
      const now = new Date();
      const created_date = moment(now).format("YYYY-MM-DDTHH:mm:ssZ");
      const updated_date = moment(now).format("YYYY-MM-DDTHH:mm:ssZ");

      if (email) {
        // Check if user with email already exists
        const userCheck = await db.raw(`
          SELECT id FROM md_users WHERE email = ?
        `, [email]);

        if (userCheck[0]?.id) {
          return NextResponse.json({
            status: false,
            message: `${email} Имэйл хаягтай хэрэглэгч бүртгэлтэй байна.`
          });
        }

        const password = "123";
        const token_text = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const result = await db.raw(`
          INSERT INTO md_users (
            organisation_name,
            user_level,
            firstname,
            lastname,
            email,
            position,
            mobile,
            token_text,
            password,
            specification,
            created_user,
            updated_user,
            created_date,
            updated_date
          ) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          organisation_name,
          user_level || 0,
          firstname,
          lastname,
          email,
          position,
          mobile,
          token_text,
          hashedPassword,
          specification,
          1, // created_user
          1, // updated_user
          created_date,
          updated_date
        ]);
        const user = result[0];

        // Send email with token
        const to = email;
        const subject = "Нээлттэй сервисийг ашиглах тухай";
        const html = `Сайн байна уу ${firstname}, <br/><br/> 
        Статистикийн мэдээллийн нэгдсэн сангийн нээлттэй сервисийг ашиглах token тэмдэгтиийг хүргүүлж байна.
        Нээлттэй сервисийг ашиглахын тулд POST request-ийн Headers: access-token:  <b>${token_text}</b> 
        <br/>
          Ашиглах заавар: https://1212.mn
        <br/><br/> Баярлалаа`;

        await sendMail({ to, subject, html });

        return NextResponse.json({
          status: true,
          message: `Таны мэдээлэл амжилттай нэмэгдлээ! Та и-мэйл хаягаа шалгана уу`,
          user
        });
      }

      return NextResponse.json({
        status: false,
        message: "Email is required"
      });

    } catch (error) {
      console.error("Error in createUser:", error);
      return NextResponse.json({
        status: false,
        message: "Failed to create user"
      });
    }
  }

  return NextResponse.json({
    status: false,
    message: "Invalid API key"
  });
}
