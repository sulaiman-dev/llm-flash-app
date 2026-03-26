import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <section className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div>
            <p className="badge mb-3">Build the habit of learning</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Simple Islamic learning for kids, one card at a time.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Explore saved flashcards, answer quick quizzes, and generate fresh kid-friendly content with xAI Grok.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-primary" to="/flashcards">
              Start flashcards
            </Link>
            <Link className="btn-secondary" to="/create">
              Create new cards
            </Link>
          </div>
        </div>
        <div className="soft-surface bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
          <p className="text-sm font-medium text-brand-100">What makes IlmFlash special</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-brand-50">
            <li>Age-friendly Islamic micro-learning</li>
            <li>Arabic text, transliteration, and simple explanations</li>
            <li>xAI-assisted content generation saved into your own deck</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Flashcards"
          description="Flip through Arabic letters, duas, and facts with a cleaner study flow."
          to="/flashcards"
          cta="Open deck"
        />
        <FeatureCard
          title="Quiz"
          description="Reinforce learning with lightweight multiple-choice practice."
          to="/quiz"
          cta="Take quiz"
        />
        <FeatureCard
          title="Create with AI"
          description="Generate new cards with xAI Grok and save them directly to your study deck."
          to="/create"
          cta="Generate now"
        />
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  description,
  to,
  cta,
}: Readonly<{ title: string; description: string; to: string; cta: string }>) {
  return (
    <div className="soft-surface p-6">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
      <Link className="mt-6 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800" to={to}>
        {cta} →
      </Link>
    </div>
  );
}
