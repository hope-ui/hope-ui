/**
 * The **Dialog** recipe contract — its variant vocabulary, slots, and the resulting `DialogRecipe`
 * type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `Dialog` consumes it via `useRecipe("dialog")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`../registry`) a flat list of named recipe types with no shape logic of its own.
 *
 * Dialog is a **compound overlay surface** — a portaled, positioned card over a scrim — so its axes
 * are the layout ones a consumer sets once on `Dialog.Root`: `size` (the width scale, plus the two
 * viewport-filling edge sizes), `placement` (centered vs. top-anchored), and `scrollBehavior` (where
 * overflow scrolls). It carries **no** color axis: v1 is a neutral container, and role accents live on
 * the footer's action `Button`, not the dialog chrome (see the design proposal, §resolved decisions).
 * `role` (`dialog` vs. `alertdialog`) is **not** a recipe variant — it changes ARIA, not styling, so
 * it is a component-layer prop lifted to `Dialog.Root` and threaded to the content hook via context.
 *
 * Enter/exit is expressed on the preset's `data-entering:`/`data-exiting:` custom variants (→
 * `[data-presence="…"]`, the status the parts write to `data-presence`), never on arbitrary
 * `data-[state=…]`; every color is a finished `--hope-*` token (recipe purity). See `theming.md`.
 */
import type { SlotRecipeFn } from "./slot-recipe";

/**
 * The surface width scale. `xs…xl` size the centered card; the two edge sizes fill the viewport and
 * ignore `placement`:
 * - `cover` — pseudo-fullscreen: fills the viewport minus a margin, **keeps** the radius + padding.
 * - `full` — true fullscreen: edge-to-edge, **no** radius/margin.
 */
export type DialogSize = "xs" | "sm" | "md" | "lg" | "xl" | "cover" | "full";

/** Where the (non-edge-size) content card sits in the viewport. */
export type DialogPlacement = "center" | "top";

/**
 * Where overflow scrolls. `inside` (the common case) caps the content height and scrolls the `body`
 * slot, keeping header/footer pinned; `outside` scrolls the whole content block within the viewport.
 */
export type DialogScrollBehavior = "inside" | "outside";

/** The Dialog recipe's variant props — also the layout axes a preset may default app-wide. */
export interface DialogRecipeVariants {
  /** Surface width scale (plus the `cover`/`full` viewport-filling edge sizes). Default `md`. */
  size?: DialogSize;
  /** Content placement in the viewport (ignored by `cover`/`full`). Default `center`. */
  placement?: DialogPlacement;
  /** Where overflow scrolls. Default `inside`. */
  scrollBehavior?: DialogScrollBehavior;
}

/**
 * The curated Dialog props a preset may default app-wide via `ComponentOverride.defaultProps`. Dialog
 * carries no non-variant chrome content (no status glyphs like Alert), so this is exactly the recipe
 * variants — a strict superset of {@link DialogRecipeVariants} by construction (`extends`), so it
 * registers in `ThemeablePropsRegistry` and `ThemeablePropsOf<"dialog">` widens nothing away.
 */
export interface DialogThemeableProps extends DialogRecipeVariants {}

/**
 * The Dialog recipe's slots. `backdrop`/`content` are the two portaled layers; `header`/`body`/
 * `footer` the structural regions; `title`/`description` the labelled text; `closeTrigger` the corner
 * dismiss button's placement (its chrome comes from `CloseButton`'s own recipe, merged under this).
 */
export type DialogSlot =
  | "backdrop"
  | "content"
  | "header"
  | "body"
  | "footer"
  | "title"
  | "description"
  | "closeTrigger";

/** The Dialog recipe: variant props → one class function per slot. The registry entry for `dialog`. */
export type DialogRecipe = SlotRecipeFn<DialogRecipeVariants, DialogSlot>;
