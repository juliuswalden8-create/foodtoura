"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DemoModeBanner } from "@/components/DemoModeBanner";
import {
  addJournalEntry,
  deleteJournalEntry,
  loadJournal,
  type JournalEntry,
} from "@/lib/journal";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [dish, setDish] = useState("");
  const [rating, setRating] = useState(4);

  useEffect(() => {
    setEntries(loadJournal());
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-terracotta">Food Passport</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-forest dark:text-cream">
        Your food journal
      </h1>
      <p className="mt-2 text-ink-soft">
        Private by default on this device. No fictional visits — only what you
        add.
      </p>
      <div className="mt-4">
        <DemoModeBanner compact />
      </div>

      <form
        className="card-surface mt-6 space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setEntries(
            addJournalEntry({
              restaurantName: name.trim(),
              city: city.trim() || "Unknown",
              date: new Date().toISOString().slice(0, 10),
              rating,
              dish: dish.trim() || undefined,
              notes: notes.trim(),
            }),
          );
          setName("");
          setDish("");
          setNotes("");
        }}
      >
        <input
          className="input-field"
          placeholder="Restaurant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input-field"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="input-field"
          placeholder="Dish (optional)"
          value={dish}
          onChange={(e) => setDish(e.target.value)}
        />
        <label className="block text-sm">
          Rating {rating}
          <input
            type="range"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <textarea
          className="input-field min-h-[80px]"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Save entry
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {entries.length === 0 && (
          <li className="text-sm text-ink-muted">No entries yet.</li>
        )}
        {entries.map((e) => (
          <li key={e.id} className="card-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-forest dark:text-cream">
                  {e.restaurantName}
                </p>
                <p className="text-xs text-ink-muted">
                  {e.city} · {e.date}
                  {e.rating ? ` · ★ ${e.rating}` : ""}
                </p>
                {e.dish && <p className="mt-1 text-sm">{e.dish}</p>}
                {e.notes && (
                  <p className="mt-1 text-sm text-ink-soft">{e.notes}</p>
                )}
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-terracotta"
                onClick={() => setEntries(deleteJournalEntry(e.id))}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Link href="/saved" className="btn-secondary mt-6 inline-flex">
        Saved restaurants
      </Link>
    </div>
  );
}
