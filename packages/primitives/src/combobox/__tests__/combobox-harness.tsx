import type { JSX } from "@solidjs/web";
import { createSignal, For, merge, Show } from "solid-js";
import { createTextInput, type SelectionMode } from "../../internal";
import { createListboxItem } from "../../listbox";
import {
  type CreateComboboxOptions,
  type CreateComboboxReturn,
  type CreateComboboxToggleProps,
  type CreateComboboxTriggerProps,
  createCombobox,
  createComboboxClear,
  createComboboxContent,
  createComboboxInput,
  createComboboxList,
  createComboboxPositioner,
  createComboboxStatus,
  createComboboxToggle,
  createComboboxTrigger,
  createComboboxValue,
} from "../index";

// Shared test support for the combobox kernel. Lives under `__tests__/` so `check:coverage-parity`
// treats it as test support, not a source file needing its own test/doc.
//
// This is the `SelectListbox` shape from `listbox-harness.tsx`, grown up: DOM focus lives on an
// external `role="combobox"` owner, the popup mounts lazily, and every prop on every element comes
// from a kernel hook. It exists so the kernel can be driven end-to-end *before* any component does.

/** Array access that asserts presence — under `noUncheckedIndexedAccess`, `list[i]` is `T | undefined`. */
export function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value === undefined) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}

/**
 * `Açaí` is load-bearing, not decoration: it is what proves the collator folds diacritics, so a
 * `acai` query matches it where `toLowerCase()` never would.
 */
export const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Açaí"];

/**
 * Clear of every edge, so neither `flip` nor `shift` has anything to react to — and deliberately
 * **away from the top-left**, where a `mount()`ed tree renders in normal flow.
 *
 * The physical Playwright cursor is per-page and persists across test files, so wherever a
 * `userEvent.click` here leaves it, the *next* file's tree mounts underneath it — and Chrome fires
 * `mouseenter` on whatever element the layout puts under a stationary pointer. That is a real
 * cross-file coupling: parked at (160, 120), these tests made `calendar-cell`'s range hover preview
 * (`onMouseEnter` → `highlightDate`) fire on mount, moving `focusedDate` off the day the test had
 * just clicked. Keeping the cursor out of the flow region is mitigation, not a cure — see this
 * folder's note in the phase summary. The viewport is Vitest's default 414 × 896, so this has to
 * stay inside it — a trigger `userEvent` cannot reach fails every test here.
 */
const TRIGGER_STYLE: JSX.CSSProperties = { position: "fixed", top: "620px", left: "40px" };

/**
 * The control shell's style. Opaque on purpose: a `position: fixed` element over an unpainted page
 * leaves axe unable to resolve what is behind its text, and `color-contrast` comes back
 * **incomplete** — which `expectNoA11yViolations` fails on, correctly. Giving it a real background
 * and colour makes the check decidable instead of suppressing it, and this package compiles no CSS
 * of its own so nothing else would.
 */
const CONTROL_STYLE: JSX.CSSProperties = {
  ...TRIGGER_STYLE,
  background: "#ffffff",
  color: "#000000",
};

/**
 * The two gutter buttons are **sized and empty**, which is both halves of what they need.
 *
 * *Sized*, because a childless `<button>` — and especially a childless `<div role="button">` — is
 * zero-height, and Playwright's click waits forever for an element that is never "visible and
 * stable". *Empty*, because the real parts render an SVG glyph: giving these a text glyph instead
 * would put text over a `position: fixed` ancestor this package paints no CSS for, and axe returns
 * `color-contrast` as **incomplete** for it — a fact about the harness, not about the hooks. Their
 * accessible name comes from `aria-label`, which is what the hooks actually own.
 */
const GUTTER_BUTTON_STYLE: JSX.CSSProperties = { width: "20px", height: "20px" };

export interface ComboboxHarnessProps<V> {
  values: V[];
  labelOf?: (value: V) => string;
  /** Everything except `items`, which the harness owns. */
  options?: Omit<CreateComboboxOptions<V, SelectionMode>, "items">;
  triggerProps?: CreateComboboxTriggerProps;
  valueProps?: JSX.HTMLAttributes<HTMLElement>;
  positionerProps?: JSX.HTMLAttributes<HTMLDivElement>;
  contentProps?: JSX.HTMLAttributes<HTMLDivElement>;
  listProps?: JSX.HTMLAttributes<HTMLElement>;
  /** Omit the `Value` part, to observe the trigger with nothing registered into `aria-labelledby`. */
  withoutValue?: boolean;
  /** Render the trigger as a `<div>` — the shape a `render` prop produces, for `nativeButton: false`. */
  triggerAs?: "button" | "div";
  /** A focusable control *after* the widget, so Tab has somewhere to leave to. */
  withOutsideButton?: boolean;
  onReady?: (state: CreateComboboxReturn<V, SelectionMode>) => void;
}

export function ComboboxHarness<V>(props: ComboboxHarnessProps<V>): JSX.Element {
  const labelOf = (value: V) => props.labelOf?.(value) ?? String(value);

  // `merge`, never a spread: a spread reads every getter once, so a test controlling `open` or
  // `value` through `props.options` would freeze at its first value.
  const overrides: Omit<CreateComboboxOptions<V, SelectionMode>, "items"> = props.options ?? {};
  const state = createCombobox<V, SelectionMode>(
    merge(overrides, {
      get items() {
        return props.values;
      },
    }),
  );
  props.onReady?.(state);

  const trigger = createComboboxTrigger(
    state,
    // `role="combobox"` with no accessible name is an axe `aria-input-field-name` violation, and
    // there is no `Label` part by design — so every tree carries one of these.
    merge({ "aria-label": "Fruit" }, props.triggerProps ?? {}),
  );
  const positioner = createComboboxPositioner(state, props.positionerProps ?? {});
  const content = createComboboxContent(state, props.contentProps ?? {});
  const list = createComboboxList(state, props.listProps ?? {});

  const selectedLabel = () => {
    const selected = state.list.value();
    return selected.length === 0 ? "Pick a fruit" : selected.map(labelOf).join(", ");
  };

  // A nested component, so `createComboboxValue` — and the id it registers upward — is scoped to the
  // part actually rendering, exactly as `Select.Value` will be. Called from the harness body instead,
  // a `withoutValue` tree would still publish a `valueId` for an element that does not exist.
  function ValuePart(): JSX.Element {
    const value = createComboboxValue(state, props.valueProps ?? {});
    return (
      <span data-testid="value" {...value.props}>
        {selectedLabel()}
      </span>
    );
  }

  const triggerContent = () => (
    <Show when={!props.withoutValue} fallback={selectedLabel()}>
      <ValuePart />
    </Show>
  );

  return (
    <>
      <Show
        when={props.triggerAs !== "div"}
        fallback={
          // Re-targeting a different tag is the case that casts, at the call site — the shape
          // `renderAsAnchor` uses in the Button tests. The kernel types its props over the element
          // the trigger normally *is*.
          <div
            data-testid="trigger"
            style={TRIGGER_STYLE}
            {...(trigger.props as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
            ref={trigger.setRef as unknown as (element: HTMLDivElement) => void}
          >
            {triggerContent()}
          </div>
        }
      >
        <button data-testid="trigger" style={TRIGGER_STYLE} {...trigger.props} ref={trigger.setRef}>
          {triggerContent()}
        </button>
      </Show>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          <div data-testid="content" {...content.props} ref={content.setRef}>
            <div data-testid="list" {...list.props} ref={list.setRef}>
              <For each={props.values}>
                {(item) => {
                  const [ref, setRef] = createSignal<HTMLDivElement>();
                  const option = createListboxItem<V>(state.list, { ref, item });
                  return (
                    <div ref={setRef} {...option.props} data-value={labelOf(item)}>
                      {labelOf(item)}
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </div>
      </Show>
      {props.withOutsideButton ? (
        <button type="button" data-testid="outside">
          outside
        </button>
      ) : null}
    </>
  );
}

// ─── The input-focus-owner harness (the Combobox shape) ──────────────────────────────────────────
//
// The same kernel with the focus owner swapped: `role="combobox"` on an `<input>` instead of a
// `<button>`, no typeahead, and the chevron/clear buttons beside it. It renders `Combobox`'s parts
// (`createComboboxInput` / `createComboboxToggle` / `createComboboxClear` / `createComboboxStatus`)
// against the same `createCombobox` state, so the kernel's two personalities can be driven
// side by side.
//
// The text value is created **here**, not inside the input part — the same place `Combobox.Root`
// creates it, because the kernel owns no text value and the filter derives from it.

export interface ComboboxInputHarnessProps<V> {
  values: V[];
  labelOf?: (value: V) => string;
  /** Everything except `items`, which the harness owns. */
  options?: Omit<CreateComboboxOptions<V, SelectionMode>, "items">;
  inputProps?: JSX.InputHTMLAttributes<HTMLInputElement>;
  toggleProps?: CreateComboboxToggleProps;
  /** Accept the highlighted option. Defaults to selecting it and writing its label into the field. */
  onCommit?: () => void;
  /** Restore the last committed text. Defaults to the selection's label. */
  onRevert?: () => void;
  /** Render the `Clear` button. */
  withClear?: boolean;
  /** Render the `Status` live region. */
  withStatus?: boolean;
  /** Render the chevron as a `<div>` — the shape a `render` prop produces, for `nativeButton: false`. */
  toggleAs?: "button" | "div";
  /** A focusable control *after* the widget, so Tab has somewhere to leave to. */
  withOutsideButton?: boolean;
  onReady?: (state: CreateComboboxReturn<V, SelectionMode>) => void;
}

export function ComboboxInputHarness<V>(props: ComboboxInputHarnessProps<V>): JSX.Element {
  const labelOf = (value: V) => props.labelOf?.(value) ?? String(value);

  const overrides: Omit<CreateComboboxOptions<V, SelectionMode>, "items"> = props.options ?? {};
  const state = createCombobox<V, SelectionMode>(
    // `modal: false` first, so a test can still override it: `merge` resolves by key *presence*, and
    // the overrides come second. It is what `Combobox.Root` passes, and it matters here — the kernel
    // defaults to `true`, and `createHideOutside` would mark the harness's own outside button
    // `inert`, so every Tab/blur assertion would silently be testing nothing.
    merge({ modal: false }, overrides, {
      get items() {
        return props.values;
      },
    }),
  );
  props.onReady?.(state);

  const textInput = createTextInput<HTMLInputElement>({});

  const committedText = () => {
    const selected = state.list.value();
    return selected.length === 0 ? "" : labelOf(selected[0] as V);
  };

  const commit =
    props.onCommit ??
    (() => {
      const active = state.list.focus.activeItem();
      if (active !== undefined) {
        state.list.selection.selectOne(active);
        // `CollectionItem.value` is an accessor — a recycled virtual row's item changes under it.
        textInput.setValue(labelOf(active.value()));
        return;
      }
      textInput.setValue(committedText());
    });

  const revert = props.onRevert ?? (() => textInput.setValue(committedText()));

  const input = createComboboxInput(
    state,
    merge({ "aria-label": "Fruit" }, props.inputProps ?? {}, {
      textInput,
      onCommit: commit,
      onRevert: revert,
    }),
  );
  const toggle = createComboboxToggle(state, props.toggleProps ?? {});
  const positioner = createComboboxPositioner(state, {});
  const content = createComboboxContent(state, {});
  const list = createComboboxList(state, {});

  function ClearPart(): JSX.Element {
    const clear = createComboboxClear(state, {
      onClear: () => {
        textInput.setValue("");
        state.list.selection.deselectAll();
      },
    });
    return (
      <button data-testid="clear" {...clear.props} style={GUTTER_BUTTON_STYLE} ref={clear.setRef} />
    );
  }

  // A nested component, so the announcer's effect is scoped to the part that actually renders —
  // exactly as `Combobox.Status` is, and which is what makes "announces once per open" observable.
  function StatusPart(): JSX.Element {
    const status = createComboboxStatus(state, {});
    return (
      <div
        data-testid="status"
        {...(status.props as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
      >
        {status.message()}
      </div>
    );
  }

  return (
    <>
      {/* The shell `Combobox.Control` is: the positioning anchor, and the outer edge of "not
          outside" for dismissal. The ref is cast because the kernel types it over `HTMLElement`. */}
      <div
        data-testid="control"
        style={CONTROL_STYLE}
        ref={state.setAnchorElement as (element: HTMLDivElement) => void}
      >
        <input data-testid="input" {...input.props} ref={input.setRef} />
        <Show when={props.withClear}>
          <ClearPart />
        </Show>
        {/* The chevron carries a glyph so it has a box: a childless `<div role="button">` is
            zero-height, and Playwright's click waits forever for a "stable, visible" element. */}
        <Show
          when={props.toggleAs !== "div"}
          fallback={
            // Re-targeting a different tag is the case that casts, at the call site.
            <div
              data-testid="toggle"
              {...(toggle.props as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
              style={GUTTER_BUTTON_STYLE}
              ref={toggle.setRef as unknown as (element: HTMLDivElement) => void}
            >
              ▾
            </div>
          }
        >
          <button
            data-testid="toggle"
            {...toggle.props}
            style={GUTTER_BUTTON_STYLE}
            ref={toggle.setRef}
          />
        </Show>
      </div>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          <div data-testid="content" {...content.props} ref={content.setRef}>
            <div data-testid="list" {...list.props} ref={list.setRef}>
              <For each={props.values}>
                {(item) => {
                  const [ref, setRef] = createSignal<HTMLDivElement>();
                  const option = createListboxItem<V>(state.list, { ref, item });
                  return (
                    <div ref={setRef} {...option.props} data-value={labelOf(item)}>
                      {labelOf(item)}
                    </div>
                  );
                }}
              </For>
            </div>
            <Show when={props.withStatus}>
              <StatusPart />
            </Show>
          </div>
        </div>
      </Show>
      {props.withOutsideButton ? (
        <button type="button" data-testid="outside">
          outside
        </button>
      ) : null}
    </>
  );
}

export const inputOf = (container: Element) =>
  container.querySelector('[data-testid="input"]') as HTMLInputElement;
export const toggleOf = (container: Element) =>
  container.querySelector('[data-testid="toggle"]') as HTMLButtonElement;
export const clearOf = (container: Element) =>
  container.querySelector('[data-testid="clear"]') as HTMLButtonElement | null;
export const statusOf = (container: Element) =>
  container.querySelector('[data-testid="status"]') as HTMLElement | null;

/** The option `aria-activedescendant` currently names, by its label — resolved off the **input**. */
export function activeLabelForInput(container: Element): string | undefined {
  const id = inputOf(container).getAttribute("aria-activedescendant");
  if (id == null) {
    return undefined;
  }
  return optionsOf(container).find((option) => option.id === id)?.dataset.value;
}

// ─── Queries ──────────────────────────────────────────────────────────────────────────────────────

export const triggerOf = (container: Element) =>
  container.querySelector('[data-testid="trigger"]') as HTMLButtonElement;
export const valuePartOf = (container: Element) =>
  container.querySelector('[data-testid="value"]') as HTMLElement | null;
export const positionerOf = (container: Element) =>
  container.querySelector('[data-testid="positioner"]') as HTMLElement | null;
export const contentOf = (container: Element) =>
  container.querySelector('[data-testid="content"]') as HTMLElement | null;
export const listOf = (container: Element) =>
  container.querySelector('[data-testid="list"]') as HTMLElement | null;

export function optionsOf(container: Element): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}

/** The option `aria-activedescendant` currently names, by its label. */
export function activeLabel(container: Element): string | undefined {
  const id = triggerOf(container).getAttribute("aria-activedescendant");
  if (id == null) {
    return undefined;
  }
  return optionsOf(container).find((option) => option.id === id)?.dataset.value;
}

/** The labels of every option painting `data-active` — the highlight as a reader sees it. */
export function highlightedLabels(container: Element): string[] {
  return optionsOf(container)
    .filter((option) => option.hasAttribute("data-active"))
    .map((option) => option.dataset.value as string);
}

export function selectedLabels(container: Element): string[] {
  return optionsOf(container)
    .filter((option) => option.getAttribute("aria-selected") === "true")
    .map((option) => option.dataset.value as string);
}

/** One frame is enough for a dismissal (or a focus move) that was going to happen to have happened. */
export const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
