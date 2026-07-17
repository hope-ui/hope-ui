import { createFileRoute, Link } from "@tanstack/solid-router";
import { SITE } from "~/config";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main class="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">{SITE.name}</h1>
      <p class="mx-auto mt-4 max-w-xl text-lg text-foreground-muted">{SITE.description}</p>
      <div class="mt-8 flex justify-center gap-3">
        <Link
          to="/get-started"
          class="inline-flex items-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-on-primary"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}
