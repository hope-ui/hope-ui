import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import { PathLink } from "~/components/PathLink";
import { groupedNavFor } from "~/lib/content";

// Shared layout for a docs section (Get started, Components, Changelog, …): an
// auto-generated left sidebar — grouped by category when the section uses
// category subfolders (see lib/content.ts) — plus the routed page via <Outlet/>.
// Every section layout route is a 3-line call to this, so a new section is a
// content folder + a tiny route file, with no bespoke navigation to maintain.
export function DocsSection(props: { kind: string; children: JSX.Element }) {
  return (
    <div class="mx-auto flex w-full max-w-360 px-6">
      <aside class="hidden w-60 shrink-0 border-subtle md:block md:border-r">
        <nav
          class="sticky top-14 max-h-[calc(100vh-3.5rem)] space-y-6 overflow-y-auto py-8 pr-4"
          aria-label={`${props.kind} pages`}
        >
          <For each={groupedNavFor(props.kind)}>
            {(group) => (
              <div>
                <Show when={group.group}>
                  {(name) => (
                    <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                      {name()}
                    </p>
                  )}
                </Show>
                <ul class="space-y-0.5">
                  <For each={group.items}>
                    {(item) => (
                      <li>
                        <PathLink
                          to={item.path}
                          class="block rounded-md px-3 py-1.5 text-sm text-foreground-muted transition-colors hover:bg-surface-raised-hovered hover:text-foreground"
                          activeProps={{
                            class: "bg-primary/10 font-medium text-primary",
                          }}
                          activeOptions={{ exact: true }}
                        >
                          {item.title}
                        </PathLink>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </nav>
      </aside>
      <div class="min-w-0 flex-1 py-10 md:pl-8">{props.children}</div>
    </div>
  );
}
