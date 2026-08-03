import { type Accessor, createEffect } from "solid-js";

/**
 * The writing direction a horizontal keymap mirrors against. It lives in this module, rather than
 * beside any one consumer, because every list and grid navigation primitive needs it.
 */
export type TextDirection = "ltr" | "rtl";

export interface CreateTextDirectionWarningOptions {
  /** The component named in the message — `"Listbox"`, `"Calendar"`. */
  name: string;
  /** The direction the keymap mirrors against: the consumer's `dir`, else `useLocale().direction()`. */
  direction: Accessor<TextDirection>;
  /** The element the keymap drives. Its *applied* direction is what the user actually sees. */
  element: Accessor<HTMLElement | null | undefined>;
  /**
   * Whether direction can change behavior here at all. Default `true`. A **vertical** listbox maps
   * Up/Down only, so a mismatch there is unobservable, and warning about it would be noise in every
   * app that simply hasn't set `dir` yet.
   */
  active?: Accessor<boolean>;
}

/**
 * Dev-only. Warns when the reading direction a component's **keymap** mirrors against disagrees with
 * the direction the browser **lays that component out** in.
 *
 * The two arrive down separate channels, which hope-ui deliberately leaves unjoined — as do the
 * React libraries Base UI and React Aria, neither of which writes a locale-derived `dir` to the DOM:
 *
 * - **Layout** mirrors from CSS `direction`, i.e. the `dir` attribute and its cascade. That is what
 *   every logical utility (`ps-`/`pe-`/`end-`/`rounded-s-`) and a `<table>`'s column order read.
 * - **Arrow keys** mirror from the locale, via `useLocale().direction()`.
 *
 * Declare only one and they disagree: an Arabic locale with no `dir` anywhere reverses the arrow
 * keys over a grid still laid out left to right. The app is under-declaring rather than the library
 * misbehaving, and the fix is the one line quoted in the warning below — but nothing about it is
 * visible without this, and a silent mismatch is how right-to-left bugs reach production. Passing
 * `dir` to the component can never trip it: that value goes straight onto the element.
 *
 * An *ancestor's* `dir` changing while the locale stays put is not caught — computed style is not
 * reactive, so it would take a `MutationObserver` over the whole ancestor chain, which is more than
 * a dev warning is worth. More in __internal__/primitives/internal/create-text-direction-warning.md.
 */
export function createTextDirectionWarning(options: CreateTextDirectionWarningOptions): void {
  createEffect(
    () => [options.direction(), options.element(), options.active?.() ?? true] as const,
    ([direction, element, active]) => {
      // `import.meta.env.DEV` comes from the consumer's Vite. Cast locally so this package needn't
      // add `vite/client` — and every asset-module type with it — to `compilerOptions.types`.
      const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
      if (!isDev || !active || !element) {
        return;
      }

      const applied = getComputedStyle(element).direction;
      // A detached element reports `""`; it has no layout to disagree with yet.
      if (applied !== "ltr" && applied !== "rtl") {
        return;
      }
      if (applied === direction) {
        return;
      }

      console.warn(
        `[hope-ui] ${options.name}: its arrow keys mirror "${direction}" (from the locale) but the ` +
          `browser lays it out "${applied}", so navigation will run opposite to what the user sees. ` +
          "Reading direction reaches the DOM only through the cascade: set `dir` on your document " +
          "root (`document.documentElement.dir = getReadingDirection(locale())`), or pass " +
          `\`dir="${direction}"\` to this component.`,
      );
    },
  );
}
