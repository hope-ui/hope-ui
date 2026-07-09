# `expectNoA11yViolations`

Runs `axe-core` against a mounted container and throws (with a readable violation
summary) if any accessibility violation is found.

## API

```ts
function expectNoA11yViolations(container: Element): Promise<void>;
```

Every component's browser test should call this at least once (typically against the
`container` returned by [`mount`](./mount.md)) so a baseline a11y check runs by default
for every component — this is the concrete mechanism that makes "accessibility tests"
part of the Definition of Done instead of best-effort review.

## Example

```ts
import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";

const { container, dispose } = mount(() => <Dialog open>...</Dialog>);
await expectNoA11yViolations(container);
dispose();
```
