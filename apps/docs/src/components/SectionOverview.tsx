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
        <div class="max-w-3xl mx-auto">
          {/* Decorative hero gradient — the one deliberate exception to the semantic-token
              rule. This is a hand-tuned multi-stop gradient (primary tint fading into the
              neutral surface) whose exact per-mode stops are kept as literal palette
              utilities + `dark:` variants; the semantic surface tokens can't reproduce the
              specific light/dark stop ramp. Everything else in the docs uses semantic tokens. */}
          <div class="overflow-hidden rounded-2xl border border-mauve-200 bg-linear-to-br from-primary/10 via-mauve-50 to-mauve-50 px-8 py-12 dark:border-mauve-800 dark:from-primary/20 dark:via-mauve-900 dark:to-mauve-950">
            <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {props.title}
            </h1>
            <Show when={props.description}>
              {(description) => (
                <p class="mt-3 max-w-2xl text-base leading-relaxed text-foreground-muted">
                  {description()}
                </p>
              )}
            </Show>
          </div>

          <Show when={props.callout}>
            {(callout) => (
              <div class="mt-6 flex gap-3 rounded-xl border border-subtle bg-surface-sunken/70 p-4 text-sm leading-relaxed text-foreground-muted">
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
                      <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
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
                            class="group flex h-full flex-col rounded-xl border border-subtle bg-surface-raised p-5 transition-all hover:border-primary/60 hover:shadow-sm"
                          >
                            <div class="flex items-center justify-between gap-2">
                              <span class="font-semibold text-foreground transition-colors group-hover:text-primary">
                                {item.title}
                              </span>
                              <ChevronRightIcon class="size-4 shrink-0 text-foreground-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                            </div>
                            <Show when={item.description}>
                              {(d) => (
                                <p class="mt-1.5 text-sm leading-relaxed text-foreground-muted">
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
