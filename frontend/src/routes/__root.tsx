import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: 20 }}>
        <h1>IlmFlash</h1>
        <p>Learn Arabic letters, duas, and Islamic facts.</p>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="/">Home</Link>
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">
            Backend API Docs
          </a>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
