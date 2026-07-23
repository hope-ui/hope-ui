import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { ZagDialog } from "../index";

// The single source of truth for ZagDialog's SSR → hydration round-trip tree, shared by
// `zag-dialog.ssr.test.tsx` (renders it, inline-snapshots the bytes), `zag-dialog.browser.test.tsx`
// (passes it to hydrateFixture and drives it open), and the hydration-fixture bridge. Structurally
// identical to `dialog.ssr-entry.tsx`, part for part, so the two stacks' server output can be
// compared directly.
//
// The interesting question here is `useMachine`: the adapter starts the machine in `onSettled` and
// holds its state in a boxed `bindable` signal, so a server render must yield the *initial* state
// with no effect having run — and the `createUniqueId()` the machine's scope id comes from has to
// land on the same `_hk`-adjacent counter on both sides, or every `dialog:<id>:<part>` id diverges.

/**
 * `defaultOpen` is optional so the ssr test can also exercise the open server render (its `Portal`
 * `isServer` guard must not crash `renderToStringAsync`, and its portaled content must stay absent
 * from the output). The hydration path uses the default — closed.
 */
export function Tree(props?: { defaultOpen?: boolean }): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <ZagDialog.Root defaultOpen={props?.defaultOpen}>
        <ZagDialog.Trigger>Open dialog</ZagDialog.Trigger>
        <ZagDialog.Portal>
          <ZagDialog.Backdrop />
          <ZagDialog.Positioner>
            <ZagDialog.Content>
              <ZagDialog.Header>
                <ZagDialog.Title>Dialog title</ZagDialog.Title>
                <ZagDialog.Description>Dialog description</ZagDialog.Description>
              </ZagDialog.Header>
              <ZagDialog.Body>Dialog body</ZagDialog.Body>
            </ZagDialog.Content>
          </ZagDialog.Positioner>
        </ZagDialog.Portal>
      </ZagDialog.Root>
    </ThemeProvider>
  );
}

/** The closed server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
