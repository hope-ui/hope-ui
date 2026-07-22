import { type CreateCalendarOptions, createCalendar } from "@hope-ui/primitives/calendar";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { CalendarSize, CalendarThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import { CalendarContext, type CalendarContextValue } from "./calendar-context";
import { Grid } from "./calendar-grid";
import { Header } from "./calendar-header";
import { Heading } from "./calendar-heading";
import { NextButton } from "./calendar-next-button";
import { PrevButton } from "./calendar-prev-button";

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
   * The compound parts (`Calendar.Header` with its nav, and `Calendar.Grid`). **Optional** — omit them
   * and `Root` auto-renders the built-in default chrome (navigation header + month grid); pass them to
   * take full compound control (custom heading, extra chrome, a differently-composed layout).
   */
  children?: JSX.Element;
}

/**
 * hope's default navigation glyphs — Lucide's `chevron-left` / `chevron-right`, hand-inlined (hope
 * ships no icon-library dependency). `stroke="currentColor"` so they inherit the nav button's text
 * color, and the `calendar` recipe sizes them per `size` via `[&_svg]:size-*` on the nav-button slots
 * (so a bare `<svg>` needs no width/height of its own). These are the **built-in fallback** for the
 * `prevIcon`/`nextIcon` themeable factories (see `useDefaults` below): every `Calendar.PrevButton` /
 * `NextButton` renders one by default (compound or auto-chrome), overridable per instance via the
 * part's `children` or app-wide via the preset's `defaultProps.calendar.prevIcon`/`nextIcon`.
 */
function ChevronLeftIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/**
 * The Calendar root. Calls `createCalendar` once for the shared state (view machine / roving cursor /
 * selection / date math + predicates, the shared navigation kernel, the heading id, and the form
 * accessors), resolves the recipe variants via `useDefaults` + `useSlots`, and puts the state + slot
 * class fns on context (composition — `ctx.state` + `ctx.slots`, not an extended state). Renders the
 * `role="group"` container over either the consumer's compound parts or — when Root is given no
 * children — the built-in default chrome, followed by (when `name` is set) one hidden native field per
 * submitted ISO value.
 *
 * Because it reads a recipe, a `Calendar.Root` **requires a `<ThemeProvider>`** ancestor (fed a
 * preset), like every other styled component.
 */
export function Root(props: CalendarRootProps): JSX.Element {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  // The nav-glyph factories default to hope's built-in chevrons; a preset's `defaultProps.calendar`
  // swaps them app-wide (and a per-`Calendar.Root` `prevIcon`/`nextIcon` prop wins over that).
  const merged = useDefaults({
    recipe: "calendar",
    props,
    defaults: {
      size: "md" as const,
      prevIcon: () => <ChevronLeftIcon />,
      nextIcon: () => <ChevronRightIcon />,
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
  // The parts read behavior off `state`, classes off `slots`, and — when given no `children` — their
  // default glyph off `prevIcon`/`nextIcon`. Accessors (via `runIfFunction`), so each read builds a
  // fresh glyph element from the resolved factory (instance ?? preset ?? built-in chevron).
  const context: CalendarContextValue = {
    state,
    slots,
    prevIcon: () => runIfFunction(merged.prevIcon),
    nextIcon: () => runIfFunction(merged.nextIcon),
  };

  // The built-in default chrome, rendered when `Root` is given no children (the zero-children
  // convenience). Declared here as a **nested** component — NOT module-scope — and rendered
  // `<DefaultCalendar />` INSIDE the `role="group"` container below, which is under `<CalendarContext>`,
  // so each part's `useCalendarContext()` resolves (mirrors Alert's nested-body-under-provider pattern).
  // It assembles the very same public parts a compound consumer would (`Header` ▸ `PrevButton` /
  // `Heading` / `NextButton`, then `Grid`) as **bare** parts: each nav button supplies its own default
  // glyph (from `ctx.prevIcon`/`nextIcon`) and its own localized `aria-label`, and `Heading` its own
  // period label — so there is no chrome content duplicated here, and a preset's `defaultProps` glyphs
  // apply to the auto-chrome and the compound path alike.
  function DefaultCalendar(): JSX.Element {
    return (
      <>
        <Header>
          <PrevButton />
          <Heading />
          <NextButton />
        </Header>
        <Grid />
      </>
    );
  }

  // The `role="group"` container. `aria-label` is the primitive's group label (from the `label`
  // option, else the i18n `calendar.label`); the `data-*` reflect the calendar-wide flags (`disabled`/
  // `readOnly`/`required`). The recipe `root` slot is applied last, and the chrome renders inside.
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
        {/* Compound (consumer children) vs convenience (auto-chrome): a **single** read of
        `merged.children`, evaluated here under the provider (like the Phase-3 direct render), with a
        nullish fallback to the built-in `<DefaultCalendar />`. One read, so no `children()` is needed
        — the multi-read / `<Show>`-`when`-gate hydration hazard never arises — and `??` short-circuits,
        so a compound consumer never constructs `DefaultCalendar`. */}
        {merged.children ?? <DefaultCalendar />}
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
