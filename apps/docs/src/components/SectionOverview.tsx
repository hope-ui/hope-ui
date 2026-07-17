import { For, Show } from "solid-js";
import { PathLink } from "~/components/PathLink";
import { groupedNavFor } from "~/lib/content";

// A section's index page (/get-started, /components, /changelog): a heading plus
// the section's pages as links, grouped by category when the section uses one.
// Content-driven, so it never needs updating when pages are added or removed.
export function SectionOverview(props: { kind: string; title: string; description?: string }) {
  return (
    <div class="prose max-w-3xl dark:prose-invert">
      <h1>{props.title}</h1>
      <Show when={props.description}>{(description) => <p>{description()}</p>}</Show>
      <div class="not-prose mt-6 space-y-8">
        <For each={groupedNavFor(props.kind)}>
          {(group) => (
            <div>
              <Show when={group.group}>
                {(name) => (
                  <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {name()}
                  </h2>
                )}
              </Show>
              <ul class="space-y-2">
                <For each={group.items}>
                  {(item) => (
                    <li>
                      <PathLink
                        to={item.path}
                        class="block rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-900 transition-colors hover:border-primary hover:text-primary dark:border-gray-800 dark:text-gray-100"
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
      </div>
    </div>
  );
}
