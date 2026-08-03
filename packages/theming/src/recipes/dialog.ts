/**
 * The **Dialog** recipe contract — its variant vocabulary, slots, and the resulting `DialogRecipe`
 * type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' Dialog consumes it via `useRecipe("dialog")` and each preset
 * implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 *
 * Dialog is a **compound overlay surface** — a portaled, positioned card over a scrim — so its axes
 * are the layout ones a consumer sets once on `Dialog.Root`: `size`, `placement` and `scrollBehavior`.
 * It carries **no** color axis: a dialog is a neutral container, and role accents live on the footer's
 * action `Button`, not the chrome. `role` (`dialog` vs `alertdialog`) is **not** a recipe variant
 * either — it changes ARIA, not styling, so it is a component-layer prop threaded through context.
 *
 * Enter/exit is expressed on the preset's `data-entering:`/`data-exiting:` variants (→
 * `[data-presence="…"]`, the status the parts write to `data-presence`), never an arbitrary
 * `data-[state=…]`. Every color is a *finished* `--hope-*` design token, never one the recipe computes
 * ("recipe purity" — see `theming.md`).
 */
import type { SlotRecipeFn } from "../slot-recipe";

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
 * carries no non-variant chrome content (no status glyphs like Alert's), so this is exactly the recipe
 * variants — kept as its own name for contract uniformity with the components that do add props.
 */
export interface DialogThemeableProps extends DialogRecipeVariants {}

/**
 * The Dialog recipe's slots. `backdrop`/`positioner` are the two portaled layers (the scrim, and the
 * fixed full-viewport flex frame that positions and scrolls the card); `content` is the card itself;
 * `header`/`body`/`footer` the structural regions; `title`/`description` the labelled text;
 * `closeTrigger` the corner dismiss button's placement (its chrome comes from `CloseButton`'s own
 * recipe, merged under this).
 */
export type DialogSlot =
  | "backdrop"
  | "positioner"
  | "content"
  | "header"
  | "body"
  | "footer"
  | "title"
  | "description"
  | "closeTrigger";

/** The Dialog recipe: variant props → one class function per slot. The registry entry for `dialog`. */
export type DialogRecipe = SlotRecipeFn<DialogRecipeVariants, DialogSlot>;
