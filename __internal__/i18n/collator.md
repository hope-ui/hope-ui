# `createCollator`

A memoized `Intl.Collator` for the current locale (`useLocale()`), reactive to locale changes.
Backs `createListTypeahead`'s accent/case-insensitive matching (`listbox-root.ts` passes
`createCollator({ usage: "search", sensitivity: "base" })`), and is the seam Combobox's filter
(later work) reuses for the same reason.

## API

```ts
function createCollator(options?: Intl.CollatorOptions): Accessor<Intl.Collator>;
```

Reads `useLocale()` and returns a `createMemo` over `new Intl.Collator(locale(), options)` — rebuilt
whenever `locale()` changes, so a stale collator never survives an `I18nProvider` locale swap.
**Needs a reactive owner**, same as any `createMemo`.

## Caching

A plain module-level `Map`, keyed by locale + the options sorted and joined
(`react-aria`'s `useCollator` cache-key shape, `useCollator.ts`). Reusing a collator instance
matters — construction is measurably not free, and every typeahead/filter site asks with the same
`{ usage: "search", sensitivity: "base" }`.

This is deliberately **not** the `Symbol.for` dual-copy registry `default-locale.ts` uses for the
shared locale signal. That registry exists to keep two installed copies of `@hope-ui/i18n` from
disagreeing about a *shared mutable resource* — one `languagechange` subscription, one signal, the
same hazard class as `createScrollLock`'s `document.body` ref count. A collator is immutable and
purely a function of `(locale, options)`: two copies each keeping their own cache costs one
duplicate `Intl.Collator` construction, not a correctness divergence. A plain module `Map` is the
right shape here, not an instance of the hazard the registry guards against.

## Why `sensitivity: "base"`

`usage: "search"` + `sensitivity: "base"` folds **both** case and diacritics — `cafe` matches
`Café`, which `.toLowerCase().startsWith()` cannot do (it only folds case: `"café".startsWith("cafe")`
is `false`). Every react-aria typeahead/filter site uses exactly these options
(`ListKeyboardDelegate.ts`'s `getKeyForSearch`, `useFilter.ts`).

## Matching against a sliced prefix — a known, accepted limitation

Callers compare with `collator.compare(textValue.slice(0, query.length), query) === 0` — the exact
expression `ListKeyboardDelegate.getKeyForSearch` and `useFilter.ts` use. `String.prototype.slice`
counts UTF-16 code units; the collator compares collation elements. When the query and the matched
text normalize differently (a precomposed accented character on one side, a decomposed base
letter + combining mark on the other), slicing by `query.length` code units can cut the target
mid-grapheme and compare a truncated fragment, producing a false negative. React Aria ships this
exact `slice` and lives with it; hope-ui matches it rather than adding a normalization guard no
upstream implementation carries — see `create-list-typeahead.browser.test.tsx`'s test naming this
case for where the boundary sits.

## SSR

`useLocale()` is safe with no `I18nProvider` mounted — it reports the detected browser/system
locale (hydration-gated, see `default-locale.md`) rather than throwing. `createCollator` inherits
that: it works in a bare tree, and `Intl.Collator` itself has no DOM dependency, so this needs no
SSR-specific handling beyond the locale it reads.
