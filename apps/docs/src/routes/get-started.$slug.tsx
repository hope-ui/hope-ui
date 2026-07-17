import { createFileRoute } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { MdxDoc } from "~/components/MdxDoc";
import { NotFound } from "~/components/NotFound";
import { docFor } from "~/lib/content";

export const Route = createFileRoute("/get-started/$slug")({
  component: GetStartedDoc,
});

function GetStartedDoc() {
  const params = Route.useParams();
  const doc = () => docFor("get-started", params().slug);
  return (
    <Show when={doc()} fallback={<NotFound />}>
      {(mod) => (
        <MdxDoc
          content={mod().default}
          toc={mod().tableOfContents}
          section="get-started"
          slug={params().slug}
        />
      )}
    </Show>
  );
}
