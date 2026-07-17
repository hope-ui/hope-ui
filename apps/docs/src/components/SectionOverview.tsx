import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import { ChevronRightIcon, InfoIcon } from "~/components/Icons";
import { PathLink } from "~/components/PathLink";
import { TableOfContents, type TocEntry } from "~/components/TableOfContents";
import { groupedNavFor } from "~/lib/content";

// "Layout & navigation" -> "layout-navigation"; used as the anchor id for each
// group section (and for the matching "On this page" entry).
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// A section's index page (/get-started, /components, /changelog): a hero banner,
// an optional intro + callout, and the section's pages as cards — grouped by
// category, with each group anchored so the "On this page" ToC can jump to it.
// Content-driven, so it never needs updating when pages are added or removed.
export function SectionOverview(props: {
  kind: string;
  title: string;
  description?: string;
  callout?: JSX.Element;
}) {
  const groups = groupedNavFor(props.kind);
  // The ToC lists only the named category groups (an ungrouped section — e.g.
  // Get started — produces no entries, so TableOfContents renders nothing).
  const tocEntries: TocEntry[] = groups
    .filter((g) => g.group)
    .map((g) => ({ value: g.group as string, depth: 2, id: slugify(g.group as string) }));

  return (
    <div class="flex gap-10">
      <div class="min-w-0 flex-1">
        {/* Main content capped at an optimal reading measure (~75ch), matching the doc pages. */}
        <div class="max-w-3xl">
          <div class="overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/10 via-gray-50 to-gray-50 px-8 py-12 dark:border-gray-800 dark:from-primary/20 dark:via-gray-900 dark:to-gray-950">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              {props.title}
            </h1>
            <Show when={props.description}>
              {(description) => (
                <p class="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  {description()}
                </p>
              )}
            </Show>
          </div>

          <Show when={props.callout}>
            {(callout) => (
              <div class="mt-6 flex gap-3 rounded-xl border border-gray-200 bg-gray-50/70 p-4 text-sm leading-relaxed text-gray-600 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
                {/* The icon is wrapped in a plain <span> so the FIRST child of this
                  hydration-keyed <Show> element is a host element, not a component —
                  a component there trips @solidjs/web's getNextSibling hydration walk
                  (see [[solid2-first-child-component-hydration]]). */}
                <span class="mt-0.5 shrink-0 text-primary">
                  <InfoIcon class="size-5" />
                </span>
                <div>{callout()}</div>
              </div>
            )}
          </Show>

          <div class="mt-10 space-y-10">
            <For each={groups}>
              {(group) => (
                <section id={group.group ? slugify(group.group) : undefined} class="scroll-mt-20">
                  <Show when={group.group}>
                    {(name) => (
                      <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {name()}
                      </h2>
                    )}
                  </Show>
                  <ul class="grid gap-4 sm:grid-cols-2">
                    <For each={group.items}>
                      {(item) => (
                        <li>
                          <PathLink
                            to={item.path}
                            class="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-primary/50 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary/60"
                          >
                            <div class="flex items-center justify-between gap-2">
                              <span class="font-semibold text-gray-900 transition-colors group-hover:text-primary dark:text-gray-100">
                                {item.title}
                              </span>
                              <ChevronRightIcon class="size-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary dark:text-gray-600" />
                            </div>
                            <Show when={item.description}>
                              {(d) => (
                                <p class="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                  {d()}
                                </p>
                              )}
                            </Show>
                          </PathLink>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
              )}
            </For>
          </div>
        </div>
      </div>

      <TableOfContents entries={tocEntries} class="hidden w-56 shrink-0 xl:block" />
    </div>
  );
}
