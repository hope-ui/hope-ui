import {
  type CreateDialogOptions,
  createDialog,
  type DialogRole,
} from "@hope-ui/primitives/dialog";
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

/**
 * The behavior options of the underlying `createDialog` hook (open/modal/dismissal) **plus** the
 * themeable layout axes (`size`/`placement`/`scrollBehavior`, owned by `@hope-ui/theming`) **plus**
 * the per-instance props below. Extending `DialogThemeableProps` rather than re-declaring the
 * variants keeps the styling recipe and this surface in lockstep by construction.
 */
export interface DialogRootProps extends CreateDialogOptions, DialogThemeableProps {
  /** ARIA role. `alertdialog` for a destructive confirmation. Default `dialog`. */
  role?: DialogRole;
  /**
   * Per-instance class overrides, keyed by slot (`backdrop`/`content`/`header`/`body`/`footer`/
   * `title`/`description`/`closeTrigger`) — set once here to reach every part. Write them as literal
   * class strings, or the consumer's Tailwind scanner will not see them.
   */
  slotClasses?: SlotClasses<"dialog">;
  children?: JSX.Element;
}

/**
 * The Dialog root. It renders **no element of its own** — only a context provider — so adding or
 * removing it never shifts where the trigger lands in the server HTML.
 *
 * Because it reads a styling recipe, `Dialog.Root` requires a `<ThemeProvider>` ancestor fed a
 * preset, like every other styled component here.
 */
export const Root: Component<DialogRootProps> = (props) => {
  // Precedence: instance prop ?? the preset's per-component `defaultProps` ?? the builtins below,
  // each key resolved with `??`.
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
    variantsProps: () => ({
      size: merged.size,
      placement: merged.placement,
      scrollBehavior: merged.scrollBehavior,
    }),
    slotClasses: () => merged.slotClasses,
  });

  // `merged`, never the raw `props`: `useDefaults` returns a *new object of getters*, it does not
  // copy anything back, so `props.size` still reads `undefined` for every defaulted key. Reading the
  // merged object keeps the defaults while staying just as lazy and reactive.
  //
  // The context *holds* this state rather than extending it. All behavior and accessibility —
  // open/modal/role, the ids, the shared enter/exit state — belongs to the headless hook; this
  // component contributes only the resolved `slots`.
  const context: DialogContextValue = {
    state: createDialog(merged),
    slots,
  };

  return <DialogContext value={context}>{merged.children}</DialogContext>;
};

// Re-exported so consumers get the whole vocabulary from the component's own subpath, without
// importing `@hope-ui/theming` or the primitive directly.
export type { DialogPlacement, DialogRole, DialogScrollBehavior, DialogSize };
