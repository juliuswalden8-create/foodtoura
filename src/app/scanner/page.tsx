"use client";

import { useState } from "react";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { scanMenuText, type MenuScanResult } from "@/lib/menu-scanner";

const SAMPLE = `Tapas del día
Patatas bravas with aioli
Gambas al ajillo — garlic shrimp
Croquetas de jamón
Ensalada with walnuts and goat cheese
Pad thai with peanut sauce
Chocolate cake with hazelnut praline
House bread and butter`;

export default function ScannerPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<MenuScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  async function runScan(source = text) {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 400));
    setResult(scanMenuText(source));
    setScanning(false);
  }

  async function onFile(file: File | null) {
    if (!file) return;
    // Image OCR not wired without a vision API key — extract text if .txt, else guide user
    if (file.type.startsWith("text/") || file.name.endsWith(".txt")) {
      const content = await file.text();
      setText(content);
      await runScan(content);
      return;
    }
    setResult({
      hits: [],
      dishes: [],
      disclaimer:
        "Image OCR requires a vision/OCR API key (not configured). Paste menu text, or add an OCR provider later. Do not assume a photo scan is safe.",
      engine: "heuristic-v1",
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Smart Menu Scanner</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
        Check a menu for allergens
      </h1>
      <p className="mt-2 text-ink-soft">
        Paste menu text (or upload a .txt). Heuristic flags for the 14 EU
        allergens — not a medical analysis.
      </p>

      <div className="mt-5 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>

      <div className="card-surface mt-6 space-y-4 p-5">
        <textarea
          className="input-field min-h-[180px]"
          placeholder="Paste menu text here…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary"
            disabled={scanning || !text.trim()}
            onClick={() => runScan()}
          >
            {scanning ? "Scanning…" : "Scan menu"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setText(SAMPLE);
              void runScan(SAMPLE);
            }}
          >
            Try sample menu
          </button>
          <label className="btn-secondary cursor-pointer">
            Upload .txt / image
            <input
              type="file"
              accept="text/plain,image/*"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <p className="text-xs text-ink-muted">
          Image OCR needs a vision API — missing today. Text scan works offline
          with the heuristic engine.
        </p>
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100">
            {result.disclaimer}
          </div>

          {result.hits.length === 0 ? (
            <div className="card-surface p-5 text-sm text-ink-soft">
              No allergen keywords detected in the text. That does{" "}
              <strong>not</strong> mean the menu is safe — confirm with staff.
            </div>
          ) : (
            <div className="card-surface divide-y divide-mist dark:divide-white/10">
              {result.hits.map((h) => (
                <div key={h.allergen} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-forest dark:text-cream">
                      {h.label}
                    </p>
                    <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-semibold dark:bg-white/10">
                      {h.confidence} confidence
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                    {h.evidence.map((e) => (
                      <li key={e}>“{e}”</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {result.dishes.length > 0 && (
            <div className="card-surface p-5">
              <h2 className="font-display text-lg font-semibold text-forest dark:text-cream">
                Flagged dish lines
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {result.dishes.map((d) => (
                  <li key={d.name}>
                    <span className="font-medium">{d.name}</span>
                    <span className="text-ink-muted">
                      {" "}
                      — {d.flagged.join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
