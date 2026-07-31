/**
 * @license
 * Portions of this file are derived from Adobe React Spectrum (`@react-aria/select`,
 * `src/HiddenSelect.tsx` — the `<select>`-vs-`<input>` size cutoff, the clipped visually-hidden
 * technique and the Safari/Firefox reasoning behind it, the leading placeholder `<option>`, the
 * empty-collection fallback options, and the `required`-on-`<input type="text">` trick).
 * Copyright 2020 Adobe. All rights reserved.
 * https://github.com/adobe/react-spectrum
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. A copy of the License is distributed with this
 * package as LICENSE-APACHE-2.0.txt, and is available at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 *
 * This file has been modified from the original.
 */

import type { JSX } from "@solidjs/web";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  untrack,
} from "solid-js";
import type { CreateListboxReturn } from "../listbox";
import { createHiddenSelect, type HiddenFormControl } from "./create-hidden-select";

/**
 * Above this many options a real `<select>` stops paying for itself: the autofill it buys is worth
 * less than several hundred `<option>` nodes, server-rendered on every request. React Aria's
 * cutoff, kept verbatim.
 */
const MAX_NATIVE_OPTIONS = 300;

/**
 * The clip technique, **not** `display: none` / `hidden`: Safari skips a `display: none` `<select>`
 * for autofill entirely, which is the one thing a real `<select>` exists to provide. `position:
 * fixed` at the viewport origin so a 1px box inside a scrolled container cannot extend the scroll
 * area. Lifted from React Aria's `useVisuallyHidden`, with the physical offsets respelled logical.
 */
const VISUALLY_HIDDEN: JSX.CSSProperties = {
  border: "0",
  clip: "rect(0 0 0 0)",
  "clip-path": "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "fixed",
  "inset-block-start": "0",
  "inset-inline-start": "0",
  width: "1px",
  "white-space": "nowrap",
};

/**
 * The native picker shows a blank row rather than a zero-height one for the placeholder. React
 * Aria's non-breaking space, for the same reason.
 */
const BLANK_OPTION_LABEL = " ";

/** One `<option>`'s worth of data, derived from the widget's item source. */
interface HiddenSelectOption {
  /** The submitted string — `itemToValue(item)`, or `""` for the placeholder. */
  value: string;
  /** The option's visible text — the item source's `textValue`. */
  label: string;
}

export interface HiddenSelectProps<V = unknown> {
  /**
   * The widget state this field mirrors. Everything it renders and everything it writes back comes
   * from here: the option set (`indexed.items()`), the current selection (`formValues()`), the
   * native field configuration (`name`/`form`/`required`/`disabled`) and `selectionMode`.
   */
  state: CreateListboxReturn<V>;
  /**
   * The **visible** control this hidden field stands in for, focused when the browser reports the
   * field invalid — a listbox's list element, a Select's trigger. Without it a blocked submit
   * leaves focus wherever it was, with nothing on screen explaining why nothing happened.
   */
  triggerRef?: Accessor<HTMLElement | null | undefined>;
}

/**
 * The native form control behind a widget that has no native equivalent — one clipped, real
 * `<select>` (or, past {@link MAX_NATIVE_OPTIONS}, one `<input>` per selected value) carrying the
 * widget's selection into `FormData`. The kernel's second DOM-rendering member after
 * `ModalBackdrop`, and shared for the same reason: `Listbox` and a future `Select` need it
 * identically, and it is far too easy to reimplement as a bare `<input type="hidden">` that
 * silently drops `required`, `disabled` and form reset.
 *
 * ## What a real `<select>` buys over `<input type="hidden">`
 *
 * - **Browser autofill.** The browser matches the user's stored value against the `<option>`s, so
 *   the whole option set has to exist — including server-side. That is what makes the data-driven
 *   item source (`createDataCollection`) load-bearing rather than an implementation detail.
 * - **`required` that actually blocks submission.** A `<select required>` whose placeholder option
 *   is selected fails `valueMissing`. `<input type="hidden">` is *barred from constraint
 *   validation*, so `required` on it is silently ignored — the bug this primitive replaces.
 * - **`disabled` that removes the field from submission**, rather than a hand-written conditional.
 *
 * ## Rendering rules, each with a browser behind it
 *
 * - **Clipped, never `display: none` or `hidden`.** Safari skips a `display: none` `<select>` for
 *   autofill. See {@link VISUALLY_HIDDEN}.
 * - **Wrapped in a `<label>`.** Firefox identifies the `<select>` through its label; other engines
 *   make do with surrounding text.
 * - **`aria-hidden` on the container and `tabindex="-1"` on the control.** The widget already
 *   exposes the real semantics; this must not be announced or tabbed into.
 * - **A leading empty `<option>`.** It is the [placeholder label
 *   option](https://html.spec.whatwg.org/multipage/form-elements.html#placeholder-label-option) —
 *   what makes `required` fail while nothing is chosen.
 * - **Both `onChange` and `onInput`.** Engines disagree about which one a `<select>` fires.
 *
 * ## Opt-in via `name`
 *
 * With no `name` this renders nothing. A field with no name is never submitted and gives autofill
 * nothing to match on, so the alternative would be an `aria-hidden`, focusable `<select>` on every
 * listbox in the app in exchange for nothing. (React Aria renders it unconditionally; its Select
 * always has a field identity, ours does not.)
 *
 * Deliberately absent: the `render` prop and DOM-prop forwarding every `@hope-ui/components` part
 * owes its consumer. Nobody writes this in JSX — a component renders it — exactly as with
 * `ModalBackdrop`.
 */
export function HiddenSelect<V = unknown>(props: HiddenSelectProps<V>): JSX.Element {
  // The control `createHiddenSelect` listens on: the `<select>`, or the *first* `<input>` of the
  // fallback path (the only one carrying `required`, so the only one that can go invalid).
  const [control, setControl] = createSignal<HiddenFormControl | null>();

  /** The items keyed by their form value — how a native change event resolves back to a selection. */
  const itemByValue = createMemo(() => {
    const byValue = new Map<string, V>();
    for (const entry of props.state.indexed.items()) {
      const item = entry.value();
      const value = props.state.itemToValue(item);
      if (!byValue.has(value)) {
        byValue.set(value, item);
      }
    }
    return byValue;
  });

  /**
   * Every `<option>` the `<select>` contains, placeholder first — and deliberately the `<select>`'s
   * **only** child expression. Three sibling blocks would read more directly, and would crash: with
   * `hydratable: false` (a plain client app, and Storybook) the compiler emits the template with
   * `</option>` omitted, so the HTML parser nests the dynamic-child comment placeholders *inside*
   * the static `<option>` — "in select" insertion mode has no way to know the option ended — and the
   * generated `firstChild`/`nextSibling` walk hits `null`. A single dynamic child needs no
   * placeholder at all. The hydratable compile emits closing tags and does **not** reproduce it, so
   * no test in this repo can see it; Storybook is the only feedback loop that does.
   */
  const nativeOptions = createMemo<readonly HiddenSelectOption[]>(() => {
    const rows = props.state.indexed.items().map((entry) => ({
      value: props.state.itemToValue(entry.value()),
      label: entry.textValue(),
    }));
    // The option set can still be empty on the first render — data streaming in, or a server render
    // that resolves after this one. Emitting the current values anyway keeps the `<select>` (and
    // therefore a `FormData` read) correct immediately. Ported from React Aria, which carries the
    // same case for the same reason.
    const currentValues =
      rows.length === 0 ? props.state.formValues().map((value) => ({ value, label: value })) : [];
    // The leading empty option is HTML's *placeholder label option* — what makes `required` fail
    // while nothing is chosen.
    return [{ value: "", label: BLANK_OPTION_LABEL }, ...rows, ...currentValues];
  });

  const multiple = () => props.state.selectionMode() === "multiple";

  // React Aria's `value={state.value ?? ''}`, spelled as the option-level `selected` Solid actually
  // supports on both builds (a `value` attribute on `<select>` is inert HTML, so a server render
  // would carry no selection at all). A single `<select>` always has *something* selected, so an
  // empty selection selects the placeholder; a `multiple` one selects nothing.
  const selectedValues = createMemo(() => {
    const values = props.state.formValues();
    return new Set(multiple() ? values : [values[0] ?? ""]);
  });

  // The per-`<option>` `selected` below is the **server** channel, and the only one there is: a
  // `value` attribute on `<select>` is inert HTML, so nothing else can carry a selection into
  // server output. On the *client* it is a property write whose ordering against the `<select>`'s
  // own `multiple` is not guaranteed — options selected while `multiple` is still false collapse
  // to the last one, and a `multiple` field silently submits one value. So the live element is
  // synced here instead, after render, when both have settled.
  createEffect(
    () => {
      // Tracked but unread: the options mount after the `<select>` and are rebuilt wholesale when
      // the data changes, so the sync has to re-run with them.
      nativeOptions();
      return [control(), selectedValues()] as const;
    },
    ([element, values]) => {
      if (!(element instanceof HTMLSelectElement)) {
        return;
      }
      for (const option of element.options) {
        option.selected = values.has(option.value);
      }
    },
  );

  // Native semantics: `form.reset()` reverts a control to what its markup declared, which for a
  // widget is the selection it was created with — the `defaultValue` prop, or the initial
  // controlled `value`. Sampled once, here, because that is the moment the "markup" existed.
  const defaultSelection = untrack(() => props.state.value());

  createHiddenSelect<V[]>({
    element: control,
    defaultValue: () => defaultSelection,
    onReset: (value) => props.state.selection.setValue(value),
    focusTrigger: () => untrack(() => props.triggerRef?.())?.focus(),
  });

  /**
   * Autofill and the mobile picker both arrive here: the native control changed under us and the
   * widget has to follow. Values not in the option set (the placeholder's `""`) resolve to nothing
   * and are dropped, which is how "chose the blank row" becomes "cleared the selection".
   */
  const writeBack = (values: readonly string[]) =>
    untrack(() => {
      const byValue = itemByValue();
      props.state.selection.setValue(
        values.filter((value) => byValue.has(value)).map((value) => byValue.get(value) as V),
      );
    });

  const onNativeChange: JSX.EventHandler<HTMLSelectElement, Event> = (event) => {
    const select = event.currentTarget;
    writeBack(
      select.multiple
        ? Array.from(select.selectedOptions, (option) => option.value)
        : [select.value],
    );
  };

  /** The fallback path always renders at least one field, so `required` still has a control to fail on. */
  const fallbackValues = () => {
    const values = props.state.formValues();
    return values.length > 0 ? values : [""];
  };

  return (
    <Show when={props.state.name() != null}>
      <Show
        when={props.state.indexed.items().length <= MAX_NATIVE_OPTIONS}
        fallback={
          // `keyed={false}` so `index` is a plain number: only the first field takes the ref and
          // the `required` flag (React Aria's `i === 0 ? required : false`), and a reordering
          // `index` accessor would make that decision drift.
          <For each={fallbackValues()} keyed={false}>
            {(value, index) => (
              <input
                ref={index === 0 ? setControl : undefined}
                // `type="text"` behind `display: none`, never `type="hidden"`: a hidden input is
                // barred from constraint validation, so `required` on it would be ignored — the
                // whole point of this branch existing separately.
                type="text"
                style={{ display: "none" }}
                name={props.state.name()}
                form={props.state.form()}
                disabled={props.state.disabled()}
                required={index === 0 && props.state.required()}
                value={value()}
              />
            )}
          </For>
        }
      >
        <div aria-hidden="true" style={VISUALLY_HIDDEN}>
          {/* Firefox identifies the `<select>` through its label. It carries no text: the widget
          owns the accessible name, and this subtree is `aria-hidden` anyway. */}
          <label>
            <select
              ref={setControl}
              tabindex={-1}
              name={props.state.name()}
              form={props.state.form()}
              disabled={props.state.disabled()}
              required={props.state.required()}
              multiple={multiple()}
              onChange={onNativeChange}
              onInput={onNativeChange}
            >
              {/* One expression, never three sibling blocks — see `nativeOptions`. */}
              <For each={nativeOptions()}>
                {(option) => (
                  <option
                    value={option.value}
                    label={option.label}
                    selected={selectedValues().has(option.value)}
                  >
                    {option.label}
                  </option>
                )}
              </For>
            </select>
          </label>
        </div>
      </Show>
    </Show>
  );
}
