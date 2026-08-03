import { useLocale } from "@hope-ui/i18n";
import { createAnnounce } from "@solid-primitives/a11y";
import type { JSX } from "@solidjs/web";
import { type Accessor, createEffect, merge, untrack } from "solid-js";
import type { SelectionMode } from "../internal";
import type { CreateComboboxReturn } from "./combobox-root";

export interface CreateComboboxStatusReturn {
  /** Spread onto the status element. `role`/`aria-live`/`aria-atomic` are owned here; everything the
   *  consumer passes is forwarded. */
  props: JSX.HTMLAttributes<HTMLElement> & {
    role: "status";
    "aria-live": "polite";
    "aria-atomic": "true";
  };
  /** How many options the current filter left. The number the default message reports. */
  count: Accessor<number>;
  /** The localized default message (`combobox.countAnnouncement`) — the element's default children. */
  message: Accessor<string>;
}

/**
 * The status part: how many options the current filter left, both **shown** and **announced**.
 *
 * Filtering is the one thing a combobox does that a screen reader cannot observe — focus does not
 * move, the input's text is the user's own, and the list silently gets shorter. Without an
 * announcement, narrowing four hundred options to two is indistinguishable from nothing happening.
 * That makes it accessibility, not chrome, which is why it lives here rather than in the component.
 *
 * **Two channels, split by moment so they never double-announce.** A live region only announces
 * changes its assistive technology was already watching, and this element mounts *with* the popup —
 * so at the one moment the count matters most, region and text appear in the same commit and most
 * screen readers say nothing. Hence:
 *
 * - **On open**, an imperative announcement through a live region attached to `document.body`, which
 *   outlives every popup. It fires exactly once per open.
 * - **On every later change**, the rendered `role="status"` element itself, which by then has been
 *   mounted as long as the popup has. Nothing imperative runs for this; it is what the element *is*.
 *
 * **It is visible on purpose.** The count helps sighted users too, and a visually-hidden region is
 * one `display: none` away from announcing nothing at all. A consumer who wants it hidden passes
 * their own children or class.
 *
 * **The count is the filtered count, and this hook never learns that.** `state.list.focus.items()`
 * is whatever `items` the root was handed; Combobox hands it the already-filtered array, so this
 * reports the filtered length without any filter existing here.
 */
export function createComboboxStatus<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLElement>,
): CreateComboboxStatusReturn {
  const { t } = useLocale();

  const count = () => state.list.focus.items().length;
  const message = () => t("combobox.countAnnouncement", { count: count() });

  // `createAnnounce` builds its live region with `document.createElement`, guarded only by
  // `isServer`. The `unit` test project runs the *client* build under Node — `isServer` is false and
  // there is no `document` — so gate on `document` too: real announcer in a browser, no-op elsewhere.
  const announce = typeof document !== "undefined" ? createAnnounce() : () => {};

  // Depends on `open` alone, with `message` read outside the tracking scope on purpose: this channel
  // covers only the mount frame the rendered region cannot. A later count change must NOT re-enter
  // it, or the number gets read twice — once here and once by the region below.
  createEffect(
    () => state.open(),
    (isOpen) => {
      if (isOpen) {
        announce(untrack(message));
      }
    },
  );

  const elementProps = merge(props, {
    // Not forwardable, all three: this element *is* the live region, and a consumer overriding any
    // of them silently turns the announcement off.
    role: "status" as const,
    "aria-live": "polite" as const,
    "aria-atomic": "true" as const,
  });

  return { props: elementProps, count, message };
}
