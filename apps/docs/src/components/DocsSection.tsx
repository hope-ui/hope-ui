import type { JSX } from "@solidjs/web";
import { SectionNav } from "~/components/SectionNav";

// Shared layout for a docs section (Get started, Components, Changelog, …): an
// auto-generated left sidebar (SectionNav) — grouped by category when the section
// uses category subfolders (see lib/content.ts) — plus the routed page via
// <Outlet/>. The sidebar is desktop-only (`md:block`); on small viewports the same
// SectionNav is reached through the header's mobile drawer (see MobileNav). Every
// section layout route is a 3-line call to this, so a new section is a content
// folder + a tiny route file, with no bespoke navigation to maintain.
export function DocsSection(props: { kind: string; children: JSX.Element }) {
  return (
    <div class="mx-auto flex w-full max-w-360 px-6">
      <aside class="hidden w-60 shrink-0 border-subtle md:block md:border-r">
        <nav
          class="sticky top-14 max-h-[calc(100vh-3.5rem)] space-y-6 overflow-y-auto py-8 pr-4"
          aria-label={`${props.kind} pages`}
        >
          <SectionNav kind={props.kind} />
        </nav>
      </aside>
      <div class="min-w-0 flex-1 py-10 md:pl-8">{props.children}</div>
    </div>
  );
}
