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
 * less than several hundred `<option>` nodes server-rendered on every request. React Aria's cutoff,
 * kept verbatim.
 */
const MAX_NATIVE_OPTIONS = 300;

/**
 * The clip technique, **not** `display: none` / `hidden`: Safari skips a `display: none` `<select>`
 * for autofill entirely, which is the one thing a real `<select>` exists to provide. `position:
 * fixed` at the viewport origin so a 1px box inside a scrolled container cannot extend the scroll
 * area. From React Aria's `useVisuallyHidden`, with the physical offsets respelled logical.
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

/** A non-breaking space, so the native picker shows a blank row rather than a zero-height one. */
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
 * widget's selection into `FormData`.
 *
 * A real `<select>` rather than the obvious `<input type="hidden">`, which is *barred from
 * constraint validation*: `required` on one is silently ignored, so submission is never blocked.
 * A `<select>` also gives the browser real `<option>`s to autofill against — which is why the
 * whole option set has to exist, server-side included — and honours `disabled` by dropping itself
 * from submission.
 *
 * Every rendering rule here has a browser behind it, so none of them is safe to simplify:
 * clipped rather than `display: none` (Safari skips a `display: none` `<select>` for autofill —
 * see {@link VISUALLY_HIDDEN}); wrapped in a `<label>` (Firefox identifies the control through
 * it); `aria-hidden` + `tabindex="-1"` (the widget already exposes the real semantics); a leading
 * empty [placeholder label
 * option](https://html.spec.whatwg.org/multipage/form-elements.html#placeholder-label-option)
 * (what makes `required` fail while nothing is chosen); both `onChange` and `onInput` (engines
 * disagree about which a `<select>` fires).
 *
 * With no `name` it renders nothing: an unnamed field is never submitted and gives autofill
 * nothing to match on, so rendering it anyway would put a focusable `<select>` on every listbox in
 * the app in exchange for nothing.
 *
 * No `render` prop and no DOM-prop forwarding, unlike every `@hope-ui/components` part: nobody
 * writes this in JSX, a component renders it — same as `ModalBackdrop`. Full rationale:
 * `__internal__/primitives/hidden-select/hidden-select.md`.
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
   * Every `<option>`, placeholder first — and deliberately the `<select>`'s **only** child
   * expression. Splitting it into sibling blocks reads better and crashes at runtime: compiled
   * without hydration support (a plain client app, and Storybook) Solid omits `</option>` from the
   * template, so the HTML parser nests the comment placeholders it emits for each dynamic child
   * *inside* the static `<option>` — "in select" insertion mode cannot tell the option ended — and
   * the generated `firstChild`/`nextSibling` walk then hits `null`. One dynamic child needs no
   * placeholder, so it sidesteps this. The hydratable compile emits closing tags and does not
   * reproduce the bug, so no test here can catch a regression; Storybook is the only feedback loop.
   */
  const nativeOptions = createMemo<readonly HiddenSelectOption[]>(() => {
    const rows = props.state.indexed.items().map((entry) => ({
      value: props.state.itemToValue(entry.value()),
      label: entry.textValue(),
    }));
    // The option set can still be empty on the first render — data streaming in, or a server render
    // that resolves after this one. Emitting the current values anyway keeps a `FormData` read
    // correct immediately rather than a tick later.
    const currentValues =
      rows.length === 0 ? props.state.formValues().map((value) => ({ value, label: value })) : [];
    return [{ value: "", label: BLANK_OPTION_LABEL }, ...rows, ...currentValues];
  });

  const multiple = () => props.state.selectionMode() === "multiple";

  // A single `<select>` always has *something* selected, so an empty selection falls back to the
  // placeholder; a `multiple` one selects nothing.
  const selectedValues = createMemo(() => {
    const values = props.state.formValues();
    return new Set(multiple() ? values : [values[0] ?? ""]);
  });

  // The per-`<option>` `selected` below is the **server** channel, and the only one: a `value`
  // attribute on `<select>` is inert HTML, so nothing else can carry a selection into server
  // output. On the client it is a property write whose ordering against the `<select>`'s own
  // `multiple` is not guaranteed, and options selected while `multiple` is still false collapse to
  // the last one — a multi-select field that silently submits one value. So the live element is
  // re-synced here after render, once both have settled.
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

  // `form.reset()` reverts a control to what its markup declared, which for a widget is the
  // selection it was created with. Sampled once, here, because this is that moment.
  const defaultSelection = untrack(() => props.state.value());

  createHiddenSelect<V[]>({
    element: control,
    defaultValue: () => defaultSelection,
    onReset: (value) => props.state.selection.setValue(value),
    focusTrigger: () => untrack(() => props.triggerRef?.())?.focus(),
  });

  /**
   * Autofill and the mobile picker both land here: the native control changed under us and the
   * widget has to follow. A value not in the option set — the placeholder's `""` — resolves to
   * nothing and is dropped, which is how "chose the blank row" becomes "cleared the selection".
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
          // the `required` flag, and an `index` accessor that shifts on reorder would let that
          // decision drift onto a different field.
          <For each={fallbackValues()} keyed={false}>
            {(value, index) => (
              <input
                ref={index === 0 ? setControl : undefined}
                // `type="text"` behind `display: none`, never `type="hidden"`: a hidden input is
                // barred from constraint validation, so `required` on it would be ignored.
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
          {/* Firefox identifies the `<select>` through its label. Textless on purpose: the widget
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
