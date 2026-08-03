/**
 * The **recipe registry** — the set of recipes a hope-ui theme must provide. A component consumes
 * `useRecipe("<name>")`; a theme implements the matching recipes and checks its map with
 * `satisfies RecipeRegistry`.
 *
 * Every entry is declared here by hand, deliberately **not** through TypeScript module augmentation:
 * a closed interface makes a missing or misspelled recipe a compile error in the theme, where an
 * augmentable one would silently accept anything. Keep this file a flat list of named recipe types
 * with no shape logic of its own; each component's variants and slots live in its own contract file
 * under `recipes/`.
 */
import type { AlertRecipe } from "./recipes/alert";
import type { BadgeRecipe } from "./recipes/badge";
import type { ButtonRecipe } from "./recipes/button";
import type { CalendarRecipe } from "./recipes/calendar";
import type { CloseButtonRecipe } from "./recipes/close-button";
import type { ComboboxRecipe } from "./recipes/combobox";
import type { DialogRecipe } from "./recipes/dialog";
import type { ListboxRecipe } from "./recipes/listbox";
import type { PopoverRecipe } from "./recipes/popover";
import type { SelectRecipe } from "./recipes/select";

/**
 * The theming contract version. A theme asserts against it (e.g. in its conformance test) so a
 * recipe map built against a different contract shape fails loudly rather than drifting silently.
 * Bump on any breaking change to a recipe's variant/slot shape or the registry mechanics.
 */
export const THEMING_CONTRACT_VERSION = 1 as const;

/**
 * The recipe registry — one entry per hope-authored component. `useRecipe` is keyed off this, and a
 * theme's recipe map is type-checked against it. Add a component by giving it a contract file (which
 * exports its `…Recipe` type) and one entry here.
 */
export interface RecipeRegistry {
  alert: AlertRecipe;
  badge: BadgeRecipe;
  button: ButtonRecipe;
  calendar: CalendarRecipe;
  closeButton: CloseButtonRecipe;
  combobox: ComboboxRecipe;
  dialog: DialogRecipe;
  listbox: ListboxRecipe;
  popover: PopoverRecipe;
  select: SelectRecipe;
}
