import { NextResponse } from "next/server";
import { getRestaurantProvider } from "@/lib/provider";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id || id.length > 200) {
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
