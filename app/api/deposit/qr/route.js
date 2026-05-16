import QRCode from "qrcode";
import { jsonError } from "@/lib/api/response";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text")?.trim();
    if (!text || text.length > 256) {
      return jsonError("Invalid QR text", 400);
    }

    const png = await QRCode.toBuffer(text, {
      type: "png",
      width: 280,
      margin: 2,
      color: { dark: "#0b1018", light: "#ffffff" },
    });

    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("deposit/qr:", err);
    return jsonError("QR generation failed", 500);
  }
}
