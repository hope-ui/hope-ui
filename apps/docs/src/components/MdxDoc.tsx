import { Dynamic } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import { ChevronLeftIcon, ChevronRightIcon } from "~/components/Icons";
import { PathLink } from "~/components/PathLink";
import { TableOfContents, type TocEntry } from "~/components/TableOfContents";
import { type DocMeta, siblingsFor } from "~/lib/content";

// Prev/next pager at the foot of a doc page. Each side is one card linking to the
// adjacent page in the section's reading order; a missing side (start/end of the
// section) renders an empty grid cell so the other stays on its edge.
function Pager(props: { prev?: DocMeta; next?: DocMeta }) {
  return (
    <Show when={props.prev || props.next}>
      <nav
        aria-label="Pagination"
        class="not-prose mt-12 grid grid-cols-2 gap-4 border-t border-subtle pt-6"
      >
        <Show when={props.prev} fallback={<span />}>
          {(prev) => (
            <PathLink
              to={prev().path}
              class="group flex flex-col items-start rounded-lg border border-subtle bg-surface-raised p-4 transition-colors hover:border-primary/60"
            >
              <span class="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Previous
              </span>
              <span class="mt-1 flex items-center gap-1.5 font-medium text-foreground group-hover:text-primary">
                <span class="shrink-0 text-foreground-subtle group-hover:text-primary">
                  <ChevronLeftIcon class="size-4" />
                </span>
                {prev().title}
              </span>
            </PathLink>
          )}
        </Show>
        <Show when={props.next} fallback={<span />}>
          {(next) => (
            <PathLink
              to={next().path}
              class="group flex flex-col items-end rounded-lg border border-subtle bg-surface-raised p-4 text-right transition-colors hover:border-primary/60"
            >
              <span class="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Next
              </span>
              <span class="mt-1 flex items-center gap-1.5 font-medium text-foreground group-hover:text-primary">
                {next().title}
                <span class="shrink-0 text-foreground-subtle group-hover:text-primary">
                  <ChevronRightIcon class="size-4" />
                </span>
              </span>
            </PathLink>
          )}
        </Show>
      </nav>
    </Show>
  );
}

// Renders one MDX page: the prose article, a prev/next pager, and the per-page
// "On this page" ToC. `max-w-none` lets the article fill the widened content column
// (the `prose` default caps it at ~65ch); `section`/`slug` drive the pager.
export function MdxDoc(props: {
  content: Component;
  toc: TocEntry[];
  section: string;
  slug: string;
}) {
  const siblings = () => siblingsFor(props.section, props.slug);
  return (
    <div class="flex gap-10">
      {/* The content column fills the space (keeping the ToC at the right edge), but the
          readable content is capped at an optimal reading measure (~75ch). */}
      <div class="min-w-0 flex-1">
        <div class="max-w-3xl mx-auto">
          <article class="prose max-w-none">
            <Dynamic component={props.content} />
          </article>
          <Pager prev={siblings().prev} next={siblings().next} />
        </div>
      </div>
      <TableOfContents entries={props.toc} class="hidden w-56 shrink-0 xl:block" />
    </div>
  );
}
