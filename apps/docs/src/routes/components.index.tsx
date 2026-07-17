import { createFileRoute } from "@tanstack/solid-router";
import { SectionOverview } from "~/components/SectionOverview";

export const Route = createFileRoute("/components/")({
  component: () => (
    <SectionOverview
      kind="components"
      title="Components"
      description="Ready-to-use, themed, accessible components. Pick one to see usage, props, and live examples."
    />
  ),
});
