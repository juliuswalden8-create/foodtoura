"use client";

import { useState } from "react";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { PHRASES, type PhraseLang } from "@/lib/phrasebook";

const EXTRA = [
  {
    id: "table",
    en: "A table for two, please.",
    es: "Una mesa para dos, por favor.",
    pt: "Uma mesa para dois, por favor.",
    fr: "Une table pour deux, s'il vous plaît.",
  },
  {
    id: "bill",
    en: "Could we have the bill, please?",
    es: "¿Nos trae la cuenta, por favor?",
    pt: "Podemos ter a conta, por favor?",
    fr: "L'addition, s'il vous plaît ?",
  },
  {
    id: "split",
    en: "Could we pay separately?",
    es: "¿Podemos pagar por separado?",
    pt: "Podemos pagar em separado?",
    fr: "Pouvons-nous payer séparément ?",
  },
  {
    id: "recommend",
    en: "What would you recommend that is popular with locals?",
    es: "¿Qué recomienda que sea popular entre los locales?",
    pt: "O que recomenda que seja popular entre os locais?",
    fr: "Que recommandez-vous de populaire chez les locaux ?",
  },
];

const ALL = [...EXTRA, ...PHRASES];

export default function WaiterPage() {
  const [lang, setLang] = useState<PhraseLang>("es");
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">AI Waiter</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
        Speak with the table
      </h1>
      <p className="mt-2 text-ink-soft">
        Reviewed phrase cards for the table. Translations are helpful — not
        medically verified unless marked reviewed (allergy lines pair with
        Passport).
      </p>
      <div className="mt-4 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["es", "en", "pt", "fr"] as PhraseLang[]).map((l) => (
          <button
            key={l}
            type="button"
            className={`chip ${lang === l ? "chip-active" : "chip-idle"}`}
            onClick={() => setLang(l)}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {ALL.map((p) => (
          <li key={p.id} className="card-surface p-4">
            <p className="text-lg font-semibold text-forest">
              {p[lang]}
            </p>
            {lang !== "en" && (
              <p className="mt-1 text-xs text-ink-muted">{p.en}</p>
            )}
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                className="text-xs font-semibold text-terracotta"
                onClick={() => setFullscreen(p[lang])}
              >
                Full screen
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-terracotta"
                onClick={() => navigator.clipboard.writeText(p[lang])}
              >
                Copy
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="card-surface mt-6 space-y-3 p-5">
        <p className="text-sm font-medium">Custom line (show as-is)</p>
        <textarea
          className="input-field min-h-[80px]"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Type what you want staff to read…"
        />
        <button
          type="button"
          className="btn-secondary"
          disabled={!custom.trim()}
          onClick={() => setFullscreen(custom.trim())}
        >
          Show full screen
        </button>
      </div>

      {fullscreen && (
        <button
          type="button"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-cream p-8 text-center"
          onClick={() => setFullscreen(null)}
        >
          <p className="font-display text-3xl font-semibold leading-snug text-forest sm:text-5xl">
            {fullscreen}
          </p>
        </button>
      )}
    </div>
  );
}
