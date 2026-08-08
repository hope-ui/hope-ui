import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Button } from "../button";

// A second round-trip tree, this one carrying an icon *component* in the decorator slots rather than
// a plain host element. That is the shape that used to break hydration: a component arriving through
// a prop and read by a `<Show>` gate landed one position off from the server's, so hydration looked
// up the wrong node. The unconditional label slot was always immune; the gated decorators were not.
// Shared by the same three consumers as `button.ssr-entry.tsx` (bridge id "button-icons").

/** A leading/trailing icon expressed as a **component** — the shape that used to break hydration. */
function PlusIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** The label expressed as a **component**, covering the unconditional slot as well. */
function Label(): JSX.Element {
  return <>Add item</>;
}

/**
 * Passing the icons as props is what makes them lazy getters that construct the component *inside*
 * Button's gated slot spans — the exact path that has to stay hydratable.
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

/** Server builds only — under the client build `renderToStream` returns `undefined`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
