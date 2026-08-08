import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Popover } from "../index";

// The single source of truth for Popover's server-render → hydration round-trip, shared by
// `popover.ssr.test.tsx` (snapshots the bytes), `popover.browser.test.tsx` (hydrates it and drives it
// open), and the fixture bridge that renders it server-side for that browser test.
//
// Reusing one definition is what enforces "structurally identical server and client": Solid pairs
// server and client nodes by a key derived from each node's *path through the component tree*, so a
// component inserted before `Popover.Trigger` — even one that renders nothing — shifts the trigger's
// key and breaks hydration. The `<ThemeProvider>` counts: it renders no DOM (hope's token values live
// in CSS) but it is a node on that path, so it must be present identically on both sides.
//
// `Popover.Portal` renders nothing on the server and nothing while closed, so the server output is
// just the trigger `<button>`. The Positioner/Content subtree still matters, because it appears on
// the client the moment the popover opens.

/**
 * `defaultOpen` is optional so the SSR test can also exercise the *open* server render: the Portal's
 * server guard must not crash `renderToStream`, and the portaled content must stay out of the
 * output. The hydration path uses the default — closed.
 */
export function Tree(props?: { defaultOpen?: boolean }): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Popover.Root defaultOpen={props?.defaultOpen}>
        <Popover.Trigger>Open popover</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Header>
                <Popover.Title>Popover title</Popover.Title>
                <Popover.Description>Popover description</Popover.Description>
              </Popover.Header>
              <Popover.CloseTrigger />
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </ThemeProvider>
  );
}

/** The closed server render the hydration-fixture bridge invokes. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
