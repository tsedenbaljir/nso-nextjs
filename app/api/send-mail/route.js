import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/api/auth/adminAuth";

export async function POST(req) {
  const denied = await requireAdminApi(req);
  if (denied) return denied;

  const { to, subject, html } = await req.json();

  const smtpUser = process.env.INFO_EMAIL_1212;
  const smtpPass = process.env.INFO_PASSWORD_1212;

  if (!smtpUser || !smtpPass) {
    return NextResponse.json(
      { status: false, message: "SMTP credentials are not configured" },
      { status: 500 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `<${smtpUser}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({
      status: true,
      message: "Email sent successfully!",
      info,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: false,
      message: "Email failed to send.",
      error,
    });
  }
}
