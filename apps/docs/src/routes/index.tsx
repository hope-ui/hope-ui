import { createFileRoute, Link } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main class="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">hope-ui</h1>
      <p class="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
        Batteries-included, themed, accessible components for SolidJS.
      </p>
      <div class="mt-8 flex justify-center gap-3">
        <Link
          to="/docs"
          class="inline-flex items-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-on-primary"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}
