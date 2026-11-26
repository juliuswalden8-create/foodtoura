import { NextResponse } from "next/server";
import { scanMenuText } from "@/lib/menu-scanner";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return NextResponse.json({ error: "Provide menu text." }, { status: 400 });
    }
    return NextResponse.json(scanMenuText(text));
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
