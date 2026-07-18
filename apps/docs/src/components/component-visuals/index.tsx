/// <reference types="vite/client" />
import type { Component } from "solid-js";
import { VisualCanvas } from "./canvas";

// Registry + preview panel for the /components overview cards' component illustrations.
//
// One visual per component, one file per visual — `<slug>.visual.tsx`, default-exporting
// its illustration (see ./button.visual.tsx; shared frame in ./canvas.tsx). Files are
// auto-discovered by the glob below, mirroring how the docs content itself is loaded
// (lib/content.ts), so adding a component's visual is just dropping in a new file — no
// central list to edit here, which is what keeps this maintainable at 40+ components.
// Each illustration is a flat, geometric abstraction in hope-ui's *semantic* primary
// palette, inspired by (never copied from) the Chakra UI component overview.

// "./button.visual.tsx" -> slug "button". Eager so every visible card renders without an
// async boundary (fine for a prerendered site); `import: "default"` unwraps each file's
// default export to the component itself.
const modules = import.meta.glob<Component>("./*.visual.tsx", {
  eager: true,
  import: "default",
});

const componentVisuals: Record<string, Component> = {};
for (const [path, visual] of Object.entries(modules)) {
  const slug = path.match(/\/([^/]+)\.visual\.tsx$/)?.[1];
  if (slug) {
    componentVisuals[slug] = visual;
  }
}

// Generic placeholder for a component that has no bespoke visual yet: a stacked
// "content block" in primary tones. Keeps the grid uniform until a real one lands.
function FallbackVisual() {
  return (
    <VisualCanvas>
      <rect x="140" y="70" width="120" height="20" rx="6" class="fill-primary" />
      <rect x="140" y="100" width="120" height="14" rx="5" class="fill-primary-soft" />
      <rect x="140" y="122" width="78" height="14" rx="5" class="fill-primary-soft" />
    </VisualCanvas>
  );
}

// The preview panel rendered at the top of each /components overview card: a recessed
// surface holding the component's illustration, divided from the card's text below.
export function ComponentVisual(props: { slug: string }) {
  const Visual = componentVisuals[props.slug] ?? FallbackVisual;
  return (
    <div class="flex h-36 items-center justify-center overflow-hidden border-b border-subtle bg-surface-sunken transition-colors group-hover:bg-primary-soft/40">
      <Visual />
    </div>
  );
}
