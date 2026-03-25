import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <section>
      <h2>MVP Tracks</h2>
      <ul>
        <li>Arabic Letters</li>
        <li>Daily Duas</li>
        <li>Islamic Facts</li>
      </ul>
      <p>Next step: connect this page to API-based flashcards and quizzes.</p>
    </section>
  );
}
