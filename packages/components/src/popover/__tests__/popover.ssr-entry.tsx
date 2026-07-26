import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Popover } from "../index";

// The single source of truth for Popover's SSR → hydration round-trip tree, shared by
// `popover.ssr.test.tsx` (renders it, inline-snapshots the bytes), `popover.browser.test.tsx` (passes
// it to hydrateFixture and drives it open), and the hydration-fixture bridge (renders it server-side
// to feed the browser test). Reusing one tree is what enforces "structurally identical server and
// client" — hydration keys are a path through the component tree, so a component inserted before
// `Popover.Trigger`, even one that renders nothing, would shift the trigger's key.
//
// `Popover.Portal` renders nothing server-side and nothing while closed, so the server fixture is
// just the trigger `<button>`; the Positioner/Content subtree still matters because it appears on the
// client once the popover opens. `Popover.CloseTrigger` renders a recipe-styled `CloseButton`, so the
// tree sits under a `<ThemeProvider>` fed the `hope` preset — a zero-DOM provider (its values live in
// CSS), so the closed server output is still just the trigger, but the provider shifts `_hk` keys, so
// it must be present identically everywhere. See __internal__/theming.md.
//
// The `Popover.Title` is not decoration: `role="dialog"` with no accessible name is an axe
// `aria-dialog-name` violation, so every tree in this suite carries a Title or an `aria-label`.

/**
 * `defaultOpen` is optional so the ssr test can also exercise the open server render (its `Portal`
 * `isServer` guard must not crash `renderToStringAsync`, and its portaled content must stay absent
 * from the output). The hydration path uses the default — closed.
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
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
