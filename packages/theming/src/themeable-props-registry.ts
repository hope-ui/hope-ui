/**
 * The **themeable-props registry** — the parallel, type-only counterpart to {@link RecipeRegistry}.
 *
 * One entry per component that opts into defaulting *non-variant* props app-wide (durable behavioral
 * policy and chrome content), on top of its recipe variants. Hand-declared and closed, for the same
 * reason as `RecipeRegistry`: TypeScript module augmentation would degrade silently in the presets
 * package and in theming's own tests, where the component types are not in scope.
 *
 * **Intentionally non-exhaustive** over `keyof RecipeRegistry`. A component wanting variants-only
 * defaults declares no entry here at all and falls back to `RecipeVariantsOf` — the fallback arm of
 * `ThemeablePropsOf` in `./preset` — which is what keeps the opt-in incremental.
 */
import type { AlertThemeableProps } from "./recipes/alert";
import type { BadgeThemeableProps } from "./recipes/badge";
import type { ButtonThemeableProps } from "./recipes/button";
import type { CalendarThemeableProps } from "./recipes/calendar";
import type { CloseButtonThemeableProps } from "./recipes/close-button";
import type { ComboboxThemeableProps } from "./recipes/combobox";
import type { DialogThemeableProps } from "./recipes/dialog";
import type { ListboxThemeableProps } from "./recipes/listbox";
import type { PopoverThemeableProps } from "./recipes/popover";
import type { SelectThemeableProps } from "./recipes/select";

/** One entry per component that opts into behavioral/chrome (non-variant) app-wide defaults. */
export interface ThemeablePropsRegistry {
  alert: AlertThemeableProps;
  badge: BadgeThemeableProps;
  button: ButtonThemeableProps;
  calendar: CalendarThemeableProps;
  closeButton: CloseButtonThemeableProps;
  combobox: ComboboxThemeableProps;
  dialog: DialogThemeableProps;
  listbox: ListboxThemeableProps;
  popover: PopoverThemeableProps;
  select: SelectThemeableProps;
}
