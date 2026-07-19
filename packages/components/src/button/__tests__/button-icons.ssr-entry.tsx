import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Button } from "../button";

// The second source of truth for Button's SSR → hydration round-trip: a Button whose decorator slots
// hold an **icon component** (`<PlusIcon/>`), not a raw host element. This is the regression subject
// for the `<Show>`-gated lazy-component hydration bug (see __internal__/solid-2.0-notes.md): a component
// arriving via a consumer prop getter and read inside a `<Show>`-gated slot span used to compute a
// hydration key one off from the server's, so `hydrate()` looked up the wrong node. The label span
// (unconditional) was always immune; the decorators (inside `<Show>`) were not. Shared by three
// consumers exactly like `button.ssr-entry.tsx`:
//   - button-icons.ssr.test.tsx      inline-snapshots the server bytes
//   - button-icons.browser.test.tsx  hydrates the same `Tree`
//   - the hydration-fixture bridge (id "button-icons") renders it fresh for the browser half.

/** A leading/trailing icon expressed as a **component** — the shape that used to break hydration. */
function PlusIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** The label expressed as a **component** — covers a component in the (unconditional) label slot. */
function Label(): JSX.Element {
  return <>Add item</>;
}

/**
 * A Button carrying a component in **both** decorator slots and in its label. Icons are passed as
 * `startDecorator`/`endDecorator` props, so the consumer JSX compiles to lazy getters that create
 * the component *inside* Button's `<Show>`-gated slot spans — precisely the path the fix has to keep
 * hydratable. The component label proves the (always-immune, unconditional) label slot still hydrates
 * a component child too.
 */
export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Button startDecorator={<PlusIcon />} endDecorator={<PlusIcon />}>
        <Label />
      </Button>
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes (server builds only). */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
