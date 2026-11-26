import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies Places photo media so the API key never appears in client HTML.
 * Usage: /api/places/photo?name=places%2F...%2Fphotos%2F...
 */
export async function GET(req: NextRequest) {
  const key =
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.PLACES_API_KEY ||
    process.env.RESTAURANT_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "GOOGLE_PLACES_API_KEY not configured" },
      { status: 503 },
    );
  }

  const name = req.nextUrl.searchParams.get("name");
  const maxHeightPx = Math.min(
    1600,
    Math.max(100, Number(req.nextUrl.searchParams.get("h") || 800)),
  );
  if (!name || !name.startsWith("places/") || name.includes("..")) {
    return NextResponse.json({ error: "Invalid photo name" }, { status: 400 });
  }

  const url = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=${maxHeightPx}&key=${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Photo fetch failed (${res.status})` },
        { status: 502 },
      );
    }
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo network failure" }, { status: 502 });
  }
}
