/**
 * The **Combobox** recipe contract — its variant vocabulary, slots, and the resulting
 * `ComboboxRecipe` type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' Combobox consumes it via `useRecipe("combobox")` and each preset
 * implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 *
 * Combobox is Select's sibling over the same kernel, so it is the same **two surfaces in one recipe**:
 * a form control (here a text field, not a button) and a measured floating popup. It carries **no**
 * color axis for the same reason Select does not — a neutral control over a neutral overlay, whose
 * only accents are the transient highlight (`active`/`on-active`) and the chosen row
 * (`selected`/`on-selected`), neither a variant. Its single axis is `size`, reaching the control *and*
 * the popup together, or a `lg` field opens an `md` list.
 *
 * ## Where it diverges from Select, and why
 *
 * On Select the focusable element **is** the box: one `trigger` slot is both the bordered shell and
 * the `role="combobox"` button, so `focus-visible:` on it is the focus ring. On Combobox the focusable
 * element is the `<input>` *inside* the box, so the two split:
 *
 * - **`control`** is the bordered shell — a non-interactive `<div>` holding the input, the clear
 *   button and the chevron trigger. It inherits Select's trigger chrome, but draws its focus ring with
 *   `focus-within:`, since the element that takes DOM focus is a descendant.
 * - **`trigger`** shrinks to the chevron's hit area: a `tabindex="-1"` button with no chrome of its
 *   own, because the control already draws the border, background and ring.
 * - **`clear`** has no Select counterpart at all — a Select always holds a value once chosen, while a
 *   Combobox's text is erasable, so the reset affordance is part of the control.
 *
 * ## What is deliberately not a variant
 *
 * - **Where the popup sits** — runtime geometry `createFloating` writes as an inline `style`, exactly
 *   as on Popover and Select. `data-side`/`data-align` are the styling hooks for it.
 * - **How wide the popup is** — it matches the control, always, via the `--anchor-width` the
 *   positioner publishes. Making it an axis would invite the base-width-beaten-by-a-variant-width
 *   override the Popover contract warns about; a consumer needing a wider popup overrides the
 *   `positioner` slot.
 * - **`selectionMode`, `modal`, and everything about filtering** — they change ARIA and behavior, not
 *   styling, so they stay component-layer props on `Combobox.Root`.
 *
 * The empty *input* is `placeholder:` on the `input` slot — a native pseudo-element, so it needs no
 * slot and no `data-*`, which is where Combobox differs from Select's real `value` element carrying
 * `data-placeholder`. The empty *collection* is a different thing and does get a slot: `empty` renders
 * text that exists only when the filter matches nothing.
 *
 * Every color is a *finished* `--hope-*` design token, never one the recipe computes ("recipe purity"
 * — see `theming.md`).
 */
import type { JSX } from "@solidjs/web";
import type { SlotRecipeFn } from "../slot-recipe";

/**
 * The density scale. `sm`/`md`/`lg` scale the control's height, text and padding **and** the popup's
 * row density together; `md` is the default and matches the recipe's base metrics.
 */
export type ComboboxSize = "sm" | "md" | "lg";

/** The Combobox recipe's variant props — also the density axis a preset may default app-wide. */
export interface ComboboxRecipeVariants {
  /** Control + row density scale. Default `md`. */
  size?: ComboboxSize;
}

/**
 * The curated Combobox props a preset may default app-wide via `ComponentOverride.defaultProps`: the
 * recipe variants **plus** the three chrome glyphs.
 *
 * All three are **flat, discrete keys**, never a nested `icons` map, because `mergeComponentOverrides`
 * merges `defaultProps` shallowly per key — a nested map would drop a partial override. Each is a
 * **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one object shared by
 * every instance, and a Solid `JSX.Element` is an already-built DOM node that would *move* if reused.
 * Called per instance through `runIfFunction`.
 *
 * Combobox is a multi-part component, so its themeable surface stays on the **root**: `Combobox.Root`
 * resolves all three and flows them to `Combobox.Icon`, `Combobox.ItemIndicator` and `Combobox.Clear`
 * through context, where they are the default children. The per-instance override is each part's own
 * `children`.
 */
export interface ComboboxThemeableProps extends ComboboxRecipeVariants {
  /** App-wide default trigger chevron, as a factory. Falls back to hope's built-in chevron-down. */
  chevronIcon?: () => JSX.Element;
  /** App-wide default selection-check glyph, as a factory. Falls back to hope's built-in check. */
  checkIcon?: () => JSX.Element;
  /** App-wide default clear-button glyph, as a factory. Falls back to hope's built-in X. */
  clearIcon?: () => JSX.Element;
}

/**
 * The Combobox recipe's slots — the control, then the popup, then the rows.
 *
 * `control` is the bordered shell (the box Select spells as `trigger`); `input` the `role="combobox"`
 * text field inside it, which owns DOM focus and therefore carries no chrome of its own; `clear` the
 * reset button; `trigger` the `tabindex="-1"` chevron button; `icon` the chevron's box. `positioner`
 * is the layer `createFloating` measures and moves — chrome only, never `position`/`left`/`top`, which
 * would fight the inline style the kernel writes; `content` the card; `list` the `role="listbox"`
 * scroll container. Then `empty`/`status`, and `group`/`groupLabel`/`separator` and
 * `item`/`itemText`/`itemIndicator`, matching Listbox's and Select's row vocabulary so all three read
 * the same.
 *
 * `empty` and `status` are the two slots Select's contract predicted and left to this one: a
 * `role="listbox"` may only contain options and groups, so the no-results message and the live result
 * count live in the card **beside** the list, never inside it. Both are slots rather than a `data-*`
 * state because each renders an element that does not otherwise exist — unlike Select's placeholder,
 * which is the same element styled differently.
 *
 * **No `root` or `portal` slot** — neither part renders an element, so a class would have nothing to
 * apply to.
 */
export type ComboboxSlot =
  | "control"
  | "input"
  | "clear"
  | "trigger"
  | "icon"
  | "positioner"
  | "content"
  | "list"
  | "empty"
  | "status"
  | "group"
  | "groupLabel"
  | "separator"
  | "item"
  | "itemText"
  | "itemIndicator";

/**
 * The Combobox recipe: variant props → one class function per slot. The registry entry for
 * `combobox`.
 */
export type ComboboxRecipe = SlotRecipeFn<ComboboxRecipeVariants, ComboboxSlot>;
