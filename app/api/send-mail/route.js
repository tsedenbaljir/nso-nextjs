import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { to, subject, html } = await req.json();
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com", // Replace with your SMTP host
      port: 465, // Usually 587 for TLS
      secure: true, // Use true for port 465, false for others
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
