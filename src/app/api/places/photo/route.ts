import { NextRequest, NextResponse } from "next/server";
import { allowRequest, clientKey } from "@/lib/rate-limit";

/**
 * Proxies Places photo media so the API key never appears in client HTML.
 *
 * Strict allowlist: only `places/{id}/photos/{id}` with safe charset.
 * Rebuilds the path from capture groups — never pastes raw visitor input
 * into the upstream URL (blocks encoded ".." SSRF).
 */

const PHOTO_NAME_RE =
  /^places\/([A-Za-z0-9_-]{1,256})\/photos\/([A-Za-z0-9_-]{1,512})$/;

function sanitizePlacesPhotoName(raw: string | null): {
  placeId: string;
  photoId: string;
} | null {
  if (!raw || raw.length > 800) return null;

  let decoded = raw;
  for (let i = 0; i < 5; i++) {
    try {
      const next = decodeURIComponent(decoded.replace(/\+/g, " "));
      if (next === decoded) break;
      decoded = next;
    } catch {
      return null;
    }
  }

  // Reject any traversal / encoding residue after full decode
  if (
    decoded.includes("..") ||
    decoded.includes("\\") ||
    decoded.includes("%") ||
    decoded.includes("?") ||
    decoded.includes("#") ||
    decoded.includes("//") ||
    /\s/.test(decoded)
  ) {
    return null;
  }

  const m = PHOTO_NAME_RE.exec(decoded);
  if (!m) return null;
  return { placeId: m[1], photoId: m[2] };
}

export async function GET(req: NextRequest) {
  const ip = clientKey(req);
  if (!allowRequest(`photo:${ip}`, 40, 60_000)) {
    return NextResponse.json(
      { error: "Too many photo requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // Validate before touching secrets so bad names always 400
  const parsed = sanitizePlacesPhotoName(req.nextUrl.searchParams.get("name"));
  if (!parsed) {
    return NextResponse.json({ error: "Invalid photo name" }, { status: 400 });
  }

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

  const maxHeightPx = Math.min(
    1600,
    Math.max(100, Number(req.nextUrl.searchParams.get("h") || 800) || 800),
  );

  // Rebuild path from validated IDs only — never interpolate raw input.
  // skipHttpRedirect=true returns image bytes from Places (avoids CDN 302).
  const upstream = new URL(
    `https://places.googleapis.com/v1/places/${parsed.placeId}/photos/${parsed.photoId}/media`,
  );
  upstream.searchParams.set("maxHeightPx", String(maxHeightPx));
  upstream.searchParams.set("skipHttpRedirect", "true");
  upstream.searchParams.set("key", key);

  try {
    const res = await fetch(upstream.toString(), { redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      // Should not happen with skipHttpRedirect; refuse host jumps
      return NextResponse.json(
        { error: "Unexpected redirect from photo host" },
        { status: 502 },
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `Photo fetch failed (${res.status})` },
        { status: 502 },
      );
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Photo host returned non-image payload" },
        { status: 502 },
      );
    }
    const buf = await res.arrayBuffer();
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
