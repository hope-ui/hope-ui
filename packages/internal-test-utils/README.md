# @hope-ui/internal-test-utils

The shared test harness for [hope-ui](../../README.md). **Private and internal** — it is not
published (`"private": true`), has no build step (consumers resolve its `src/` directly), and exists
only so every workspace package's tests share one `mount` + a11y + hydration harness. Not part of
the public API.

Consumed by the tests of `@hope-ui/primitives`, `@hope-ui/theming`, and `@hope-ui/components` as a
`workspace:*` dev dependency.

## Exports

| Export | Purpose |
| ------ | ------- |
| `mount(...)` | Renders a component into a detached, document-attached container (for the `browser` project). **Fails the test** on a `STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic — a deliberate untracked read must be spelled `untrack(...)`. Returns a `MountedComponent`. |
| `expectNoA11yViolations(...)` | Runs axe-core against a mounted container. Fails on axe **violations** *and* on **`incomplete`** results; a genuinely undecidable check is named in `allowIncomplete` at the call site with a reason, never silenced by category. |
| `hydrateFixture(...)` | Hydrates genuine server HTML and asserts no `console.error`/`console.warn`, no element added or dropped, and that every surviving node is the *same object* as the server's (so a silent client-render fallback can't masquerade as success). Returns a `HydratedComponent`. |

Types `MountedComponent` and `HydratedComponent` are exported alongside.

## Usage

```tsx
import { mount, expectNoA11yViolations } from "@hope-ui/internal-test-utils";

it("has no a11y violations", async () => {
  const { container } = mount(() => <Button>Save</Button>);
  await expectNoA11yViolations(container);
});
```

Every browser test that calls `mount()` must call `expectNoA11yViolations` at least once — this is
enforced by `pnpm check:coverage-parity`.

## Docs

Per-helper docs: [`__internal__/internal-test-utils/`](../../__internal__/internal-test-utils/)
(`mount`, `axe`). The testing stack, the three Vitest projects, and the hydration bridge are
explained in [`__internal__/testing.md`](../../__internal__/testing.md); the enforced rules are in
[`__internal__/definition-of-done.md`](../../__internal__/definition-of-done.md).

## License

MIT.
