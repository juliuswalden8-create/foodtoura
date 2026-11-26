export const TASTE_KEY = "foodtoura.taste.v1";

export interface TasteProfile {
  likedCuisines: string[];
  dislikedCuisines: string[];
  likedTags: string[];
  dislikedTags: string[];
  swipes: number;
}

export function loadTaste(): TasteProfile {
  if (typeof window === "undefined") return emptyTaste();
  try {
    const raw = localStorage.getItem(TASTE_KEY);
    return raw ? { ...emptyTaste(), ...JSON.parse(raw) } : emptyTaste();
  } catch {
    return emptyTaste();
  }
}

export function emptyTaste(): TasteProfile {
  return {
    likedCuisines: [],
    dislikedCuisines: [],
    likedTags: [],
    dislikedTags: [],
    swipes: 0,
  };
}

export function saveTaste(t: TasteProfile) {
  localStorage.setItem(TASTE_KEY, JSON.stringify(t));
}

export function resetTaste() {
  localStorage.removeItem(TASTE_KEY);
}

/** Soft score delta from Food Tinder — never allergy-related. */
export function tasteScoreDelta(
  cuisine: string[],
  tags: string[],
  taste: TasteProfile,
): { delta: number; reason?: string } {
  let delta = 0;
  let reason: string | undefined;
  for (const c of cuisine) {
    if (taste.likedCuisines.includes(c)) {
      delta += 8;
      reason = `Matches tastes you liked (${c})`;
    }
    if (taste.dislikedCuisines.includes(c)) delta -= 10;
  }
  for (const t of tags) {
    if (taste.likedTags.includes(t)) delta += 4;
    if (taste.dislikedTags.includes(t)) delta -= 4;
  }
  return { delta, reason };
}
