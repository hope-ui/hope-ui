import {
  type CreatePopoverOptions,
  createPopover,
  type PopoverRole,
} from "@hope-ui/primitives/popover";
import type { PopoverSize, PopoverThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";
import { PopoverContext, type PopoverContextValue } from "./popover-context";

/**
 * `PopoverRootProps` = the primitive's `CreatePopoverOptions` (open state, the three dismissal
 * toggles, `role`, and the whole positioning surface) **plus** the themeable `size` axis
 * (`PopoverThemeableProps`, owned by `@hope-ui/theming`) **plus** the per-instance props below.
 * Extending `PopoverThemeableProps` keeps the recipe variants and this surface in lockstep by
 * construction.
 *
 * `Root` renders **no host element** — it resolves the recipe variants once and shares the slot class
 * fns on context, exactly as `Dialog.Root` does. Every styled part reads `ctx.slots.<slot>()` through
 * its own `class` getter. Two consequences, both deliberate:
 *
 * - **No `class` prop.** Popover has no `root` slot, so a root-only class would have nothing to apply
 *   to (the reason `Dialog.Root.class` was removed). Style the parts.
 * - **No `render` prop, and no native-attribute passthrough.** A part that renders no element of its
 *   own is the one exemption to the forwarding rule — so this is also the one Root in the catalog
 *   that dodges the hand-kept `omit` list `Calendar.Root`/`Listbox.Root` carry. Don't "fix" that by
 *   adding one.
 */
export interface PopoverRootProps extends CreatePopoverOptions, PopoverThemeableProps {
  /**
   * Per-instance class overrides, keyed by slot (`positioner`/`content`/`arrow`/`title`/
   * `description`/`closeTrigger`). Folded in after the recipe base and the preset's global
   * `slotClasses`. Set once here to reach every part. Use literal class strings so the consumer's
   * Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"popover">;
  children?: JSX.Element;
}

/**
 * The Popover root. Calls `createPopover` once for the shared state (open/role/ids, every element
 * ref, the positioning layer and the eagerly-created overlay presence), resolves the recipe variants
 * via `useDefaults` + `useSlots`, and puts the state and slot class fns on context (composition —
 * `ctx.state` + `ctx.slots`, not an extended state). Renders only the provider (no host element), so
 * the trigger's SSR hydration key is unaffected.
 *
 * **The visual positioning defaults land here, not in the primitive.** `createPopover` deliberately
 * applies none: a gap from the anchor, a viewport gutter and an arrow inset are *look-and-feel*, so
 * they belong where a preset's `defaultProps.popover` can reach them, while a headless consumer of
 * `@hope-ui/primitives/popover` keeps floating-ui's own zeroes.
 *
 * Because it reads a recipe, a `Popover.Root` **requires a `<ThemeProvider>`** ancestor (fed a
 * preset), like every other styled component.
 */
export const Root: Component<PopoverRootProps> = (props) => {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  // `sideOffset: 8` clears the arrow (`--popover-arrow-size` is `0.5rem`, half of which straddles the
  // card's edge); `collisionPadding: 8` keeps the card off the viewport edge; `arrowPadding: 8` keeps
  // the arrow inside the card's `rounded-lg` corners rather than pointing at the curve.
  const merged = useDefaults({
    recipe: "popover",
    props,
    defaults: {
      size: "md" as const,
      role: "dialog" as const,
      matchAnchorWidth: false,
      sideOffset: 8,
      collisionPadding: 8,
      arrowPadding: 8,
    },
  });

  const slots = useSlots({
    recipe: "popover",
    variantsProps: () => ({ size: merged.size, matchAnchorWidth: merged.matchAnchorWidth }),
    slotClasses: () => merged.slotClasses,
  });

  // `createPopover` reads only its own option keys off `merged` (open/role/closeOn*/side/align/…) —
  // the defaulted `size`, `matchAnchorWidth` and `slotClasses` ride along harmlessly. `matchAnchorWidth`
  // needs no primitive counterpart precisely because it is styling: the kernel measures the anchor and
  // publishes `--anchor-width` on the positioner unconditionally, and the recipe decides whether to
  // spend it. Pass `merged`, not raw `props`:
  // `useDefaults` exposes its defaults as getters over `props`, so `merged` stays just as lazy and
  // reactive (the controllable-state getters, and every positioning getter `createFloating` tracks,
  // stay live) while remaining the single source of truth.
  //
  // Composition, not inheritance: the context *holds* the primitive state as `state`. All a11y +
  // behavior lives there (the kernel); this component contributes only `slots`.
  const context: PopoverContextValue = {
    state: createPopover(merged),
    slots,
  };

  return <PopoverContext value={context}>{merged.children}</PopoverContext>;
};

// Re-export the recipe vocabulary + the ARIA role type so consumers can import them from the
// component's subpath (`PopoverRole` originates in the primitive, an a11y concern).
export type { PopoverRole, PopoverSize };
