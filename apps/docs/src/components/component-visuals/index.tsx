/// <reference types="vite/client" />
import type { Component } from "solid-js";
import { VisualCanvas } from "./canvas";

// Registry + preview panel for the section overview cards' illustrations (/components,
// /get-started). Each section that wants illustrated cards gets a subfolder here, and
// each page a `<slug>.visual.tsx` inside it, default-exporting its illustration:
//
//   component-visuals/<section>/<slug>.visual.tsx
//   e.g. components/button.visual.tsx, get-started/installation.visual.tsx
//
// Files are auto-discovered by the glob below, keyed by `<section>/<slug>` (mirroring
// how the docs content itself is loaded in lib/content.ts), so adding an illustration
// is just dropping in a file — no central list to edit, which keeps this maintainable
// at 40+ pages. The shared frame lives in ./canvas.tsx. Each illustration is a flat,
// geometric abstraction in hope-ui's *semantic* primary palette, inspired by (never
// copied from) the Chakra UI component overview.

// "./components/button.visual.tsx" -> key "components/button". Eager so every visible
// card renders without an async boundary (fine for a prerendered site); `import:
// "default"` unwraps each file's default export to the component itself.
const modules = import.meta.glob<Component>("./*/*.visual.tsx", {
  eager: true,
  import: "default",
});

const sectionVisuals: Record<string, Component> = {};
const sectionsWithVisuals = new Set<string>();
for (const [path, visual] of Object.entries(modules)) {
  const match = path.match(/\.\/([^/]+)\/([^/]+)\.visual\.tsx$/);
  if (match) {
    const [, section, slug] = match;
    sectionVisuals[`${section}/${slug}`] = visual;
    sectionsWithVisuals.add(section);
  }
}

/** Whether a section has any illustrated cards (drives whether the card shows a visual panel). */
export function hasSectionVisuals(section: string): boolean {
  return sectionsWithVisuals.has(section);
}

// Generic placeholder for a page in an illustrated section that has no bespoke visual
// yet: a stacked "content block" in primary tones. Keeps the grid uniform until a real
// one lands.
function FallbackVisual() {
  return (
    <VisualCanvas>
      <rect x="140" y="70" width="120" height="20" rx="6" class="fill-primary" />
      <rect x="140" y="100" width="120" height="14" rx="5" class="fill-primary-soft" />
      <rect x="140" y="122" width="78" height="14" rx="5" class="fill-primary-soft" />
    </VisualCanvas>
  );
}

// The preview panel rendered at the top of each overview card: a recessed surface
// holding the page's illustration, divided from the card's text below.
export function SectionVisual(props: { section: string; slug: string }) {
  const Visual = sectionVisuals[`${props.section}/${props.slug}`] ?? FallbackVisual;
  return (
    <div class="flex h-24 items-center justify-center overflow-hidden border-b border-subtle bg-surface-sunken transition-colors group-hover:bg-primary-soft/40">
      <Visual />
    </div>
  );
}
