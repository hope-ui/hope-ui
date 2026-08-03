import {
  type CreateCalendarOptions,
  createCalendar,
  createCalendarGroup,
} from "@hope-ui/primitives/calendar";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { CalendarSize, CalendarThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { For, merge, omit, Show } from "solid-js";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
import { CalendarContext, type CalendarContextValue } from "./calendar-context";
import { Grid } from "./calendar-grid";
import { Header } from "./calendar-header";
import { Heading } from "./calendar-heading";
import { NextButton } from "./calendar-next-button";
import { PrevButton } from "./calendar-prev-button";

// A plain `<div role="group">`, deliberately not a `<fieldset>`, so there are no element-specific
// attributes to inherit.
type CalendarRootElementProps = JSX.HTMLAttributes<HTMLDivElement>;

/**
 * `CalendarRootProps` = the `createCalendar` options (locale/selection/boundaries/focus, the
 * native-form fields) **plus** the themeable `size` axis **plus** the remaining native `<div>`
 * attributes (`id`, `aria-label`, `style`, `data-*`, …) and the per-instance props below.
 *
 * The `createCalendar` option keys are `Omit`-ted from the native attributes so a DOM `dir`/`title`
 * can never clash with the option of the same name. Extending `CalendarThemeableProps` keeps the
 * style recipe's variants and this surface in lockstep.
 */
export interface CalendarRootProps
  extends CreateCalendarOptions,
    CalendarThemeableProps,
    Omit<CalendarRootElementProps, keyof CreateCalendarOptions | "children"> {
  /**
   * Per-instance class overrides, keyed by slot (`root`/`header`/`heading`/`prevButton`/`nextButton`/
   * `grid`/`weekday`/`cell`/`cellTrigger`). Folded in after the recipe base and the preset's global
   * `slotClasses`. Set once here to reach every part. Use literal class strings so the consumer's
   * Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"calendar">;
  /**
   * Renders the group container as a different element/component while keeping Root's computed props
   * (`role="group"`, the state `data-*`, `dir`).
   *
   * Your element receives a single function `ref` with the component's own ref merged in. Two
   * features read that element — committing a half-finished range when focus leaves the calendar,
   * and the dev-time reading-direction warning — so a target that ignores function refs disables
   * both, silently.
   */
  render?: RenderProp<CalendarRootElementProps>;
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
 * The Calendar root. Calls `createCalendar` once for the state every part shares (the view stack,
 * the keyboard cursor, selection, date math, the heading id, the form accessors), resolves the theme
 * recipe, and publishes both on context. Renders the `role="group"` container over either the
 * consumer's compound parts or — when given no children — the built-in default chrome, followed by
 * one hidden native field per submitted value when `name` is set.
 *
 * Native `<div>` attributes that are neither a `createCalendar` option nor a recipe input reach the
 * container element. The primitive's own attributes win over a consumer's, with two deliberate
 * exceptions: an `aria-label` overrides the built-in group label, and an `onFocusOut` is composed
 * with — not replaced by — the one that commits a half-finished range.
 *
 * Reading a recipe means a `Calendar.Root` **requires a `<ThemeProvider>`** ancestor fed a preset,
 * like every other styled component.
 */
export function Root(props: CalendarRootProps): JSX.Element {
  // `useDefaults` resolves each key with `??` across three layers: instance prop, then the preset's
  // per-component `defaultProps`, then the built-ins below. So a preset can swap the nav chevrons
  // app-wide while a per-instance `prevIcon`/`nextIcon` still wins over it.
  const merged = useDefaults({
    recipe: "calendar",
    props,
    defaults: {
      size: "md" as const,
      prevIcon: () => <ChevronLeftIcon />,
      nextIcon: () => <ChevronRightIcon />,
    },
  });

  // One class function per named slot of the theme's `calendar` recipe, each folding the override
  // chain: recipe base → preset `slotClasses` → instance `slotClasses` → `class` (root slot only).
  // Every variant must be passed on every call: an omitted one silently falls back to the recipe's
  // own default rather than to this instance's.
  const slots = useSlots({
    recipe: "calendar",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
  });

  // Pass `merged`, never raw `props`: `useDefaults` returns a *new object of getters* rather than a
  // copy, so `props.size` still reads `undefined` for a defaulted key while `merged.size` reads `md`.
  // Getters also keep everything lazy and reactive. `createCalendar` picks off only the option keys
  // it knows; `size` and the class props ride along harmlessly.
  const state = createCalendar(merged);

  // The native attributes to forward: everything not consumed as a `createCalendar` option, a recipe
  // input, or the explicitly-rendered `class`/`children`. They go through the part hook below, which
  // merges them *under* its own `role`/`aria-*`/`data-*`.
  //
  // This list is hand-kept, and a key missing from it lands in the DOM as a junk attribute with
  // nothing else failing — pinned by "does not leak createCalendar options onto the element as
  // attributes". `dir` is dropped here and re-added explicitly below, so that "make this list
  // exhaustive over the option keys" — the natural tidy-up — cannot silently split the layout from
  // the keyboard. See the `dir` getter for why.
  const rest = omit(
    merged,
    "dir",
    "size",
    "prevIcon",
    "nextIcon",
    "slotClasses",
    "render",
    "class",
    "children",
    "label",
    "locale",
    "timeZone",
    "firstDayOfWeek",
    "min",
    "max",
    "isDateDisabled",
    "allowsNonContiguousRanges",
    "commitBehavior",
    "disabled",
    "readOnly",
    "selectionMode",
    "value",
    "defaultValue",
    "onValueChange",
    "focusedValue",
    "defaultFocusedValue",
    "onFocusedValueChange",
    "name",
    "form",
    "required",
  );

  // The container part: the group's ARIA and state `data-*`, plus the `commitBehavior` policy for a
  // range the user starts and walks away from. `rest` is routed *through* the hook rather than merged
  // onto the element afterwards, because the hook owns the precedence — its `role`/`data-*` win over
  // a consumer's, its `aria-label` defers to one, and its `focusout` listener must run alongside the
  // consumer's rather than instead of it.
  //
  // The cast covers `ref` variance only: `rest` is typed against the `<div>` this renders, the hook's
  // props against the wider `HTMLElement`. A consumer `ref` passes through untouched and is merged
  // with the hook's by `renderElement`, not here.
  const group = createCalendarGroup(state, rest as unknown as JSX.HTMLAttributes<HTMLElement>);
  // `prevIcon`/`nextIcon` are *accessors*, so each read builds a fresh glyph element — a single
  // shared element would be moved between the two buttons instead of appearing in both.
  const context: CalendarContextValue = {
    state,
    slots,
    prevIcon: () => runIfFunction(merged.prevIcon),
    nextIcon: () => runIfFunction(merged.nextIcon),
  };

  // The built-in chrome, rendered when `Root` is given no children. A **nested** component, not a
  // module-scope one, and rendered *inside* the container below — i.e. under the context provider —
  // which is what lets each part's `useCalendarContext()` resolve at all.
  //
  // It assembles the same public parts a compound consumer would, and passes them nothing: each nav
  // button supplies its own glyph and localized `aria-label` from context, and `Heading` its own
  // period label. So there is no chrome duplicated here, and a preset's glyphs reach the automatic
  // and the hand-written path alike.
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

  // The container goes through `renderElement` rather than being written as a literal `<div>`.
  // Spreading a getter-backed props object from a primitive hook onto a *literal* host element makes
  // Solid's server and client compilers allocate the subtree's hydration keys differently, so
  // hydration silently fails to adopt those nodes. Routing through a component call allocates them
  // identically on both sides. Same measured hazard as `Calendar.Grid` and `CalendarCell`.
  return (
    <CalendarContext value={context}>
      {/* Typed over the element this actually renders, so a consumer's
      `render={(p) => <div {...p} />}` compiles with no cast. Only the `ref` parameter type differs
      from the primitive's wider `HTMLElement`, hence the props cast below. Re-targeting a *different*
      tag is the case that casts, and it casts at the call site. */}
      {renderElement<CalendarRootElementProps, HTMLDivElement>({
        as: "div",
        render: merged.render,
        props: merge(group.props, {
          "data-slot": "calendar",
          get class(): string {
            return slots.root(merged.class);
          },
          /* `dir` is the one `createCalendar` option that is also a real HTML attribute, and the two
          halves of right-to-left support arrive by different routes: the grid's column order and the
          CSS mirror themselves from the DOM's direction, while the arrow keys are remapped from the
          resolved direction in JS. So a consumer's `dir` must reach the element, or
          `<Calendar.Root dir="rtl">` navigates right-to-left across a grid still laid out
          left-to-right, with Sunday on the left.

          `merged.dir`, never the resolved direction: that one falls back to the locale, and a
          locale-derived `dir="ltr"` would override a `dir="rtl"` inherited from an ancestor. An app
          declares direction where the browser can see it; a locale provider only tells the keyboard
          mapping. When the two disagree, the primitive warns in dev rather than papering over it. */
          get dir() {
            return merged.dir;
          },
          /* Consumer parts, else the built-in chrome. A **single** read of `merged.children`, in a
          getter so it is evaluated under the provider, with `??` short-circuiting so a consumer's
          tree never constructs `DefaultCalendar`. One read needs no `children()` wrapper: it is the
          *double* read — a `<Show>`'s `when` plus its body — that builds and discards a component and
          shifts the hydration keys Solid derives from tree position. */
          get children(): JSX.Element {
            return merged.children ?? <DefaultCalendar />;
          },
        }) as unknown as CalendarRootElementProps,
        ref: group.setRef,
      })}
      {/* Native form submission, opt-in via `name`: one hidden field per submitted ISO date (single →
      one field; multiple → one per date; range → paired `${name}Start`/`${name}End`). Siblings of the
      group, so an `<input>` never nests inside the grid's table markup. */}
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

// Re-exported so a consumer never has to reach into `@hope-ui/theming` for a type this component's
// own props use.
export type { CalendarSize };
