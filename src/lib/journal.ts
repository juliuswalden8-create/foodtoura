export const JOURNAL_KEY = "foodtoura.journal.v1";

export interface JournalEntry {
  id: string;
  restaurantId?: string;
  restaurantName: string;
  city: string;
  date: string;
  rating?: number;
  dish?: string;
  notes: string;
  createdAt: string;
}

export function loadJournal(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveJournal(entries: JournalEntry[]) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}

export function addJournalEntry(
  entry: Omit<JournalEntry, "id" | "createdAt">,
): JournalEntry[] {
  const next = [
    {
      ...entry,
      id: `j-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    ...loadJournal(),
  ];
  saveJournal(next);
  return next;
}

export function deleteJournalEntry(id: string): JournalEntry[] {
  const next = loadJournal().filter((e) => e.id !== id);
  saveJournal(next);
  return next;
}
