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
