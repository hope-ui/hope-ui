# `expectNoA11yViolations`

Runs `axe-core` against a mounted container and throws (with a readable summary) if any
accessibility **violation** — or any unreviewed **incomplete** result — is found.

## API

```ts
interface A11yCheckOptions {
  allowIncomplete?: readonly string[];
}

function expectNoA11yViolations(
  container: Element,
  options?: A11yCheckOptions,
): Promise<void>;
```

Every component's browser test should call this at least once (typically against the
`container` returned by [`mount`](../mount/mount.md)) so a baseline a11y check runs by
default for every component — this is the concrete mechanism that makes "accessibility
tests" part of the Definition of Done instead of best-effort review.

## Example

```ts
import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";

const { container, dispose } = mount(() => <Dialog open>...</Dialog>);
await expectNoA11yViolations(container);
dispose();
```

## `incomplete` results fail too

axe splits its output three ways: `passes`, `violations`, and `incomplete` — the rules it
ran but could not decide, and flags for a human. This helper used to read `violations` and
drop `incomplete` on the floor, so a whole category of "axe thinks a human should look at
this" was invisible to the suite.

Measured across the entire browser run before the change: **zero** `incomplete` results.
So failing on them costs nothing today and catches the next one — which is exactly the kind
of guard that only pays off if it lands before, not after, the thing it guards against.

### When axe genuinely cannot judge

Some rules are undecidable in a headless test rather than wrong — `color-contrast` against
a background axe cannot resolve is the usual one. Name the rule, at the call site, with a
reason:

```ts
await expectNoA11yViolations(container, {
  // The popup is positioned over a transparent backdrop, so axe cannot resolve the
  // effective background colour to compute a contrast ratio.
  allowIncomplete: ["color-contrast"],
});
```

Do this per call, never globally. An accepted `incomplete` is a documented gap that a
reviewer can see, not a passing check.
