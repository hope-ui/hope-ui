# `createCollator`

A memoized `Intl.Collator` for the current locale (`useLocale()`), reactive to locale changes.
Backs `createListTypeahead`'s accent/case-insensitive matching (`listbox-root.ts` passes
`createCollator({ usage: "search", sensitivity: "base" })`), and is the seam Combobox's filter
reuses for the same reason — `combobox-root.tsx` builds one with those same options.

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

## Rejected alternatives

### The `Symbol.for` dual-copy registry (`default-locale.ts`'s shape)
**Why not:** that registry exists to keep two installed copies of `@hope-ui/i18n` from disagreeing
about a *shared mutable resource* — one `languagechange` subscription, one signal, the same hazard
class as `createScrollLock`'s `document.body` ref count. A collator is immutable and purely a
function of `(locale, options)`, so two copies each keeping their own cache costs one duplicate
`Intl.Collator` construction, not a correctness divergence. React Aria's `useCollator` caches the
same way — module scope, no registry.

### `.toLowerCase().startsWith()` prefix matching
**Why not:** it folds case only, so `"café".startsWith("cafe")` is `false` and a typeahead user
typing unaccented ASCII never reaches an accented item. `usage: "search"` + `sensitivity: "base"`
folds diacritics as well — see *Why `sensitivity: "base"`* above.

### A normalization guard around the sliced-prefix compare
**Why not:** it would diverge from the exact expression `ListKeyboardDelegate.getKeyForSearch` and
`useFilter.ts` use, leaving hope-ui's matching semantics with no upstream to track. The
precomposed-vs-decomposed false negative is pinned by a test that names it rather than hidden behind
a guard — see *Matching against a sliced prefix* above.
**Revisit if:** React Aria normalizes its own comparison, or the false negative is reported against
real content rather than a constructed pair.
