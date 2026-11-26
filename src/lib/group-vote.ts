export const VOTE_KEY = "foodtoura.votes.v1";

export interface VoteBoard {
  city: string;
  voterName: string;
  votes: Record<string, "yes" | "maybe" | "no">;
}

export function loadVotes(): VoteBoard {
  if (typeof window === "undefined") {
    return { city: "", voterName: "You", votes: {} };
  }
  try {
    const raw = localStorage.getItem(VOTE_KEY);
    if (!raw) return { city: "", voterName: "You", votes: {} };
    return JSON.parse(raw);
  } catch {
    return { city: "", voterName: "You", votes: {} };
  }
}

export function saveVotes(board: VoteBoard) {
  localStorage.setItem(VOTE_KEY, JSON.stringify(board));
}

export function tally(votes: Record<string, "yes" | "maybe" | "no">) {
  const scores: Record<string, number> = {};
  for (const [id, v] of Object.entries(votes)) {
    scores[id] = (scores[id] || 0) + (v === "yes" ? 2 : v === "maybe" ? 1 : -2);
  }
  return scores;
}
