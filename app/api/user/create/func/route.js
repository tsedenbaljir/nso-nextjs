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
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .email-container {
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .greeting {
                    font-size: 24px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .content {
                    margin: 20px 0;
                }
                .token-container {
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .token-label {
                    color: #495057;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .token-value {
                    font-family: monospace;
                    background-color: #ffffff;
                    padding: 10px;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                    word-break: break-all;
                }
                .guide-link {
                    color: #007bff;
                    text-decoration: none;
                }
                .guide-link:hover {
                    text-decoration: underline;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #f0f0f0;
                    text-align: center;
                    color: #6c757d;
                }
                .post-text {
                    color: #28a745;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div className="email-container">
                <div className="header">
                    <div className="greeting">Сайн байна уу ${firstname} ${lastname},</div>               
                </div>
                <div className="content"></div>
                    <p>Статистикийн мэдээллийн нэгдсэн сангийн нээлттэй сервисийг ашиглах token тэмдэгтиийг хүргүүлж байна.</p>
                    
                    <div className="token-container">
                        <div className="token-label">Нээлттэй сервисийг ашиглахын тулд <span className="post-text">POST</span> request-ийн Headers:</div>
                        <div className="token-value">access-token: ${token_text}</div>
                    </div>
                    
                    <p>Ашиглах заавар: <a href="https://1212.mn" className="guide-link">https://1212.mn</a></p>
                </div>
                
                <div className="footer">
                    <p>Баярлалаа</p>
                </div>
            </div>
        </body>
        </html>`;

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
