import { NextResponse } from "next/server";
import { db } from '@/app/api/config/db_csweb.config';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import nodemailer from "nodemailer";

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
        console.log("userCheck>>>>>>>>", userCheck);
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

        try {
          const transporter = nodemailer.createTransport({
            host: "smtp.office365.com", // Replace with your SMTP host
            port: 587, // Usually 587 for TLS
            secure: false, // Use true for port 465, false for others
            auth: {
              user: "developer1212@nso.mn", // Replace with your email
              pass: "25veDloper$#", // Replace with your password
            },
          });

          // Send the email
          const info = await transporter.sendMail({
            from: `<developer1212@nso.mn>`, //<${process.env.INFO_EMAIL_1212}>`, // Sender address
            to, // Recipient address
            subject, // Subject line
            html, // HTML body
          });
          console.log("info>>>>>>>>",info);
          
        } catch (error) {
          console.error("Error in sendMail:", error);
        }

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
