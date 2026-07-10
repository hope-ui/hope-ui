# `mount`

Mounts a Solid component tree into a detached, `document`-attached container for
browser-mode (Vitest + Playwright) tests, so tests can query real DOM/focus/layout.

## API

```ts
function mount(ui: () => unknown): { container: HTMLElement; dispose: () => void };
```

Call `dispose()` at the end of each test to unmount and remove the container — every
component test in this repo follows this pattern instead of each test file re-deriving
its own mount/cleanup boilerplate.

## Example

```ts
import { mount } from "@solid-zero/internal-test-utils";

const { container, dispose } = mount(() => <Button>Click me</Button>);
// ...assertions against `container` or `page` (Vitest browser context)...
dispose();
```

## It fails the test on a SolidJS reactivity diagnostic

While a tree is mounted, `mount` watches `console.warn`/`console.error` for two SolidJS
2.0 dev diagnostics, and `dispose()` throws if either was emitted:

| Code | What it means |
|---|---|
| `STRICT_READ_UNTRACKED` | A reactive value was read outside a tracking scope. |
| `REACTIVE_WRITE_IN_OWNED_SCOPE` | A descendant wrote to an ancestor-owned signal from its render body. |

`STRICT_READ_UNTRACKED` is the only diagnostic that catches the ref race CLAUDE.md
documents at length: a primitive that reads a conditionally-rendered element's ref on the
activating edge without tracking it in `compute` sees `undefined` forever, and Escape /
outside-click / the focus trap silently stop working — in the component, never in the
primitive's own tests. Before Wave 3 the browser suite emitted 170 known-benign warnings
per run, so the next real one would have scrolled past unread.

**A deliberate untracked read is spelled `untrack(...)`**, which suppresses the warning at
its source. Anything still emitting one is an unreviewed read, which is exactly the point.

`REACTIVE_WRITE_IN_OWNED_SCOPE` is *thrown* by Solid rather than logged, so it already
fails a test on its own — `mount` rethrows it out of the `mount()` call, restoring the
console on the way. It is watched here for the one case where Solid swallows the throw:
raised inside an effect, it comes back as `console.error(err)` with an `Error`, not a
string.

### How it behaves

- Diagnostics are **recorded, not thrown on sight.** Throwing from inside `console.warn`
  would land in whatever call stack Solid is in — a component body, an effect flush, an
  effect *cleanup*. Solid catches an effect's throw and, past a second failure, calls
  `haltReactivity()`, module-global state that would poison every later test in the file.
  `dispose()` is a checkpoint the test owns, outside any reactive flush.
- A matched diagnostic is **swallowed**, not re-printed: `dispose()` raises it as a test
  failure carrying the full text, so `pnpm test:browser 2>&1 | grep -c STRICT_READ_UNTRACKED`
  stays honest at zero. Everything else passes straight through, so a
  `vi.spyOn(console, "error")` in the test under way keeps seeing what it spied on.
- `mount()` also reports anything left pending by an earlier tree that was never disposed,
  rather than blaming the test that happens to dispose next.
