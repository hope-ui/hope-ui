# `createComboboxStatus`

The result-count part of the [combobox hook family](combobox-root.md): how many options the current
filter left, both **shown** and **announced**.

```ts
function createComboboxStatus<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLElement>,
): {
  props: JSX.HTMLAttributes<HTMLElement> & {
    role: "status";
    "aria-live": "polite";
    "aria-atomic": "true";
  };
  count: Accessor<number>;
  message: Accessor<string>;
};
```

## Why the kernel owns an announcement at all

Filtering is the one thing a combobox does that a screen reader cannot observe. Focus does not move
(the input keeps it), the input's text is the user's own keystrokes, and the list silently gets
shorter. Without an announcement, narrowing four hundred options to two is indistinguishable from
nothing happening.

That makes it a11y rather than chrome, which is what puts it here instead of in `Combobox.Status`.
React Aria's `useComboBox` announces exactly this string (`countAnnouncement`).

## Two channels, two moments, no double-announcement

A live region only announces a change its assistive technology was already watching. This element
lives inside the popup, and **the popup mounts on open** — so at the one moment the count matters
most, the region and its text appear in the same commit and most screen readers say nothing. (Base
UI's `ComboboxStatus` documents the same hazard from the other side: *keep the element mounted, change
only its children*. This family cannot, because nothing renders until open.)

So the two channels are split by moment, and they do not overlap:

| Moment | Channel |
| --- | --- |
| the popup **opens** | `createAnnounce` — its live region is built against `document.body` and outlives every popup |
| every **later** count change | the rendered `role="status"` element itself, mounted since the open |

The `createAnnounce` effect is keyed on `open()` alone and reads `message` **untracked**, which is
what keeps it to one announcement per open. React Aria reaches for `announce()` in both cases only
because it renders no region at all; the split it makes internally
(`didOpenWithoutFocusedItem || optionCount !== lastSize`) is the same distinction drawn in one channel
instead of two.

## The `typeof document` guard

`@solid-primitives/a11y`'s `createAnnounce` builds its live regions with `document.createElement`,
guarded only by `isServer`. The `unit` test project runs the **client** build in Node — `isServer` is
`false` and there is no `document` — so the guard here is on `document`, not on `isServer`. Real
announcer in a browser, no-op everywhere else. `calendar-root.ts` carries the identical line.

## The count is the filtered count, and this hook never learns that

`count()` is `state.list.focus.items().length` — whatever `items` the root was handed. Combobox hands
it the **filtered** array, so this reports the filtered length without knowing a filter exists. That
is what keeps the kernel free of one (`combobox-root.md`), and it means a Select composing this hook
would get an honest total with no extra wiring.

## `role`, `aria-live` and `aria-atomic` are not forwardable

All three are merged **after** the consumer's props. This element *is* the live region; a consumer
overriding any of them silently turns the announcement off, which is the class of bug nothing catches.

Everything else the consumer passes is forwarded, and `message()` is exposed so the component layer
can render it as the default children — or let a consumer replace it.

## It is visible on purpose

The count helps a sighted user too, and a visually-hidden live region is one `display: none` away from
announcing nothing at all. The component layer styles it as a footer line inside the card, beside —
never inside — the `role="listbox"` element, which may only contain options and groups.

## SSR

Nothing renders: the popup is closed on the server, so this part never mounts. The `typeof document`
guard means the announcer is a no-op even if it did.

## Rejected alternatives

### `createAnnounce` alone, with no rendered live region
**Why not:** it is react-aria's shape, and it makes the count invisible — a sighted user filtering a
long list gets no confirmation that anything narrowed. It also leaves the consumer no element to
style or to replace, so "3 résultats" would have to go through the message catalog rather than through
`children`.

### A rendered `role="status"` alone, with no `createAnnounce`
**Why not:** it misses the announcement that matters most. The region mounts with its text already in
place, and a region introduced in the same commit as its content is not reliably announced — which is
precisely the open, where the user has just learned nothing about how many options they are looking
at.

### Keeping the region mounted while closed, as Base UI recommends
**Why not:** it contradicts the family's hard rule that **nothing renders until open** (decision 8) —
tabbing a form with ten Comboboxes would mount ten live regions. Base UI can recommend it because its
popup is not the boundary; here it is, and `createAnnounce`'s body-level region is the mounted-forever
element that advice is really asking for.

### Announcing the focused option's text as well, as react-aria does on Apple devices
**Why not:** it is a platform workaround (VoiceOver mis-announcing `aria-activedescendant` changes,
especially on iOS), gated on `isAppleDevice()`. Porting it means porting the platform sniff and owning
its drift, for a bug this project has not measured. The activedescendant channel is correct ARIA and
is what every other AT follows.

**Revisit if:** VoiceOver's activedescendant handling is confirmed broken against this
implementation on a real device.

### Announcing on every count change through `createAnnounce`
**Why not:** the rendered region already announces those, so it would read the number twice. Pinned
by a test that asserts the body-level region's text does not change while the popup stays open.
