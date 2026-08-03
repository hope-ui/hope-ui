/**
 * The **Popover** recipe contract — its variant vocabulary, slots, and the resulting `PopoverRecipe`
 * type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' Popover consumes it via `useRecipe("popover")` and each preset
 * implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 *
 * Popover is a **measured floating surface** — a card `createFloating` positions against a trigger or
 * anchor — so, unlike Dialog, *where it sits* is runtime geometry the kernel writes as an inline
 * `style`, never a recipe axis. What is left is the card's chrome and density: `size` and
 * `matchAnchorWidth`. It carries **no** color axis; role accents belong on whatever the consumer puts
 * inside it, and `role` (`dialog` vs `alertdialog`) changes ARIA rather than styling, so it stays a
 * component-layer prop threaded through context.
 *
 * `matchAnchorWidth` is the one axis that reads *from* the geometry, and it still is not positioning:
 * the kernel measures the anchor and publishes `--anchor-width`, and the recipe only decides whether
 * to spend it. That split keeps "where it sits" out of the recipe while leaving "how wide it is" a
 * themeable decision.
 *
 * Enter/exit is expressed on the preset's `data-entering:`/`data-exiting:` variants (→
 * `[data-presence="…"]`, the status the parts write to `data-presence`), and the *direction* of that
 * motion on `data-side-*`/`data-align-*` (→ the resolved post-`flip` side). Every color is a *finished*
 * `--hope-*` design token, never one the recipe computes ("recipe purity" — see `theming.md`).
 */
import type { SlotRecipeFn } from "../slot-recipe";

/**
 * The density scale — the card's max width and padding (and the rhythm between its title and
 * description). `md` is the default. Deliberately narrower than Dialog's `xs…full`: a popover is
 * anchored to a trigger, so a viewport-filling size would be a Dialog.
 */
export type PopoverSize = "sm" | "md" | "lg";

/** The Popover recipe's variant props — also the axes a preset may default app-wide. */
export interface PopoverRecipeVariants {
  /** Card width + padding scale. Default `md`. */
  size?: PopoverSize;
  /**
   * Pin the card to the anchor's measured width instead of letting it shrink-wrap its content.
   * Default `false`.
   *
   * A styling axis over a *measurement*: `createPopoverPositioner` publishes `--anchor-width` on every
   * popover regardless, and this variant is what spends it — so a preset is free to express it as a
   * floor (`min-width`) rather than an exact match, and a consumer wanting the other reaches for the
   * custom property directly.
   *
   * The card's `size` cap and this are mutually exclusive by construction (see the hope preset's
   * compound variants), so a matched card is never silently narrower than its anchor.
   */
  matchAnchorWidth?: boolean;
}

/**
 * The curated Popover props a preset may default app-wide via `ComponentOverride.defaultProps`.
 * Popover carries no non-variant chrome content (no status glyph like Alert's, no check icon like
 * Listbox's), so this is exactly the recipe variants — kept as its own name for contract uniformity
 * with the components that do add props.
 */
export interface PopoverThemeableProps extends PopoverRecipeVariants {}

/**
 * The Popover recipe's slots. `positioner` is the layer `createFloating` measures and moves — chrome
 * only (stacking and width), **never** `position`/`left`/`top`/`transform`, which would fight the
 * inline style the kernel writes. `content` is the card; `arrow` the small square pointing at the
 * anchor; `header` the optional column grouping the labelled text; `title`/`description` that text;
 * `closeTrigger` the corner dismiss button's placement, its chrome coming from `CloseButton`'s own
 * recipe merged under this.
 *
 * `header` is the only *structural* slot, for the same reason Dialog's is: on a card holding more than
 * a title and a description, the labelled text has to read as one block with its own tighter rhythm.
 * There is no `body`/`footer` twin — those drive Dialog's inside-scroll mechanics, and a popover is a
 * small anchored surface that never scrolls itself.
 *
 * **No `root` slot, and none for `trigger`/`anchor`** — by omission, not oversight. `Popover.Root`
 * renders no element at all, so a root class would have nothing to apply to, and
 * `Popover.Trigger`/`Popover.Anchor` render the *consumer's* element: a preset styling them would be
 * styling someone else's button. Both parts forward `class` untouched instead.
 */
export type PopoverSlot =
  | "positioner"
  | "content"
  | "arrow"
  | "header"
  | "title"
  | "description"
  | "closeTrigger";

/** The Popover recipe: variant props → one class function per slot. The registry entry for `popover`. */
export type PopoverRecipe = SlotRecipeFn<PopoverRecipeVariants, PopoverSlot>;
