import type { JSX } from "@solidjs/web";

// A centered showcase panel for live component demos in the docs. Its children
// (real hope-ui components) render on a subtle canvas, centered on both axes.
//
// When a fenced code block immediately follows a `<Preview>` in the MDX flow, the
// two fuse into ONE card — the preview's bottom corners square off and the code
// figure's top border/radius/margin drop, leaving a single divider between the
// live demo and its source (see the `.doc-preview` sibling rules in app.css).
// Standalone (no following code block) the preview stays a fully rounded card.
export function Preview(props: { children: JSX.Element; class?: string }) {
  return (
    <div
      class={[
        "doc-preview not-prose my-6 flex min-h-40 flex-wrap items-center justify-center gap-4 rounded-lg border border-subtle bg-surface-raised p-8",
        props.class,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {props.children}
    </div>
  );
}
