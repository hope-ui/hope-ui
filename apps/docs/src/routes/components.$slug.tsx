import { createFileRoute } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { MdxDoc } from "~/components/MdxDoc";
import { NotFound } from "~/components/NotFound";
import { docFor } from "~/lib/content";

export const Route = createFileRoute("/components/$slug")({
  component: ComponentDoc,
});

function ComponentDoc() {
  const params = Route.useParams();
  const doc = () => docFor("components", params().slug);
  return (
    <Show when={doc()} fallback={<NotFound />}>
      {(mod) => <MdxDoc content={mod().default} toc={mod().tableOfContents} />}
    </Show>
  );
}
