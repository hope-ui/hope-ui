import { createFileRoute } from "@tanstack/solid-router";
import Content from "~/content/getting-started.mdx";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

function DocsPage() {
  return (
    <article class="prose mx-auto max-w-3xl p-6">
      <Content />
    </article>
  );
}
