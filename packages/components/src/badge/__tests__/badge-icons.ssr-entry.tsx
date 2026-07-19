import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Badge } from "../badge";

// The second source of truth for Badge's SSR → hydration round-trip: a Badge whose decorator slots
// AND label hold **components**, not host elements / text. This is the regression subject for the
// `<Show>`-gated lazy-component hydration bug (see docs/solid-2.0-notes.md). Unlike Button, Badge's
// label is itself `<Show>`-gated, so a component in the label is as much at risk as one in a
// decorator. Shared by three consumers exactly like `badge.ssr-entry.tsx`:
//   - badge-icons.ssr.test.tsx      inline-snapshots the server bytes
//   - badge-icons.browser.test.tsx  hydrates the same `Tree`
//   - the hydration-fixture bridge (id "badge-icons") renders it fresh for the browser half.

/** A leading/trailing icon expressed as a **component** — the shape that used to break hydration. */
function Dot(): JSX.Element {
  return (
    <svg viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="3" />
    </svg>
  );
}

/** The label expressed as a **component** — Badge's label slot is `<Show>`-gated, so this is at risk. */
function Label(): JSX.Element {
  return <>Live</>;
}

/** A Badge carrying a component in both decorator slots and in its label. */
export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Badge startDecorator={<Dot />} endDecorator={<Dot />}>
        <Label />
      </Badge>
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes (server builds only). */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
