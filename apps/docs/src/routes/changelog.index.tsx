import { createFileRoute } from "@tanstack/solid-router";
import { SectionOverview } from "~/components/SectionOverview";

export const Route = createFileRoute("/changelog/")({
  component: () => (
    <SectionOverview
      kind="changelog"
      title="Changelog"
      description="Release notes for hope-ui, newest first."
    />
  ),
});
