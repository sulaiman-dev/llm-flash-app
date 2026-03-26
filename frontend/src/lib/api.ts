export const apiBase = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type Flashcard = {
  id: string | null;
  subject: string;
  front_text: string;
  back_text: string;
  arabic_text?: string | null;
  transliteration?: string | null;
  translation?: string | null;
  difficulty?: string;
  age_group?: string;
  tags?: string[];
};

export type QuizQuestion = {
  subject: string;
  question: string;
  choices: string[];
  correct_answer: string;
  explanation?: string | null;
};

export type ProviderOption = {
  id: string;
  label: string;
  configured: boolean;
  models: string[];
};

export type AIOptions = {
  default_provider: string;
  default_models: Record<string, string>;
  providers: ProviderOption[];
};

export type GenerationResponse = {
  provider: string;
  model: string;
  flashcards: Flashcard[];
  questions: QuizQuestion[];
  used_fallback: boolean;
  warning: string | null;
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export function getAIOptions() {
  return fetchJson<AIOptions>("/ai/options");
}

export function getFlashcards(subject?: string) {
  const q = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return fetchJson<Flashcard[]>(`/flashcards${q}`);
}

export function getQuizzes() {
  return fetchJson<QuizQuestion[]>("/quizzes");
}

export function appendFlashcards(flashcards: Flashcard[]) {
  return fetchJson<Flashcard[]>("/flashcards", {
    method: "POST",
    body: JSON.stringify({ flashcards }),
  });
}

export function generateFlashcards(body: {
  subject: string;
  topic: string;
  count: number;
  age_group: string;
  provider?: string | null;
  model?: string | null;
}) {
  return fetchJson<GenerationResponse>("/ai/generate-flashcards", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function generateQuiz(body: {
  subject: string;
  topic: string;
  count: number;
  age_group: string;
  provider?: string | null;
  model?: string | null;
}) {
  return fetchJson<GenerationResponse>("/ai/generate-quiz", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
