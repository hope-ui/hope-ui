import { createFileRoute } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { MdxDoc } from "~/components/MdxDoc";
import { NotFound } from "~/components/NotFound";
import { docFor } from "~/lib/content";

export const Route = createFileRoute("/changelog/$slug")({
  component: ChangelogEntry,
});

function ChangelogEntry() {
  const params = Route.useParams();
  const doc = () => docFor("changelog", params().slug);
  return (
    <Show when={doc()} fallback={<NotFound />}>
      {(mod) => (
        <MdxDoc
          content={mod().default}
          toc={mod().tableOfContents}
          section="changelog"
          slug={params().slug}
        />
      )}
    </Show>
  );
}
