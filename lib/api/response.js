import { NextResponse } from "next/server";

/** Use NextResponse so Set-Cookie from cookies().set() is included in the response. */
export function jsonOk(data, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}
