import nodemailer from "nodemailer";
import { PLATFORM_NAME } from "@/lib/brand";

/** Plain email from SMTP_FROM / SMTP_USER (strips optional "Name <email>" wrapper). */
function resolveSmtpEmail() {
  const raw = String(process.env.SMTP_FROM || process.env.SMTP_USER || "").trim();
  if (!raw) return "";
  const bracket = raw.match(/<([^>]+)>/);
  if (bracket) return bracket[1].trim();
  return raw.replace(/^["']|["']$/g, "");
}

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

  const platformName = process.env.PLATFORM_NAME || PLATFORM_NAME;
  const fromEmail = resolveSmtpEmail();
  /** Display name only in header; address still required by SMTP (use domain email to hide Gmail). */
  const from = fromEmail
    ? { name: platformName, address: fromEmail }
    : platformName;

  await transport.sendMail({
    from,
    to,
    subject: `${platformName} — Your verification code`,
    text: `${platformName}\n\nYour verification code is: ${otp}\n\nIt expires in 10 minutes.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1FACEE;">${platformName}</h2>
        <p style="margin:0 0 16px;font-size:15px;color:#111;">Verify your email</p>
        <p>Use this code to complete registration:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111;">${otp}</p>
        <p style="color:#666;font-size:14px;">Expires in 10 minutes. If you did not sign up, ignore this email.</p>
      </div>
    `,
  });

  return { dev: false };
}
