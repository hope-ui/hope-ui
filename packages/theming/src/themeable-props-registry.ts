/**
 * The **themeable-props registry** — the parallel, type-only counterpart to {@link RecipeRegistry}.
 *
 * One entry per component that opts into defaulting *non-variant* props app-wide (durable behavioral
 * policy + component chrome content), on top of its recipe variants. Each entry is that component's
 * `<Component>ThemeableProps` type from its contract file. Hand-declared and closed — **no module
 * augmentation** (which would degrade silently in the presets package and theming's own tests, where
 * the component types aren't in scope).
 *
 * **Intentionally non-exhaustive** over `keyof RecipeRegistry`: a component that only wants
 * variants-only defaults declares *no* entry here and falls back to `RecipeVariantsOf` — see
 * `ThemeablePropsOf` in `./preset`, whose `K extends keyof ThemeablePropsRegistry ? … :
 * RecipeVariantsOf<K>` fallback is what keeps this feature incremental.
 */
import type { AlertThemeableProps } from "./recipes/alert";
import type { BadgeThemeableProps } from "./recipes/badge";
import type { ButtonThemeableProps } from "./recipes/button";
import type { CloseButtonThemeableProps } from "./recipes/close-button";
import type { DialogThemeableProps } from "./recipes/dialog";
import type { ListboxThemeableProps } from "./recipes/listbox";

/** One entry per component that opts into behavioral/chrome (non-variant) app-wide defaults. */
export interface ThemeablePropsRegistry {
  alert: AlertThemeableProps;
  badge: BadgeThemeableProps;
  button: ButtonThemeableProps;
  closeButton: CloseButtonThemeableProps;
  dialog: DialogThemeableProps;
  listbox: ListboxThemeableProps;
}
