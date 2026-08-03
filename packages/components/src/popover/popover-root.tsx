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
 * `PopoverRootProps` = the behavior options of the `createPopover` hook (open state, the three
 * dismissal toggles, `role`, the whole positioning surface) **plus** the themeable `size` axis
 * **plus** the per-instance props below. Extending `PopoverThemeableProps` keeps the style recipe's
 * variants and this surface in lockstep by construction.
 *
 * `Root` renders **no host element**: it resolves the theme's `popover` recipe once and shares one
 * class function per named slot over context, which each styled part applies to itself. Two
 * deliberate consequences:
 *
 * - **No `class` prop.** Popover has no `root` slot, so a root class would have nothing to apply to.
 *   Style the parts.
 * - **No `render` prop, and no native-attribute passthrough.** A part rendering no element of its own
 *   is the single exemption to this repo's "every public part forwards its DOM props and takes
 *   `render`" rule. Don't "fix" it by adding one.
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
 * The Popover root. Calls `createPopover` once for the state every part shares (open/role/ids, each
 * element ref, the positioning layer, the mount/unmount animation state), resolves the theme recipe,
 * and publishes both on context. Renders only the context provider — no host element — so the
 * trigger's server/client hydration key is unaffected.
 *
 * **The visual positioning defaults land here, not in the primitive.** A gap from the anchor, a
 * viewport gutter and an arrow inset are look-and-feel, so they belong where a theme preset's
 * `defaultProps.popover` can override them; a headless consumer of `@hope-ui/primitives/popover`
 * keeps floating-ui's own zeroes.
 *
 * Reading a recipe means a `Popover.Root` **requires a `<ThemeProvider>`** ancestor fed a preset,
 * like every other styled component.
 */
export const Root: Component<PopoverRootProps> = (props) => {
  // `useDefaults` resolves each key with `??` across three layers: instance prop, then the preset's
  // per-component `defaultProps`, then the built-ins below.
  // `sideOffset: 8` clears the arrow (`--popover-arrow-size` is `0.5rem`, half of which straddles the
  // card's edge); `collisionPadding: 8` keeps the card off the viewport edge; `arrowPadding: 8` keeps
  // the arrow inside the card's rounded corners rather than pointing at the curve.
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

  // Pass `merged`, never raw `props`: `useDefaults` returns a *new object of getters* rather than a
  // copy, so `props.sideOffset` still reads `undefined` for a defaulted key while `merged.sideOffset`
  // reads `8`. Getters also keep everything lazy and reactive, which the positioning layer relies on.
  //
  // `createPopover` picks off only the option keys it knows (open/role/closeOn*/side/align/…); the
  // extra `size`/`matchAnchorWidth`/`slotClasses` ride along harmlessly. `matchAnchorWidth` needs no
  // primitive counterpart because it is pure styling: the primitive always measures the anchor and
  // publishes `--anchor-width` on the positioner, and the recipe decides whether to spend it.
  const context: PopoverContextValue = {
    state: createPopover(merged),
    slots,
  };

  return <PopoverContext value={context}>{merged.children}</PopoverContext>;
};

// Re-exported so a consumer never has to reach into `@hope-ui/theming` or `@hope-ui/primitives` for
// a type this component's own props use.
export type { PopoverRole, PopoverSize };
