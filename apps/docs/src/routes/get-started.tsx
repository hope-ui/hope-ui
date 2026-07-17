import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { DocsSection } from "~/components/DocsSection";

export const Route = createFileRoute("/get-started")({
  component: () => (
    <DocsSection kind="get-started">
      <Outlet />
    </DocsSection>
  ),
});
