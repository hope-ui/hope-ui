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
    <div class="mx-auto flex w-full max-w-7xl gap-8 px-6 py-8">
      <aside class="hidden w-56 shrink-0 md:block">
        <nav class="sticky top-6 space-y-5" aria-label={`${props.kind} pages`}>
          <For each={groupedNavFor(props.kind)}>
            {(group) => (
              <div>
                <Show when={group.group}>
                  {(name) => (
                    <p class="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {name()}
                    </p>
                  )}
                </Show>
                <ul class="space-y-0.5 text-sm">
                  <For each={group.items}>
                    {(item) => (
                      <li>
                        <PathLink
                          to={item.path}
                          class="block rounded px-2 py-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                          activeProps={{
                            class: "bg-gray-100 font-medium text-primary dark:bg-gray-800",
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
      <div class="min-w-0 flex-1">{props.children}</div>
    </div>
  );
}
