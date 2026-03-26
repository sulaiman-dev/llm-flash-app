import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SelectField } from "../components/select-field";
import { getFlashcards } from "../lib/api";

export const Route = createFileRoute("/flashcards")({
  component: FlashcardsPage,
});

const subjects: { value: string; label: string }[] = [
  { value: "", label: "All subjects" },
  { value: "arabic_letters", label: "Arabic letters" },
  { value: "duas", label: "Duas" },
  { value: "facts", label: "Facts" },
];

function FlashcardsPage() {
  const [subject, setSubject] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const query = useQuery({
    queryKey: ["flashcards", subject || "all"],
    queryFn: () => getFlashcards(subject || undefined),
  });

  const cards = query.data ?? [];
  const card = cards[index];

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [subject]);

  useEffect(() => {
    if (cards.length > 0 && index >= cards.length) {
      setIndex(0);
      setFlipped(false);
    }
  }, [cards.length, index]);

  if (query.isLoading) return <p className="text-sm text-slate-500">Loading cards…</p>;
  if (query.isError) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        We couldn't load your flashcards right now. Please try again.
      </p>
    );
  }

  if (!card) {
    return (
      <section className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Flashcards</h2>
        <p className="text-sm text-slate-600">No cards yet. Generate some on the Create page.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="badge mb-3">Study mode</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Flashcards</h2>
          <p className="mt-2 text-sm text-slate-600">Flip, review, and move through your saved cards.</p>
        </div>
        <SelectField className="min-w-52" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <span>{flipped ? "Showing answer" : "Showing prompt"}</span>
      </div>
      <button type="button" onClick={() => setFlipped((f) => !f)} className="flashcard-scene block w-full text-left">
        <div className={`flashcard-inner relative min-h-[24rem] ${flipped ? "is-flipped" : ""}`}>
          <div className="flashcard-face absolute inset-0">
            <div className="relative h-full overflow-hidden rounded-[2rem] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-stone-100 p-8 shadow-[0_20px_50px_-28px_rgba(15,23,32,0.35)] transition hover:-translate-y-0.5">
              <div className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
                Tap to flip
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Front</p>
              <p className="mt-5 max-w-2xl text-2xl font-semibold leading-relaxed text-slate-900 sm:text-3xl">
                {card.front_text}
              </p>
              {card.arabic_text ? (
                <p className="mt-8 text-right text-4xl leading-loose text-brand-900" dir="rtl">
                  {card.arabic_text}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flashcard-face flashcard-face-back absolute inset-0">
            <div className="relative h-full overflow-hidden rounded-[2rem] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-stone-100 p-8 shadow-[0_20px_50px_-28px_rgba(15,23,32,0.35)] transition hover:-translate-y-0.5">
              <div className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
                Tap to flip
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Back</p>
              <p className="mt-5 text-2xl font-semibold leading-relaxed text-slate-900">{card.back_text}</p>
              {card.transliteration ? <p className="mt-4 text-base text-slate-700">{card.transliteration}</p> : null}
              {card.translation ? <p className="mt-2 text-sm text-slate-600">{card.translation}</p> : null}
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="badge">{card.subject}</span>
                {card.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </button>
      <div className="flex flex-wrap gap-3">
        <button
          className="btn-secondary"
          type="button"
          disabled={index === 0}
          onClick={() => {
            setFlipped(false);
            setIndex((i) => Math.max(0, i - 1));
          }}
        >
          Previous
        </button>
        <button
          className="btn-primary"
          type="button"
          disabled={index >= cards.length - 1}
          onClick={() => {
            setFlipped(false);
            setIndex((i) => Math.min(cards.length - 1, i + 1));
          }}
        >
          Next
        </button>
      </div>
    </section>
  );
}
