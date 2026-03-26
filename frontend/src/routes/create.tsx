import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  appendFlashcards,
  generateFlashcards,
  getAIOptions,
  type Flashcard,
  type GenerationResponse,
} from "../lib/api";

export const Route = createFileRoute("/create")({
  component: CreatePage,
});

const subjectChoices = [
  { value: "arabic_letters", label: "Arabic letters" },
  { value: "duas", label: "Duas" },
  { value: "facts", label: "Islamic facts" },
];

function CreatePage() {
  const optionsQuery = useQuery({ queryKey: ["ai-options"], queryFn: getAIOptions });
  const [subject, setSubject] = useState("arabic_letters");
  const [topic, setTopic] = useState("the letter Ba");
  const [count, setCount] = useState(5);
  const [ageGroup, setAgeGroup] = useState("5-10");
  const [provider, setProvider] = useState<string>("fallback");
  const [model, setModel] = useState<string>("static-seed");
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  const options = optionsQuery.data;

  useEffect(() => {
    if (!options || defaultsApplied) return;
    const defaultP = options.default_provider || "fallback";
    setProvider(defaultP);
    const prov = options.providers.find((x) => x.id === defaultP);
    const defaultM = options.default_models[defaultP] ?? prov?.models?.[0] ?? "static-seed";
    setModel(defaultM);
    setDefaultsApplied(true);
  }, [options, defaultsApplied]);

  const generateMutation = useMutation({
    mutationFn: () =>
      generateFlashcards({
        subject,
        topic,
        count,
        age_group: ageGroup,
        provider,
        model: model || null,
      }),
    onSuccess: (data) => {
      setResult(data);
      setSaveMessage(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (cards: Flashcard[]) => appendFlashcards(cards),
    onSuccess: (saved) => {
      setSaveMessage(`Saved ${saved.length} card(s) to your deck. Open Flashcards to study them.`);
    },
  });

  if (optionsQuery.isLoading) return <p className="text-sm text-slate-500">Loading AI settings…</p>;
  if (optionsQuery.isError) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        We couldn't open the flashcard generator right now. Please try again.
      </p>
    );
  }

  const currentProvider = options!.providers.find((p) => p.id === provider);
  const models = currentProvider?.models ?? [];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="badge mb-3">AI Studio</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create flashcards with xAI</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Generate new card ideas, review the results, and save the best ones to your deck.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          className="soft-surface grid gap-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            generateMutation.mutate();
          }}
        >
          <label>
            <span className="label">Subject</span>
            <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjectChoices.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Topic</span>
            <input
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. morning adhkar, prophets, prayer times"
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="label">How many cards</span>
              <input
                className="input"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <label>
              <span className="label">Age group</span>
              <input className="input" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="label">AI provider</span>
              <select
                className="input"
                value={provider}
                onChange={(e) => {
                  const next = e.target.value;
                  setProvider(next);
                  if (!options) return;
                  const prov = options.providers.find((p) => p.id === next);
                  const m = options.default_models[next] ?? prov?.models?.[0] ?? "static-seed";
                  setModel(m);
                }}
              >
                {options!.providers.map((p) => (
                  <option key={p.id} value={p.id} disabled={!p.configured && p.id !== "fallback"}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Model</span>
              <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn-primary" type="submit" disabled={generateMutation.isPending}>
            {generateMutation.isPending ? "Generating..." : "Generate flashcards"}
          </button>
        </form>

        <aside className="soft-surface space-y-4 p-6">
          <h3 className="text-lg font-semibold text-slate-900">How it works</h3>
          <ol className="space-y-3 text-sm leading-6 text-slate-600">
            <li>1. Choose a subject, topic, and age range.</li>
            <li>2. Generate a small batch using xAI Grok.</li>
            <li>3. Review the draft cards before saving them to the deck.</li>
          </ol>
        </aside>
      </div>

      {generateMutation.isError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          We couldn't generate flashcards right now. Please try again.
        </p>
      ) : null}

      {result ? (
        <div className="soft-surface space-y-5 p-6">
          {result.warning ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Some suggestions may be limited right now, but you can still review and save the cards below.
            </p>
          ) : null}

          {result.flashcards.length === 0 ? (
            <p className="text-sm text-slate-600">No cards returned. Try a more specific topic.</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {result.flashcards.map((c, i) => (
                  <div key={i} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Front</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{c.front_text}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-500">Back</p>
                    <p className="mt-2 text-sm text-slate-700">{c.back_text}</p>
                    {c.arabic_text ? <p className="mt-4 text-2xl text-slate-900" dir="rtl">{c.arabic_text}</p> : null}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn-primary bg-brand-700 hover:bg-brand-800"
                  type="button"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate(result.flashcards)}
                >
                  {saveMutation.isPending ? "Saving..." : "Save to deck"}
                </button>
                {saveMessage ? <p className="self-center text-sm font-medium text-emerald-700">{saveMessage}</p> : null}
              </div>
              {saveMutation.isError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  We couldn't save these flashcards right now. Please try again.
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
