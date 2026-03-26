import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import "../styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IlmFlash" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="app-shell">
          <header className="border-b border-white/70 bg-white/75 backdrop-blur">
            <div className="app-container flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="badge mb-3">xAI-powered Islamic learning</p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">IlmFlash</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  A calm, child-friendly learning app for Arabic letters, duas, and Islamic facts.
                </p>
              </div>
              <nav className="flex flex-wrap gap-3 text-sm font-medium text-slate-700">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/flashcards">Flashcards</NavLink>
                <NavLink to="/quiz">Quiz</NavLink>
                <NavLink to="/create">Create with AI</NavLink>
              </nav>
            </div>
          </header>
          <main className="app-container py-8">
            <div className="surface p-6 sm:p-8">{children}</div>
          </main>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

function NavLink({ to, children }: Readonly<{ to: string; children: ReactNode }>) {
  return (
    <Link
      to={to}
      activeProps={{
        className: "rounded-full bg-brand-700 px-4 py-2 text-white shadow-sm",
      }}
      inactiveProps={{
        className:
          "rounded-full border border-stone-300 px-4 py-2 text-slate-700 transition hover:border-brand-400 hover:bg-white",
      }}
    >
      {children}
    </Link>
  );
}
