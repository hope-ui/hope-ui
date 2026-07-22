/**
 * The **Listbox** recipe contract — its variant vocabulary, slots, and the resulting `ListboxRecipe`
 * type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `Listbox` consumes it via `useRecipe("listbox")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`../recipe-registry`) a flat list of named recipe types with no shape logic of
 * its own.
 *
 * Listbox is a **neutral collection surface** — a scroll container of self-registering options — so
 * like Dialog it carries **no** color axis: v1 is a neutral overlay panel, and the only accents are
 * the transient highlight (the `active` / `on-active` tokens) and the persistent chosen row (the
 * `selected` / `on-selected` tokens), neither of which is a variant. Its single axis is `size` — the
 * density scale (row text / padding / gap, and the panel's min width) a consumer sets once on
 * `Listbox.Root`, the same way `button`/`badge` scale sizes.
 *
 * Two selection/behavior concerns are deliberately **not** recipe variants because they change ARIA
 * or behavior, not styling, and so are component-layer props threaded through context, not here:
 * `selectionMode` (`single`/`multiple`/`none`) and `focusMode` (`roving`/`activedescendant`).
 *
 * The highlight is styled by the preset's registered `data-active:` custom variant **only** — never a
 * `hover:` or bare `:focus` background — so the cursor's physical position can never paint a second
 * highlight (keyboard and pointer share one active item; see the primitive family's pointer/keyboard
 * invariant). Every color is a finished `--hope-*` token (recipe purity). See `theming.md`.
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
 * recipe variants **plus** the selection-check glyph. A strict superset of {@link ListboxRecipeVariants}
 * by construction (`extends`), so it registers in `ThemeablePropsRegistry` and
 * `ThemeablePropsOf<"listbox">` widens the variants-only surface without dropping anything.
 *
 * The glyph is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one
 * object shared by every instance, and a Solid `JSX.Element` is an already-built node that would
 * *move* if reused, so a factory (called per instance) is what lets a preset swap the app-wide check
 * icon without two listboxes fighting over one node. Mirrors Calendar's `prevIcon`/`nextIcon` and
 * CloseButton's `icon`. Listbox is a multi-part component, so its themeable surface stays on the
 * **root** (no per-part themeable props): `Listbox.Root` resolves this through `runIfFunction` and
 * flows it to the `ItemIndicator` part via context, where it is the default child. The **per-instance**
 * override is that part's own `children`.
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
