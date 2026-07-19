import { createFileRoute } from "@tanstack/solid-router";
import { SectionOverview } from "~/components/SectionOverview";

export const Route = createFileRoute("/get-started/")({
  component: () => (
    <SectionOverview
      kind="get-started"
      title="Get Started"
      description="Everything you need to add hope-ui to your app — installation, theming, and core concepts."
    />
  ),
});
