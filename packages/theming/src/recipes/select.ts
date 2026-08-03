/**
 * The **Select** recipe contract — its variant vocabulary, slots, and the resulting `SelectRecipe`
 * type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' Select consumes it via `useRecipe("select")` and each preset
 * implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 *
 * Select is **two surfaces in one recipe**: a form control (the trigger, showing the current value and
 * a chevron) and a measured floating popup (the card holding the option list). It carries **no** color
 * axis — a neutral control over a neutral overlay, whose only accents are the transient highlight
 * (`active`/`on-active`) and the chosen row (`selected`/`on-selected`), neither a variant. Its single
 * axis is `size`, reaching the trigger *and* the popup together: the two have to agree, or a `lg`
 * control opens an `md` list.
 *
 * ## What is deliberately not a variant
 *
 * - **Where the popup sits** — runtime geometry `createFloating` writes as an inline `style`, exactly
 *   as on Popover. `data-side`/`data-align` are the styling hooks for it.
 * - **How wide the popup is** — it matches the trigger, always, via the `--anchor-width` the
 *   positioner publishes. That is what a Select *is*; making it an axis would invite the
 *   base-width-beaten-by-a-variant-width override the Popover contract warns about, in exchange for an
 *   option nobody picking a Select wants. A consumer needing a wider popup overrides the `positioner`
 *   slot.
 * - **`selectionMode` and `modal`** — they change ARIA and behavior, not styling, so they stay
 *   component-layer props on `Select.Root`. Same argument Listbox's contract makes.
 *
 * The empty state is **`data-placeholder:` on the `value` slot**, not a slot of its own: nothing extra
 * is rendered when the selection is empty, only styled differently, and `createComboboxValue` already
 * writes the attribute. Every color is a *finished* `--hope-*` design token, never one the recipe
 * computes ("recipe purity" — see `theming.md`).
 */
import type { JSX } from "@solidjs/web";
import type { SlotRecipeFn } from "../slot-recipe";

/**
 * The density scale. `sm`/`md`/`lg` scale the trigger's height, text and padding **and** the popup's
 * row density together; `md` is the default and matches the recipe's base metrics.
 */
export type SelectSize = "sm" | "md" | "lg";

/** The Select recipe's variant props — also the density axis a preset may default app-wide. */
export interface SelectRecipeVariants {
  /** Control + row density scale. Default `md`. */
  size?: SelectSize;
}

/**
 * The curated Select props a preset may default app-wide via `ComponentOverride.defaultProps`: the
 * recipe variants **plus** the two chrome glyphs.
 *
 * Both are **flat, discrete keys**, never a nested `icons` map, because `mergeComponentOverrides`
 * merges `defaultProps` shallowly per key — a nested map would drop a partial override. Each is a
 * **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one object shared by
 * every instance, and a Solid `JSX.Element` is an already-built DOM node that would *move* if reused.
 * Called per instance through `runIfFunction`.
 *
 * Select is a multi-part component, so its themeable surface stays on the **root**: `Select.Root`
 * resolves both and flows them to `Select.Icon` and `Select.ItemIndicator` through context, where they
 * are the default children. The per-instance override is each part's own `children`.
 */
export interface SelectThemeableProps extends SelectRecipeVariants {
  /** App-wide default trigger chevron, as a factory. Falls back to hope's built-in chevron-down. */
  chevronIcon?: () => JSX.Element;
  /** App-wide default selection-check glyph, as a factory. Falls back to hope's built-in check. */
  checkIcon?: () => JSX.Element;
}

/**
 * The Select recipe's slots — the control, then the popup, then the rows.
 *
 * `trigger` is the `role="combobox"` button; `value` the current selection's text inside it (styled
 * empty through `data-placeholder:`, hence no `placeholder` slot); `icon` the chevron's box.
 * `positioner` is the layer `createFloating` measures and moves — chrome only, never
 * `position`/`left`/`top`, which would fight the inline style the kernel writes; `content` the card;
 * `list` the `role="listbox"` scroll container. Then `group`/`groupLabel`/`separator` and
 * `item`/`itemText`/`itemIndicator`, matching Listbox's row vocabulary so the two read the same.
 *
 * **No `root` or `portal` slot** — neither part renders an element, so a class would have nothing to
 * apply to. `content` and `list` stay distinct because `role="listbox"` may only contain options and
 * groups: Combobox's `empty`/`status` have to live in the card beside the list, not inside it.
 */
export type SelectSlot =
  | "trigger"
  | "value"
  | "icon"
  | "positioner"
  | "content"
  | "list"
  | "group"
  | "groupLabel"
  | "separator"
  | "item"
  | "itemText"
  | "itemIndicator";

/** The Select recipe: variant props → one class function per slot. The registry entry for `select`. */
export type SelectRecipe = SlotRecipeFn<SelectRecipeVariants, SelectSlot>;
