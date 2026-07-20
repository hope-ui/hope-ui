/**
 * The **recipe registry** — the set of recipes a hope-ui theme must provide.
 *
 * `@hope-ui/theming` owns the look-&-feel contract: every hope-authored component's recipe is
 * declared here — one entry per component, whose type is that component's own `…Recipe` from its
 * contract file in the sibling `recipes/` folder — **not** by module augmentation. This file stays a
 * flat list of named recipe types with no shape logic of its own. A component consumes
 * `useRecipe("<name>")`; a theme implements the matching recipe and checks its map with
 * `satisfies RecipeRegistry`.
 *
 * This is the top-level `registry/` folder (the contract seam, parallel to `preset`/`theme-context`/
 * `styling`), holding {@link RecipeRegistry} alongside {@link ThemeablePropsRegistry} (its
 * behavioral/chrome counterpart) so the two contracts scale independently as the catalog grows.
 */
import type { AlertRecipe } from "./recipes/alert";
import type { BadgeRecipe } from "./recipes/badge";
import type { ButtonRecipe } from "./recipes/button";
import type { CloseButtonRecipe } from "./recipes/close-button";
import type { DialogRecipe } from "./recipes/dialog";

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
  closeButton: CloseButtonRecipe;
  dialog: DialogRecipe;
}
