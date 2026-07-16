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
 * `ThemeablePropsOf` in `../../presets/presets`, whose `K extends keyof ThemeablePropsRegistry ? … :
 * RecipeVariantsOf<K>` fallback is what keeps this feature incremental.
 */
import type { ButtonThemeableProps } from "../recipes/button";

/** One entry per component that opts into behavioral/chrome (non-variant) app-wide defaults. */
export interface ThemeablePropsRegistry {
  button: ButtonThemeableProps;
}
