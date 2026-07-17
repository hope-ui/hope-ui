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
      <aside class="hidden w-60 shrink-0 border-gray-200 md:block md:border-r dark:border-gray-800">
        <nav
          class="sticky top-14 max-h-[calc(100vh-3.5rem)] space-y-6 overflow-y-auto py-8 pr-4"
          aria-label={`${props.kind} pages`}
        >
          <For each={groupedNavFor(props.kind)}>
            {(group) => (
              <div>
                <Show when={group.group}>
                  {(name) => (
                    <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
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
                          class="block rounded-md px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                          activeProps={{
                            class: "bg-primary/10 font-medium text-primary dark:bg-primary/15",
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
