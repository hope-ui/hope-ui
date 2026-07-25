import { type Accessor, createEffect } from "solid-js";

/**
 * The writing direction a horizontal keymap mirrors against. Lives here rather than beside one of its
 * consumers because both navigation kernels and both hook families use it, and this module is where
 * the kernel reasons about direction at all.
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
   * Up/Down only, so a mismatch is unobservable and warning about it would be noise in every app that
   * simply hasn't set `dir` yet.
   */
  active?: Accessor<boolean>;
}

/**
 * Dev-only. Warns when the direction a component's **keymap** uses disagrees with the direction the
 * browser **lays that component out** in.
 *
 * Reading direction reaches a component down two independent channels, and hope-ui deliberately does
 * not join them (the same contract as Base UI's `DirectionProvider` and React Aria's `I18nProvider` —
 * neither writes a locale-derived `dir` to the DOM):
 *
 * - **Layout** mirrors from CSS `direction`, i.e. the `dir` attribute and its cascade. Every logical
 *   utility a recipe emits (`ps-`/`pe-`/`end-`/`rounded-s-`/`rtl:`) reads this, and so does a
 *   `<table>`'s column order.
 * - **Arrow keys** mirror from `useLocale().direction()` — the `I18nProvider` locale.
 *
 * Declare direction in one channel only and they disagree: `<I18nProvider locale="ar-EG">` with no
 * `dir` anywhere gives Arabic-Indic numerals and reversed arrows over a grid still laid out
 * left-to-right. That is the app under-declaring, not the library misbehaving — the fix is one line
 * (`document.documentElement.dir = getReadingDirection(locale())`) — but it is *silent*, which is
 * exactly the failure mode this repo keeps paying for in RTL. So say it out loud, in dev, naming both
 * readings and the fix.
 *
 * A `dir` prop is written straight to the element, so passing one can never trip this.
 *
 * **Scope of the check.** It re-runs when `direction`, `element`, or `active` changes — which covers
 * the realistic runtime flip, an app switching locale without updating the document. An *ancestor's*
 * `dir` changing while the locale stays put is **not** observed: computed style is not reactive, so
 * catching it would need a `MutationObserver` over the ancestor chain — more machinery than a dev
 * warning is worth.
 */
export function createTextDirectionWarning(options: CreateTextDirectionWarningOptions): void {
  createEffect(
    () => [options.direction(), options.element(), options.active?.() ?? true] as const,
    ([direction, element, active]) => {
      // `import.meta.env.DEV` is defined by the consumer's Vite (and vitest); cast locally so this
      // package needn't pull `vite/client` — and the whole asset-module surface — into
      // `compilerOptions.types`. Same shape as `@hope-ui/i18n`'s `warnMissing`.
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
