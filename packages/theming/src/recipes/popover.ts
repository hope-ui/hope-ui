/**
 * The **Popover** recipe contract — its variant vocabulary, slots, and the resulting `PopoverRecipe`
 * type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `Popover` consumes it via `useRecipe("popover")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`../recipe-registry`) a flat list of named recipe types with no shape logic of
 * its own.
 *
 * Popover is a **measured floating surface** — a card `createFloating` positions against a trigger or
 * an anchor — so, unlike Dialog, *where it sits* is runtime geometry the kernel writes as an inline
 * `style`, never a recipe axis. What is left for the recipe is the card's chrome and its density, so
 * the axes are `size` and `matchAnchorWidth`. It carries **no** color axis: v1 is a neutral overlay,
 * and role accents belong on whatever the consumer puts inside it.
 *
 * `matchAnchorWidth` is the one axis that reads *from* the geometry rather than ignoring it, and it
 * still isn't positioning: the kernel measures the anchor and publishes `--anchor-width` on the
 * positioner, and the recipe decides whether to spend it. That split is what keeps "where it sits"
 * out of the recipe while letting "how wide it is" stay a themeable decision.
 *
 * `role` (`dialog` vs. `alertdialog`) is **not** a recipe variant — it changes ARIA, not styling, so
 * it is a component-layer prop on `Popover.Root` threaded to the content hook through context. The
 * same argument the Dialog contract makes for its own `role`.
 *
 * Enter/exit is expressed on the preset's `data-entering:`/`data-exiting:` custom variants (→
 * `[data-presence="…"]`, the status the positioner and content write to `data-presence`), and the
 * *direction* of that motion on the `data-side-*`/`data-align-*` variants (→ `[data-side="…"]`, the
 * resolved post-`flip` side the positioner, content and arrow all report). Every color is a finished
 * `--hope-*` token (recipe purity). See `theming.md`.
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
   * A styling axis over a *measurement*: `createPopoverPositioner` publishes `--anchor-width` on
   * every popover regardless, and this variant is what spends it. So a preset is free to express it
   * as a floor (`min-width`) rather than an exact match, and a consumer who wants the other one
   * reaches for the custom property directly.
   *
   * The card's `size` cap and this are mutually exclusive by construction — see the hope preset's
   * compound variants — so a matched card is never silently narrower than its anchor.
   */
  matchAnchorWidth?: boolean;
}

/**
 * The curated Popover props a preset may default app-wide via `ComponentOverride.defaultProps`.
 * Popover carries no non-variant chrome content (no status glyph like Alert, no check icon like
 * Listbox), so this is exactly the recipe variants — a strict superset of
 * {@link PopoverRecipeVariants} by construction (`extends`), so it registers in
 * `ThemeablePropsRegistry` and `ThemeablePropsOf<"popover">` widens nothing away.
 */
export interface PopoverThemeableProps extends PopoverRecipeVariants {}

/**
 * The Popover recipe's slots. `positioner` is the layer `createFloating` measures and moves (chrome
 * only — stacking and width; **never** `position`/`left`/`top`/`transform`, which would fight the
 * inline style the kernel writes — where "width" means shrink-wrapping the card or matching the
 * anchor, both of which the kernel measures *around* rather than dictating); `content` is the card
 * itself; `arrow` the little square that points
 * at the anchor; `header` the optional column grouping the labelled text; `title`/`description` that
 * text; `closeTrigger` the corner dismiss button's placement (its chrome comes from `CloseButton`'s
 * own recipe, merged under this).
 *
 * `header` is the only *structural* slot, and it earns one for the same reason Dialog's does: on a card
 * that holds more than a title and a description — a form, a list, an action row — the labelled text
 * needs to read as one block with its own tighter rhythm, against the region gap `content` sets. There
 * is no `body`/`footer` twin: those exist on Dialog to drive its inside-scroll mechanics, and a popover
 * is a small anchored surface that never scrolls itself.
 *
 * **No `root` slot, and none for `trigger`/`anchor`** — by omission, not oversight. `Popover.Root`
 * renders no element at all (so it accepts no `class`, the reason `Dialog.Root`'s was removed), and
 * `Popover.Trigger`/`Popover.Anchor` render the *consumer's* element: a preset that styled them would
 * be styling someone else's button. Both parts forward `class` untouched instead, the shape
 * `dialog-trigger.tsx` already ships.
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
