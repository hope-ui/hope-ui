import { CloseButton } from "@hope-ui/components/close-button";
import type { JSX } from "@solidjs/web";

// Live demo for the "Adapts to the surface" section.
//
// CloseButton asserts no color of its own: the glyph inherits `currentColor` and its hover/press
// wash + focus ring derive from it, so one component reads correctly on any surface. Each cell sets
// its own background + text color; the same `<CloseButton />` picks that up with zero configuration.
// (The colored surface classes are plain divs — no inline <svg> — but this lives in .tsx to keep the
// stacked layout out of the MDX flow.)
function Cell(props: { class: string; label: string }): JSX.Element {
  return (
    <div class={`flex items-center justify-between gap-6 rounded-lg p-4 ${props.class}`}>
      <span class="text-sm font-medium">{props.label}</span>
      <CloseButton />
    </div>
  );
}

export function CloseButtonSurfacesDemo() {
  return (
    <div class="flex w-full max-w-md flex-col gap-3 not-prose">
      {/* Light surface: dark text -> a dark, low-alpha wash. */}
      <Cell class="bg-surface text-foreground border border-subtle" label="On a light surface" />
      {/* Soft-tinted surface: role-emphasis text -> a role-tinted wash. */}
      <Cell class="bg-primary-soft text-primary-emphasis" label="On a soft surface" />
      {/* Solid colored surface: on-color text -> a light wash. */}
      <Cell class="bg-primary text-on-primary" label="On a solid surface" />
      {/* Dark surface: light text -> a light, low-alpha wash. */}
      <Cell class="bg-surface-inverse text-on-inverse" label="On a dark surface" />
    </div>
  );
}
