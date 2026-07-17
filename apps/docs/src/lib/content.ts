/// <reference types="vite/client" />
import type { Component } from "solid-js";
import type { TocEntry } from "~/components/TableOfContents";

type DocModule = { default: Component; tableOfContents: TocEntry[] };

export type DocMeta = {
  section: string;
  slug: string;
  title: string;
  path: string;
  order: number;
  group?: string;
  groupOrder: number;
};

export type NavGroup = { group?: string; items: DocMeta[] };

// Single source of truth for every docs page: one MDX file per route, under
// content/<section>/<file>.mdx — with an OPTIONAL category subfolder:
// content/<section>/<group>/<file>.mdx. The route ($slug), the (grouped) sidebar,
// and the ToC all derive from this glob, so adding a page is just adding a file and
// recategorizing is moving one. Eager so the sidebar (built from each page's
// `tableOfContents`) is available on any route without an async boundary — fine for
// a prerendered docs site.
const modules = import.meta.glob<DocModule>("../content/**/*.mdx", { eager: true });

// "../content/components/20-overlays/dialog.mdx"
//   -> section "components", groupDir "20-overlays", file "dialog"
// "../content/get-started/01-installation.mdx"
//   -> section "get-started", no group, file "01-installation"
function parseKey(key: string): { section: string; groupDir?: string; file: string } | null {
  const match = key.match(/\/content\/(.+)\.mdx$/);
  if (!match) {
    return null;
  }
  const parts = match[1].split("/");
  return {
    section: parts[0],
    file: parts[parts.length - 1],
    // one optional grouping level between section and file
    groupDir: parts.length > 2 ? parts[1] : undefined,
  };
}

// An optional leading "NN-"/"NN_" sets ordering and is stripped from the display
// name/slug: 20-overlays -> order 20, "overlays"; 01-button -> order 1, "button".
function splitOrder(name: string): { order: number; rest: string } {
  const match = name.match(/^(\d+)[-_](.+)$/);
  return match
    ? { order: Number(match[1]), rest: match[2] }
    : { order: Number.POSITIVE_INFINITY, rest: name };
}

// Folder name -> sidebar label: "data-display" -> "Data display".
function humanize(name: string): string {
  const spaced = name.replace(/[-_]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Title = the page's H1 (first depth-1 heading in its ToC), falling back to the slug.
function titleOf(toc: TocEntry[], slug: string): string {
  return (toc.find((entry) => entry.depth === 1) ?? toc[0])?.value ?? slug;
}

// Sidebar grouping. Changelog auto-groups by the MAJOR version parsed from the
// slug (newest major first, e.g. `2.0.0-beta` -> "v2"), so releases just live flat
// in content/changelog/. Every other section groups by its optional
// `NN-<label>/` subfolder (ordered by the prefix), or is ungrouped.
function resolveGroup(
  section: string,
  groupDir: string | undefined,
  slug: string,
): { group?: string; groupOrder: number } {
  if (section === "changelog") {
    const major = Number.parseInt(slug, 10);
    return Number.isNaN(major)
      ? { group: undefined, groupOrder: Number.NEGATIVE_INFINITY } // unversioned (e.g. "unreleased") on top
      : { group: `v${major}`, groupOrder: -major };
  }
  if (groupDir) {
    const { order, rest } = splitOrder(groupDir);
    return { group: humanize(rest), groupOrder: order };
  }
  return { group: undefined, groupOrder: Number.POSITIVE_INFINITY };
}

const metaBySection = new Map<string, DocMeta[]>();
const moduleByPath = new Map<string, DocModule>();

for (const [key, mod] of Object.entries(modules)) {
  const parsed = parseKey(key);
  if (!parsed) {
    continue;
  }
  const { order, rest: slug } = splitOrder(parsed.file);
  const { group, groupOrder } = resolveGroup(parsed.section, parsed.groupDir, slug);
  const meta: DocMeta = {
    section: parsed.section,
    slug,
    order,
    group,
    groupOrder,
    title: titleOf(mod.tableOfContents ?? [], slug),
    path: `/${parsed.section}/${slug}`,
  };
  const list = metaBySection.get(parsed.section) ?? [];
  list.push(meta);
  metaBySection.set(parsed.section, list);
  moduleByPath.set(`${parsed.section}/${slug}`, mod);
}

// Per-section ordering: changelog newest-first (numeric-aware on the version slug);
// everything else by group, then explicit order prefix, then title.
for (const [section, list] of metaBySection) {
  list.sort((a, b) => {
    if (section === "changelog") {
      return b.slug.localeCompare(a.slug, undefined, { numeric: true });
    }
    return a.groupOrder - b.groupOrder || a.order - b.order || a.title.localeCompare(b.title);
  });
}

/** Ordered pages in a section (flat). */
export function navFor(section: string): DocMeta[] {
  return metaBySection.get(section) ?? [];
}

// Group a section's ordered pages into their sidebar categories (group order
// preserved). Ungrouped sections collapse to a single header-less group.
export function groupedNavFor(section: string): NavGroup[] {
  const byGroup = new Map<string, { order: number; items: DocMeta[] }>();
  for (const item of navFor(section)) {
    const key = item.group ?? "";
    const entry = byGroup.get(key) ?? { order: item.groupOrder, items: [] };
    entry.items.push(item);
    byGroup.set(key, entry);
  }
  return [...byGroup.values()]
    .sort((a, b) => a.order - b.order)
    .map((entry) => ({ group: entry.items[0].group, items: entry.items }));
}

/** The MDX module (component + ToC) for a given section/slug, or undefined. */
export function docFor(section: string, slug: string): DocModule | undefined {
  return moduleByPath.get(`${section}/${slug}`);
}
