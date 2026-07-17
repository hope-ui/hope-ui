import { createFileRoute } from "@tanstack/solid-router";
import { SectionOverview } from "~/components/SectionOverview";

export const Route = createFileRoute("/components/")({
  component: () => (
    <SectionOverview
      kind="components"
      title="Components"
      description="Ready-to-use, themed, accessible components. Pick one to see usage, props, and live examples."
      callout={
        <>
          hope-ui is in active development for <strong>SolidJS 2.0</strong>. More components are on
          the way — each is built over the headless <code>@hope-ui/primitives</code> kernel.
        </>
      }
    />
  ),
});
