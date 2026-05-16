import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOtpEmail(to, otp) {
  const transport = createTransport();

  if (!transport) {
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return { dev: true };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transport.sendMail({
    from,
    to,
    subject: "Your Earning verification code",
    text: `Your verification code is: ${otp}\n\nIt expires in 10 minutes.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1FACEE;">Verify your email</h2>
        <p>Use this code to complete registration:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111;">${otp}</p>
        <p style="color:#666;font-size:14px;">Expires in 10 minutes. If you did not sign up, ignore this email.</p>
      </div>
    `,
  });

  return { dev: false };
}
