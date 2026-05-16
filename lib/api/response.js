export function jsonOk(data, status = 200) {
  return Response.json({ success: true, ...data }, { status });
}

export function jsonError(message, status = 400) {
  return Response.json({ success: false, message }, { status });
}
