import { createFileRoute, Outlet } from "@tanstack/solid-router";
import { DocsSection } from "~/components/DocsSection";

export const Route = createFileRoute("/components")({
  component: () => (
    <DocsSection kind="components">
      <Outlet />
    </DocsSection>
  ),
});
