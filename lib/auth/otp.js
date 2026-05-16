import crypto from "crypto";
import { hashPassword, comparePassword } from "@/lib/auth/password";

export function generateOtpCode() {
  return String(crypto.randomInt(100000, 999999));
}

export async function hashOtp(code) {
  return hashPassword(code);
}

export async function verifyOtp(code, hash) {
  return comparePassword(code, hash);
}

export function otpExpiryDate() {
  return new Date(Date.now() + 10 * 60 * 1000);
}
