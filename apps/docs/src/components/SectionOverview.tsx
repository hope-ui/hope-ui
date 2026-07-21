import { Alert } from "@hope-ui/components/alert";
import type { JSX } from "@solidjs/web";
import { children, For, Show } from "solid-js";
import { hasSectionVisuals, SectionVisual } from "~/components/component-visuals";
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
  // Resolve the callout JSX **once** into a stable memo. `props.callout` is a component-valued
  // prop, and the `<Show when={…}>` + `{…}` idiom reads it twice (the `when` gate, then the body).
  // Each raw read of the prop reconstructs the fragment, and the throwaway construction in the
  // `when` gate places its hydration keys (`_hk`) differently on the server vs the client — a
  // Hydration Mismatch. `children()` builds it a single time and hands both reads the same nodes.
  // See CLAUDE.md's `children()` decision procedure.
  const callout = children(() => props.callout);
  // The ToC lists only the named category groups (an ungrouped section — e.g.
  // Get started — produces no entries, so TableOfContents renders nothing).
  const tocEntries: TocEntry[] = groups
    .filter((g) => g.group)
    .map((g) => ({
      value: g.group as string,
      depth: 2,
      id: slugify(g.group as string),
    }));

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

          <Show when={callout()}>
            <Alert.Root
              variant="soft"
              colorScheme="primary"
              icon={<InfoIcon />}
              description={callout()}
              class="mt-6"
            />
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
                  <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <For each={group.items}>
                      {(item) => (
                        <li>
                          <PathLink
                            to={item.path}
                            class="group flex h-full flex-col overflow-hidden rounded-xl border border-subtle bg-surface-raised transition-all hover:border-primary/60 hover:shadow-sm"
                          >
                            {/* Illustrated sections (components, get-started) get a
                                primary-palette illustration atop the card; sections
                                without visuals (e.g. changelog) stay text-only. */}
                            <Show when={hasSectionVisuals(props.kind)}>
                              <SectionVisual section={props.kind} slug={item.slug} />
                            </Show>
                            <div class="flex flex-1 flex-col p-4">
                              <div class="flex items-center justify-between gap-2">
                                <span class="font-semibold text-foreground transition-colors group-hover:text-primary">
                                  {item.title}
                                </span>
                                <ChevronRightIcon class="size-4 shrink-0 text-foreground-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                              </div>
                              {/* Prefer the short one-line `summary` on the card; the full
                                  `description` stays on the doc page (fall back to it, then nothing). */}
                              <Show when={item.summary ?? item.description}>
                                {(d) => (
                                  <p class="mt-1 text-sm leading-snug text-foreground-muted">
                                    {d()}
                                  </p>
                                )}
                              </Show>
                            </div>
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
