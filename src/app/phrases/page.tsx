"use client";

import { useState } from "react";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import { SafetyBanner } from "@/components/SafetyBanner";
import { PHRASES, type PhraseLang } from "@/lib/phrasebook";

const LANGS: { id: PhraseLang; label: string }[] = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
  { id: "pt", label: "Português" },
  { id: "fr", label: "Français" },
];

export default function PhrasesPage() {
  const [lang, setLang] = useState<PhraseLang>("es");
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Phrase book</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest">
        Tell the kitchen clearly
      </h1>
      <p className="mt-2 text-ink-soft">
        Short staff-facing lines for allergies and diet. Pair with your Allergy
        Passport — still verify every dish.
      </p>

      <div className="mt-5 space-y-3">
        <DemoModeBanner compact />
        <SafetyBanner compact />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`chip ${lang === l.id ? "chip-active" : "chip-idle"}`}
            onClick={() => setLang(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {PHRASES.map((p) => (
          <li key={p.id} className="card-surface p-4">
            <p className="text-sm font-semibold text-forest">
              {p[lang]}
            </p>
            {lang !== "en" && (
              <p className="mt-1 text-xs text-ink-muted">{p.en}</p>
            )}
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-terracotta"
              onClick={async () => {
                await navigator.clipboard.writeText(p[lang]);
                setCopied(p.id);
              }}
            >
              {copied === p.id ? "Copied" : "Copy"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
