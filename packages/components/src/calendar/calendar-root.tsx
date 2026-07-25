import {
  type CreateCalendarOptions,
  createCalendar,
  createCalendarGroup,
} from "@hope-ui/primitives/calendar";
import { renderElement } from "@hope-ui/primitives/render";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { CalendarSize, CalendarThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { For, merge, Show } from "solid-js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
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
  // The container part: the group's ARIA + state `data-*`, and the abandonment policy
  // (`commitBehavior`) for a range the user walks away from. It takes no consumer props — `Root` does
  // not forward native `<div>` attributes — so its whole surface is the primitive's.
  const group = createCalendarGroup(state);
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

  // The `role="group"` container — its ARIA and state `data-*` come from `createCalendarGroup`, which
  // also wires the abandonment policy and takes the element's ref (also what the dev direction warning
  // measures). The recipe `root` slot is applied last, and the chrome renders inside.
  //
  // Through `renderElement`, not a literal `<div>`: it now spreads a getter-laden props object from a
  // primitive hook, and such a spread on a literal host element allocates its subtree's `_hk`
  // differently under the server (`ssr`) vs client (`dom`) Solid compile — the same measured hazard
  // documented on `Calendar.Grid`'s `<table>`/`<thead>` and `CalendarCell`.
  return (
    <CalendarContext value={context}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "div",
        props: merge(group.props, {
          "data-slot": "calendar",
          get class(): string {
            return slots.root();
          },
          /* `dir` is the one `createCalendar` option that is also a real HTML attribute, and the two
          halves of RTL travel down different channels: the grid's column order and the recipe's
          logical utilities (`rounded-s-`, `rtl:[&_svg]:rotate-180`) mirror from the DOM, the arrow
          keys from `state.direction()`. So the consumer's `dir` must reach the element, or
          `<Calendar.Root dir="rtl">` navigates right-to-left across a grid still laid out
          left-to-right, with Sunday on the left.

          `merged.dir`, never `state.direction()`: the latter falls back to the locale, and a
          locale-derived `dir="ltr"` would override an inherited `dir="rtl"` from an ancestor. Base UI
          and React Aria both draw the line here too — React Aria's `useCalendarGrid` reads
          `useLocale().direction` for the arrow flip and puts no `dir` in `gridProps` at all. An app
          declares direction where the browser can see it; the provider only tells the keymap.
          `createTextDirectionWarning` says so out loud in dev when the two disagree. */
          get dir() {
            return merged.dir;
          },
          /* Compound (consumer children) vs convenience (auto-chrome): a **single** read of
          `merged.children`, in a getter so it stays evaluated under the provider, with a nullish
          fallback to the built-in `<DefaultCalendar />`. One read, so no `children()` is needed — the
          multi-read / `<Show>`-`when`-gate hydration hazard never arises — and `??` short-circuits, so
          a compound consumer never constructs `DefaultCalendar`. */
          get children(): JSX.Element {
            return merged.children ?? <DefaultCalendar />;
          },
        }),
        ref: group.setRef,
      })}
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
