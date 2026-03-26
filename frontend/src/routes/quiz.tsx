import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getQuizzes } from "../lib/api";

export const Route = createFileRoute("/quiz")({
  component: QuizPage,
});

function QuizPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const query = useQuery({
    queryKey: ["quizzes"],
    queryFn: getQuizzes,
  });

  if (query.isLoading) return <p className="text-sm text-slate-500">Loading quiz…</p>;
  if (query.isError) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        We couldn't load the quiz right now. Please try again.
      </p>
    );
  }

  const questions = query.data ?? [];
  const q = questions[index];

  if (!questions.length) {
    return (
      <section className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quiz</h2>
        <p className="text-sm text-slate-600">No questions yet.</p>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quiz complete</h2>
        <p className="text-lg text-slate-700">
          You scored {score} out of {questions.length}.
        </p>
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setScore(0);
            setFinished(false);
          }}
        >
          Try again
        </button>
      </section>
    );
  }

  const reveal = selected !== null;
  const isCorrect = reveal && selected === q.correct_answer;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="badge mb-3">Practice mode</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quiz</h2>
          <p className="mt-2 text-sm text-slate-600">
            Question {index + 1} of {questions.length} · Score: {score}
          </p>
        </div>
      </div>
      <div className="soft-surface p-6">
        <p className="text-xl font-semibold text-slate-900">{q.question}</p>
      </div>
      <ul className="space-y-3">
        {q.choices.map((choice) => {
          let buttonClass = "soft-surface w-full px-4 py-4 text-left text-sm font-medium text-slate-800";
          if (reveal) {
            if (choice === q.correct_answer) buttonClass += " border-emerald-300 bg-emerald-50";
            else if (choice === selected && choice !== q.correct_answer) buttonClass += " border-red-300 bg-red-50";
          }
          return (
            <li key={choice}>
              <button
                type="button"
                disabled={reveal}
                onClick={() => setSelected(choice)}
                className={buttonClass}
              >
                {choice}
              </button>
            </li>
          );
        })}
      </ul>
      {reveal ? (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
          <p className={isCorrect ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>
            {isCorrect ? "Correct!" : `Answer: ${q.correct_answer}`}
          </p>
          {q.explanation ? <p className="text-sm leading-6 text-slate-600">{q.explanation}</p> : null}
          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              if (isCorrect) setScore((s) => s + 1);
              if (index >= questions.length - 1) setFinished(true);
              else {
                setIndex((i) => i + 1);
                setSelected(null);
              }
            }}
          >
            {index >= questions.length - 1 ? "Finish" : "Next question"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Tap an answer.</p>
      )}
    </section>
  );
}
