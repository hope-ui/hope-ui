import { type CreateCalendarOptions, createCalendar } from "@hope-ui/primitives/calendar";
import type { CalendarSize, CalendarThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import { CalendarContext, type CalendarContextValue } from "./calendar-context";

/**
 * `CalendarRootProps` = the primitive's `CreateCalendarOptions` (locale/selection/boundaries/focus +
 * the native-form fields) **plus** the themeable `size` axis (`CalendarThemeableProps`, owned by
 * `@hope-ui/theming`) **plus** the per-instance props below. Extending `CalendarThemeableProps` keeps
 * the recipe variants and this surface in lockstep by construction.
 */
export interface CalendarRootProps extends CreateCalendarOptions, CalendarThemeableProps {
  /**
   * Per-instance class overrides, keyed by slot (`root`/`header`/`heading`/`prevButton`/`nextButton`/
   * `grid`/`weekday`/`cell`/`cellTrigger`). Folded in after the recipe base and the preset's global
   * `slotClasses`. Set once here to reach every part. Use literal class strings so the consumer's
   * Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"calendar">;
  /** Merged over the recipe's `root` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * The compound parts (`Calendar.Header` with its nav, and `Calendar.Grid`). Required in this phase —
   * the zero-children convenience (auto-chrome) lands in a later phase.
   */
  children?: JSX.Element;
}

/**
 * The Calendar root. Calls `createCalendar` once for the shared state (view machine / roving cursor /
 * selection / date math + predicates, the shared navigation kernel, the heading id, and the form
 * accessors), resolves the recipe variants via `useDefaults` + `useSlots`, and puts the state + slot
 * class fns on context (composition — `ctx.state` + `ctx.slots`, not an extended state). Renders the
 * `role="group"` container over the consumer's compound parts, followed — when `name` is set — by one
 * hidden native field per submitted ISO value.
 *
 * Because it reads a recipe, a `Calendar.Root` **requires a `<ThemeProvider>`** ancestor (fed a
 * preset), like every other styled component.
 */
export function Root(props: CalendarRootProps): JSX.Element {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // this built-in default (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  const merged = useDefaults({
    recipe: "calendar",
    props,
    defaults: {
      size: "md" as const,
    },
  });

  // `useSlots` returns one ready-to-call class fn per slot, each folding the override chain: recipe
  // base → preset `slotClasses` → instance `slotClasses` → `class` (root slot only). `size` is the
  // whole styling axis; passing the complete variant set every call is what `CompleteVariantsOf`
  // requires (an omitted variant would silently fall back to the recipe's `defaultVariants`).
  const slots = useSlots({
    recipe: "calendar",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

  // `createCalendar` reads only its own option keys off `merged` (locale/selection/boundaries/focus/
  // name/…) — the defaulted `size` and the per-instance class props ride along harmlessly. Pass
  // `merged`, not raw `props`: `useDefaults` exposes its defaults as getters over `props`, so `merged`
  // stays just as lazy and reactive (the controllable-state getters stay live) while being the single
  // source of truth.
  const state = createCalendar(merged);
  const context: CalendarContextValue = { state, slots };

  // The `role="group"` container. `aria-label` is the primitive's group label (from the `label`
  // option, else the i18n `calendar.label`); the `data-*` reflect the calendar-wide flags (`disabled`/
  // `readOnly`/`required`). The recipe `root` slot is applied last, and the consumer's parts render
  // inside.
  return (
    <CalendarContext value={context}>
      {/* biome-ignore lint/a11y/useSemanticElements: a calendar is an ARIA "group" container (WAI-ARIA
      APG / React-Aria `useCalendar`), deliberately not a form `<fieldset>`. */}
      <div
        role="group"
        aria-label={state.groupLabel()}
        data-disabled={state.disabled() ? "" : undefined}
        data-readonly={state.readOnly() ? "" : undefined}
        data-required={state.required() ? "" : undefined}
        data-slot="calendar"
        class={slots.root()}
      >
        {merged.children}
      </div>
      {/* Native form submission, opt-in via `name`: one hidden field per submitted ISO value, keyed by
      the primitive's `formValues()` (single → one field; multiple → one per date; range → paired
      `${name}Start`/`${name}End`). Siblings of the group, so an `<input>` never nests in the grid.
      Empty (renders nothing) until the calendar opts into a form. Mirrors the Listbox shape. */}
      <Show when={state.name()}>
        <For each={state.formValues()}>
          {(field) => (
            <input type="hidden" name={field.name} value={field.value} form={state.form()} />
          )}
        </For>
      </Show>
    </CalendarContext>
  );
}

// Re-export the recipe vocabulary so consumers can import it from the component's subpath.
export type { CalendarSize };
