import { Button } from "@hope-ui/components/button";
import type { JSX } from "@solidjs/web";

// Live demo for the "On a tinted surface" section, and the counterpart to
// `demos/close-button/CloseButtonSurfacesDemo`.
//
// Each row sets its own background AND text color; the `adaptive` button inherits that text color
// and mixes its hover/press wash from it, so it needs no configuration. The `ghost` button beside it
// picks a fixed shade per role — on the soft row that shade is the row's own background, which is
// why hovering it looks like nothing happened. Mirrors the component's `Adaptive` story.
function Row(props: { class: string; label: string }): JSX.Element {
  return (
    <div class={`flex items-center justify-between gap-6 rounded-lg p-4 ${props.class}`}>
      <span class="text-sm font-medium">{props.label}</span>
      <div class="flex items-center gap-2">
        <Button variant="ghost" colorScheme="success" size="sm">
          ghost
        </Button>
        <Button variant="adaptive" size="sm">
          adaptive
        </Button>
      </div>
    </div>
  );
}

export function ButtonAdaptiveDemo() {
  return (
    <div class="flex w-full flex-col gap-3 not-prose">
      {/*
        Each row is labelled by its semantic surface, not by how it looks: `bg-surface` is white in
        the light theme and near-black in the dark one.
      */}
      {/* Page surface: nothing role-colored to inherit, so `ghost` is the one carrying the role. */}
      <Row class="border border-subtle bg-surface text-foreground" label="On the page surface" />
      {/* Soft-tinted: `success-ghost-hovered` IS `bg-success-soft`, so ghost's wash is invisible here. */}
      <Row class="bg-success-soft text-success-emphasis" label="On a soft surface" />
      {/* Solid colored: the inherited `text-on-success` gives adaptive a light wash. */}
      <Row class="bg-success text-on-success" label="On a solid surface" />
      <Row class="bg-surface-inverse text-on-inverse" label="On the inverse surface" />
    </div>
  );
}
