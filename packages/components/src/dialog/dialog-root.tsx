import { type CreateDialogOptions, createDialog } from "@hope-ui/primitives/dialog";
import type {
  DialogPlacement,
  DialogScrollBehavior,
  DialogSize,
  SlotClasses,
} from "@hope-ui/theming";
import { type DialogThemeableProps, useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Component } from "solid-js";
import { DialogContext, type DialogContextValue } from "./dialog-context";

/** The ARIA role of the dialog. `alertdialog` is the APG destructive-confirmation pattern. */
export type DialogRole = "dialog" | "alertdialog";

/**
 * `DialogRootProps` = the primitive's `CreateDialogOptions` (open/modal/dismissal behavior) **plus**
 * the themeable layout axes (`DialogThemeableProps`: `size`/`placement`/`scrollBehavior`, owned by
 * `@hope-ui/theming`) **plus** the per-instance props below. Extending `DialogThemeableProps` keeps
 * the recipe variants and this surface in lockstep by construction.
 *
 * `Root` renders **no host element** — it resolves the recipe variants once and shares the slot class
 * fns (and `role`) on context, exactly as `Alert.Root` distributes its `slots`. Every styled part
 * reads `ctx.slots.<slot>()` through its own `class` getter.
 */
export interface DialogRootProps extends CreateDialogOptions, DialogThemeableProps {
  /** ARIA role. `alertdialog` for a destructive confirmation. Default `dialog`. Threaded to `Content`. */
  role?: DialogRole;
  /**
   * Per-instance class overrides, keyed by slot (`backdrop`/`content`/`header`/`body`/`footer`/
   * `title`/`description`/`closeTrigger`). Folded in after the recipe base and the preset's global
   * `slotClasses`. Set once here to reach every part. Use literal class strings so the consumer's
   * Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"dialog">;
  /** Forwarded to `useSlots`. Dialog has no `root` slot, so per-part styling goes through `slotClasses`. */
  class?: string;
  children?: JSX.Element;
}

/**
 * The Dialog root. Calls `createDialog` once for the shared state (open/modal/ids/spared registry),
 * resolves the recipe variants via `useDefaults` + `useSlots`, and puts both — state, slot class fns,
 * and `role` — on context. Renders only the provider (no host element), so the trigger's SSR
 * hydration key is unaffected.
 *
 * Because it reads a recipe, a `Dialog.Root` now **requires a `<ThemeProvider>`** ancestor (fed a
 * preset), like every other styled component.
 */
export const Root: Component<DialogRootProps> = (props) => {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  const merged = useDefaults({
    recipe: "dialog",
    props,
    defaults: {
      size: "md" as const,
      placement: "center" as const,
      scrollBehavior: "inside" as const,
      role: "dialog" as const,
    },
  });

  const slots = useSlots({
    recipe: "dialog",
    variantsProps: (): {
      size: DialogSize;
      placement: DialogPlacement;
      scrollBehavior: DialogScrollBehavior;
    } => ({
      size: merged.size,
      placement: merged.placement,
      scrollBehavior: merged.scrollBehavior,
    }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

  // `createDialog` reads only its own option keys off `props` (open/defaultOpen/onOpenChange/modal/
  // closeOn*) — the layout axes ride along harmlessly. Pass the raw `props` (not `merged`) so the
  // controllable-state getters stay live.
  const context: DialogContextValue = {
    ...createDialog(props),
    slots,
    role: () => merged.role,
  };

  return <DialogContext value={context}>{props.children}</DialogContext>;
};

// Re-export the recipe vocabulary so consumers can import it from the component's subpath.
export type { DialogPlacement, DialogScrollBehavior, DialogSize };
