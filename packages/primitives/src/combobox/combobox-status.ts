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
 * Filtering is the one thing a combobox does that a screen reader cannot observe. The popup does not
 * move focus, the input's text is the user's own, and the list silently gets shorter — so without an
 * announcement, narrowing four hundred options down to two is indistinguishable from nothing
 * happening at all. React Aria's `useComboBox` announces exactly this (`countAnnouncement`), and it
 * is a11y rather than chrome, which is why it lives here and not in the component.
 *
 * ## Two channels, two moments, no double-announcement
 *
 * A live region only announces a change its assistive technology was already watching. This element
 * lives inside the popup, and the popup **mounts on open** — so at the one moment the count matters
 * most, the region and its text appear in the same commit and most screen readers say nothing.
 *
 * So the two announcements are split by moment, and they do not overlap:
 *
 * - **On open** — `createAnnounce`, whose live region is created against `document.body` and outlives
 *   every popup. This is the only channel that can work here, and it fires **once per open**.
 * - **On every later change** — the rendered `role="status"` region itself. By then it has been
 *   mounted for as long as the popup has, so a text change inside it is announced normally. Nothing
 *   imperative runs for this; it is what the element *is*.
 *
 * React Aria reaches for `announce()` in both cases only because it renders no region at all; the
 * split it makes internally (`didOpenWithoutFocusedItem || optionCount !== lastSize`) is the same
 * distinction, drawn in one channel instead of two.
 *
 * ## It is visible on purpose
 *
 * The count helps a sighted user too, and a visually-hidden region is one `display: none` away from
 * announcing nothing at all — Base UI's `ComboboxStatus` doc warns about exactly that. The component
 * layer styles it as a footer line; a consumer who wants it hidden can pass their own children or
 * their own class.
 *
 * ## The count is the filtered count, and this hook never learns that
 *
 * `state.list.focus.items()` is whatever `items` the root was handed. Combobox hands it the
 * **filtered** array, so this reads the filtered length without knowing a filter exists — which is
 * what keeps the kernel free of one (`combobox-root.md`).
 */
export function createComboboxStatus<V = unknown, M extends SelectionMode = "single">(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLElement>,
): CreateComboboxStatusReturn {
  const { t } = useLocale();

  const count = () => state.list.focus.items().length;
  const message = () => t("combobox.countAnnouncement", { count: count() });

  // `@solid-primitives/a11y`'s `createAnnounce` builds its live region with `document.createElement`,
  // guarded only by `isServer`. The `unit` test project runs the *client* build in Node (isServer is
  // false) with no `document`, so gate on `document` too: real announcer in a browser, no-op
  // otherwise.
  const announce = typeof document !== "undefined" ? createAnnounce() : () => {};

  // Keyed on `open` alone, and `message` is read untracked: this channel exists for the mount frame
  // the rendered region cannot cover (see the doc above), so a later count change must NOT re-enter
  // it — the region below already says that one, and announcing both would read the number twice.
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
