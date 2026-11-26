import { NextResponse } from "next/server";
import { getRestaurantProvider } from "@/lib/provider";
import { allowRequest, clientKey } from "@/lib/rate-limit";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const ip = clientKey(request);
  if (!allowRequest(`restaurant:${ip}`, 40, 60_000)) {
    return NextResponse.json(
      { error: "Too many restaurant lookups. Try again shortly." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { id } = await context.params;
  if (!id || id.length > 200 || /[./\\]/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const restaurant = await getRestaurantProvider().getById(id);
    if (!restaurant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      restaurant,
      mode: getRestaurantProvider().mode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
