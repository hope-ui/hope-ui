/**
 * The **Listbox** recipe contract — its variant vocabulary, slots, and the resulting `ListboxRecipe`
 * type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' Listbox consumes it via `useRecipe("listbox")` and each preset
 * implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 *
 * Listbox is a **neutral collection surface** — a scroll container of self-registering options — so
 * like Dialog it carries **no** color axis. The only accents are the transient highlight
 * (`active`/`on-active` tokens) and the persistent chosen row (`selected`/`on-selected`), neither of
 * which is a variant. Its single axis is `size`, the density scale set once on `Listbox.Root`.
 *
 * `selectionMode` and `focusMode` are deliberately **not** recipe variants: they change ARIA and
 * behavior rather than styling, so they are component-layer props threaded through context.
 *
 * The highlight is styled by the preset's registered `data-active:` variant **only**, never a `hover:`
 * or bare `:focus` background, so the cursor's physical position can never paint a second highlight —
 * keyboard and pointer share one active item. Every color is a *finished* `--hope-*` design token,
 * never one the recipe computes ("recipe purity" — see `theming.md`).
 */
import type { JSX } from "@solidjs/web";
import type { SlotRecipeFn } from "../slot-recipe";

/**
 * The density scale. `sm`/`md`/`lg` scale the option row's text, padding, and gap (and the panel's
 * min width); `md` is the default and matches the recipe's base metrics.
 */
export type ListboxSize = "sm" | "md" | "lg";

/** The Listbox recipe's variant props — also the density axis a preset may default app-wide. */
export interface ListboxRecipeVariants {
  /** Row density scale (and the panel's min width). Default `md`. */
  size?: ListboxSize;
}

/**
 * The curated Listbox props a preset may default app-wide via `ComponentOverride.defaultProps`: the
 * recipe variants **plus** the selection-check glyph.
 *
 * The glyph is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one
 * object shared by every instance, and a Solid `JSX.Element` is an already-built DOM node that would
 * *move* if reused, so calling a factory per instance is what keeps two listboxes from fighting over
 * one node. Listbox is a multi-part component, so its themeable surface stays on the **root**:
 * `Listbox.Root` resolves this through `runIfFunction` and flows it to the `ItemIndicator` part via
 * context, where it is the default child. The per-instance override is that part's own `children`.
 */
export interface ListboxThemeableProps extends ListboxRecipeVariants {
  /** App-wide default selection-check glyph, as a factory. Falls back to hope's built-in check. */
  checkIcon?: () => JSX.Element;
}

/**
 * The Listbox recipe's slots. `root` is the `role="listbox"` scroll container (also the scroll
 * element in virtual mode); `item` an `role="option"` row; `itemIndicator` the chosen-row check
 * glyph's placement; `group`/`groupLabel` a `role="group"` section and its label; `separator` a
 * hairline divider between sections.
 */
export type ListboxSlot = "root" | "item" | "itemIndicator" | "group" | "groupLabel" | "separator";

/** The Listbox recipe: variant props → one class function per slot. The registry entry for `listbox`. */
export type ListboxRecipe = SlotRecipeFn<ListboxRecipeVariants, ListboxSlot>;
