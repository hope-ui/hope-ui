# `getDefaultLocale` / `createDefaultLocale`

The browser/system default locale, as a plain snapshot (`getDefaultLocale`) and as a reactive
accessor that tracks `languagechange` (`createDefaultLocale`). Backs `I18nProvider` when no explicit
`locale` is passed, **and** the no-provider context default in `i18n-provider.tsx` — which is what
makes zero-config i18n safe to server-render.

## API

```ts
interface Locale { locale: string; direction: Direction }

function getDefaultLocale(): Locale;
function readDetectedLocale(): Locale;                                    // package-internal
function createDefaultLocale(): { locale: () => string; direction: () => Direction };
```

- `getDefaultLocale()` — reads `navigator.language` (or `en-US` off-browser), validated against
  `Intl.DateTimeFormat.supportedLocalesOf`, plus its reading direction. Ungated: the raw read.
- `readDetectedLocale()` — the gated, reactive read every consumer goes through. Not exported from
  the package barrel; `i18n-provider.tsx` imports it directly for the context default.
- `createDefaultLocale()` — a reactive `{ locale, direction }` that updates when the OS/browser
  language changes. **Needs no reactive owner** — its state lives in the shared registry, not in the
  caller — so the module-scope context default can read it.

## SSR / hydration (two improvements over the original source)

1. **Detection is gated on the hydration pass, not deferred unconditionally.**
   `readDetectedLocale()` returns `en-US`/`ltr` — what the server rendered — for exactly as long as
   `sharedConfig.hydrating` is set, then flips to the detected locale and re-renders whatever depends
   on it. Outside a hydration pass (a client-only app, or any component created after hydration
   finishes) the very first read is already the real locale, so nothing renders an `en-US`
   placeholder it has to replace.

   The gate is the whole SSR story, and the failure it prevents is *silent*: hydration reuses the
   server's DOM rather than re-deriving it, so a client that reported its own locale during the pass
   would leave markup contradicting its own state — no console warning, no replaced node. It shipped
   that way once: a prerendered `en-US` calendar (Sunday-first) hydrated by a `fr-FR` visitor
   (Monday-first) had every cell one day out of step with the model, so clicking "20" selected the
   21st and the previous selection stayed painted. Covered end-to-end by "Calendar locale hydration"
   in `packages/components/src/calendar/__tests__/calendar.browser.test.tsx`, and at the mechanism
   level by `default-locale.browser.test.tsx`.

   `sharedConfig.hydrating` is an undocumented Solid internal (1.x spelled it `sharedConfig.context`,
   and it lives in `solid-js` — `@solidjs/web` re-exports it in its *types* but not its runtime
   bundle). It is pinned by a characterization test in
   `packages/primitives/src/__tests__/solid-contract.browser.test.tsx`.

   The original source reads the real locale at module load, which a server-rendered page then
   contradicts.
2. **Dual-copy-safe shared state.** The locale signal, the hydration gate and the `languagechange`
   subscription live in a `Symbol.for("@hope-ui/i18n:locale-registry")` slot on `globalThis`, so two
   installed copies of `@hope-ui/i18n` observe one registry — the same reasoning as
   `createScrollLock`/`createHideOutside` storing their counts under a global symbol. Holding the
   locale as a *signal* there (rather than a plain snapshot plus a listener set fanned out to
   per-consumer signals) is what lets every consumer read shared state directly: one write on
   `languagechange`, no per-consumer subscription to register or tear down.

## Provenance

Derived from React Spectrum (`@react-aria/i18n`, Apache-2.0, © 2020 Adobe). See the CLAUDE.md
i18n provenance note.
