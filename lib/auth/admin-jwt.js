import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secret);
}

/** Admin sessions use shorter TTL than user sessions. */
const ADMIN_TTL = "8h";

/** @param {{ adminId: string, email: string, role: "admin" }} payload */
export async function signAdminToken(payload) {
  return new SignJWT({ ...payload, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ADMIN_TTL)
    .sign(getSecret());
}

export async function verifyAdminToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  if (payload.role !== "admin") {
    throw new Error("Invalid admin token");
  }
  return payload;
}
