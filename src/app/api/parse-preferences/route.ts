import { NextResponse } from "next/server";
import { parsePreferences } from "@/lib/preference-parser";

/**
 * AI-ready preference parsing endpoint.
 * POST { text: string } → ParsedPreferences
 * Swap parsePreferences() for an LLM without changing clients.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    if (!text.trim()) {
      return NextResponse.json(
        { error: "Provide a non-empty text field." },
        { status: 400 },
      );
    }
    const parsed = await parsePreferences(text);
    return NextResponse.json({ parsed, engine: "heuristic-v1" });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
