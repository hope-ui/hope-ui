/**
 * @license
 * Portions of this file are derived from Adobe React Spectrum: `@react-aria/utils`,
 * `src/useFormReset.ts` (the form-scoped `reset` listener that restores an initial value), and
 * `@react-aria/form`, `src/useFormValidation.ts` (the `invalid` listener that cancels the
 * browser's error UI, and the first-invalid-control scan that decides whether to take focus).
 * Copyright 2023 Adobe. All rights reserved.
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

import { type Accessor, createEffect, untrack } from "solid-js";

/** The two native controls a hidden field is ever built from. Both are constraint-validated. */
export type HiddenFormControl = HTMLSelectElement | HTMLInputElement;

export interface CreateHiddenSelectOptions<T> {
  /**
   * The hidden control that stands in for the widget — the `<select>`, or the **first** `<input>`
   * of the fallback path. Must be a real signal accessor: the control is rendered as a reactive
   * consequence of `name` (and of the option count crossing the `<select>` cutoff), so an
   * untracked read would catch it still `undefined`, forever.
   */
  element: Accessor<HiddenFormControl | null | undefined>;
  /**
   * The value to restore when the owning `<form>` is reset. Native semantics: a control reverts
   * to what its markup declared, which for a widget is the selection it was created with.
   */
  defaultValue: Accessor<T>;
  /** Called with `defaultValue()` on the owning form's `reset`. */
  onReset?: (value: T) => void;
  /**
   * Focuses the **visible** control this hidden field stands in for — a listbox's list element, a
   * Select's trigger. Called when the browser reports the field invalid and this is the form's
   * first invalid control.
   */
  focusTrigger?: () => void;
}

/**
 * The first control in `form` whose constraints are currently unsatisfied, or `null`. This is what
 * the browser itself focuses on a blocked submit, so matching it is what keeps a hidden field from
 * stealing focus from an earlier field the user has to fix first.
 */
function firstInvalidControl(form: HTMLFormElement): Element | null {
  for (const element of form.elements) {
    if ((element as HTMLInputElement).validity?.valid === false) {
      return element;
    }
  }
  return null;
}

/**
 * The two native-form behaviors a hidden field owes its widget, neither of which comes for free
 * once the real control is clipped out of sight:
 *
 * 1. **Reset.** `form.reset()` reverts the hidden control's own DOM state, and nothing tells the
 *    widget its selection just changed. A `reset` listener on the owning form calls `onReset` with
 *    `defaultValue()` so the two stay in step.
 * 2. **Invalid.** A blocked submit fires `invalid` on the offending control, and the browser then
 *    tries to anchor a validation bubble to it — a 1px clipped `<select>`, or a `display: none`
 *    `<input>` it refuses to point at at all ("An invalid form control is not focusable"). So the
 *    listener cancels the report and moves focus somewhere a user can see. **Cancelling `invalid`
 *    suppresses the report, never the constraint** — submission stays blocked either way.
 *
 * Focus is taken **only when this is the form's first invalid control**: a form with an empty
 * required text field above this one must land on that field, not here.
 *
 * Deliberately out of scope: `setCustomValidity` and realtime validation errors. Surfacing an
 * error message is a `Field`'s job, not a hidden field's.
 *
 * ## SSR
 *
 * Everything is inside `createEffect`, which never runs server-side — no listener is attached and
 * no DOM is touched during a server render.
 */
export function createHiddenSelect<T>(options: CreateHiddenSelectOptions<T>): void {
  createEffect(
    () => options.element(),
    (element) => {
      if (element == null) {
        return;
      }
      // Sampled with the element: a control that is moved to a different form is remounted, which
      // re-runs this effect with a fresh `element`. React Aria samples it the same way.
      const form = element.form;

      const onReset = (event: Event) => {
        if (event.defaultPrevented) {
          return;
        }
        // A deliberate current-value sample, not a dependency — tracking it here would tear down
        // and reattach the listeners on every selection change. Spelled `untrack` because
        // `form.reset()` can be called from inside an effect, where the read would otherwise trip
        // `[STRICT_READ_UNTRACKED]` (the same argument `createDismissable` makes for `exclude`).
        options.onReset?.(untrack(() => options.defaultValue()));
      };

      const onInvalid = (event: Event) => {
        if (!event.defaultPrevented && form && firstInvalidControl(form) === element) {
          options.focusTrigger?.();
        }
        event.preventDefault();
      };

      element.addEventListener("invalid", onInvalid);
      form?.addEventListener("reset", onReset);

      return () => {
        element.removeEventListener("invalid", onInvalid);
        form?.removeEventListener("reset", onReset);
      };
    },
  );
}
