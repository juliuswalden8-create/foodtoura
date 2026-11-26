import type { EuAllergen } from "./types";
import { ALLERGEN_LABEL, ALLERGEN_SHORT } from "./allergens";

export interface MenuScanHit {
  allergen: EuAllergen;
  label: string;
  short: string;
  evidence: string[];
  confidence: "high" | "medium" | "low";
}

export interface MenuScanResult {
  hits: MenuScanHit[];
  dishes: { name: string; flagged: EuAllergen[] }[];
  disclaimer: string;
  engine: "heuristic-v1";
}

const PATTERNS: { id: EuAllergen; patterns: RegExp[] }[] = [
  { id: "peanuts", patterns: [/peanut/i, /groundnut/i, /satay/i] },
  {
    id: "nuts",
    patterns: [/almond/i, /walnut/i, /hazelnut/i, /cashew/i, /pistachio/i, /pecan/i, /tree ?nut/i],
  },
  { id: "milk", patterns: [/milk\b/i, /cream\b/i, /butter\b/i, /cheese\b/i, /yogurt/i, /lactose/i] },
  { id: "eggs", patterns: [/\beggs?\b/i, /mayonnaise/i, /aioli/i] },
  { id: "fish", patterns: [/\bfish\b/i, /salmon/i, /tuna/i, /cod\b/i, /anchov/i] },
  {
    id: "crustaceans",
    patterns: [/shrimp/i, /prawn/i, /crab/i, /lobster/i, /crayfish/i],
  },
  { id: "molluscs", patterns: [/mussel/i, /oyster/i, /clam/i, /squid/i, /octopus/i, /scallop/i] },
  { id: "cereals_gluten", patterns: [/wheat/i, /gluten/i, /flour/i, /pasta/i, /bread/i, /bagel/i] },
  { id: "soybeans", patterns: [/soy\b/i, /soya/i, /tofu/i, /edamame/i] },
  { id: "sesame", patterns: [/sesame/i, /tahini/i] },
  { id: "mustard", patterns: [/mustard/i] },
  { id: "celery", patterns: [/celery/i] },
  { id: "lupin", patterns: [/lupin/i] },
  { id: "sulphites", patterns: [/sulphite/i, /sulfite/i, /wine sauce/i] },
];

/**
 * Smart Menu Scanner — heuristic OCR-ready text analyzer.
 * Extension: swap body for vision LLM / OCR pipeline; keep MenuScanResult shape.
 */
export function scanMenuText(text: string): MenuScanResult {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const hitMap = new Map<EuAllergen, MenuScanHit>();

  for (const { id, patterns } of PATTERNS) {
    const evidence: string[] = [];
    for (const line of lines) {
      if (patterns.some((p) => p.test(line))) {
        evidence.push(line.slice(0, 120));
      }
    }
    if (evidence.length) {
      hitMap.set(id, {
        allergen: id,
        label: ALLERGEN_LABEL[id],
        short: ALLERGEN_SHORT[id],
        evidence: evidence.slice(0, 4),
        confidence: evidence.length >= 3 ? "high" : evidence.length === 2 ? "medium" : "low",
      });
    }
  }

  const dishes = lines
    .filter((l) => l.length > 3 && l.length < 80 && !/^allerg/i.test(l))
    .slice(0, 24)
    .map((name) => {
      const flagged: EuAllergen[] = [];
      for (const { id, patterns } of PATTERNS) {
        if (patterns.some((p) => p.test(name))) flagged.push(id);
      }
      return { name, flagged };
    })
    .filter((d) => d.flagged.length > 0);

  return {
    hits: Array.from(hitMap.values()),
    dishes,
    disclaimer:
      "Heuristic scan only — not a medical or lab analysis. OCR/AI misreads happen. Always confirm allergens with restaurant staff before ordering.",
    engine: "heuristic-v1",
  };
}
