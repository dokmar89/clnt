import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // 465 = SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Debug log
  console.log("Odesílám e-mail na:", to);

  await transporter.sendMail({
    from: `PassProve <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
}
