import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Badge } from "../badge";

// A second round-trip tree, this one carrying *components* in the decorator slots and the label
// rather than plain elements and text. That is the shape that used to break hydration: a component
// read by a `<Show>` gate landed one position off from the server's. Badge gates its label as well
// as its decorators, so all three are at risk. Same three consumers as `badge.ssr-entry.tsx`.

/** A leading/trailing icon expressed as a **component** — the shape that used to break hydration. */
function Dot(): JSX.Element {
  return (
    <svg viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="3" />
    </svg>
  );
}

/** The label expressed as a **component**; Badge gates its label, so this is at risk too. */
function Label(): JSX.Element {
  return <>Live</>;
}

export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Badge startDecorator={<Dot />} endDecorator={<Dot />}>
        <Label />
      </Badge>
    </ThemeProvider>
  );
}

/** Server builds only — under the client build `renderToStringAsync` returns `undefined`. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
