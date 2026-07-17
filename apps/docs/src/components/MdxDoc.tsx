import { Dynamic } from "@solidjs/web";
import type { Component } from "solid-js";
import { TableOfContents, type TocEntry } from "~/components/TableOfContents";

// Renders one MDX page: the prose article plus its per-page "On this page" ToC.
// Shared by every section's $slug route, so a content page is purely the .mdx file.
export function MdxDoc(props: { content: Component; toc: TocEntry[] }) {
  return (
    <div class="flex gap-10">
      <article class="prose min-w-0 flex-1 dark:prose-invert">
        <Dynamic component={props.content} />
      </article>
      <TableOfContents entries={props.toc} class="hidden w-56 shrink-0 xl:block" />
    </div>
  );
}
