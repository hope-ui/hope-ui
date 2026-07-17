import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { DocsSection } from "~/components/DocsSection";

export const Route = createFileRoute("/changelog")({
  component: () => (
    <DocsSection kind="changelog">
      <Outlet />
    </DocsSection>
  ),
});
