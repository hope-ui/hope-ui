import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Dialog } from "../index";

// The single source of truth for Dialog's SSR → hydration round-trip tree, shared by
// `dialog.ssr.test.tsx` (renders it, inline-snapshots the bytes), `dialog.browser.test.tsx` (passes
// it to hydrateFixture and drives it open), and the hydration-fixture bridge (renders it server-side
// to feed the browser test). Reusing one tree is what enforces "structurally identical server and
// client" — hydration keys are a path through the component tree, so a component inserted before
// `Dialog.Trigger`, even one that renders nothing, would shift the trigger's key.
//
// `Dialog.Portal` renders nothing server-side and nothing while closed, so the server fixture is
// just the trigger `<button>`; the Backdrop/Content subtree still matters because it appears on the
// client once the dialog opens. `Dialog.CloseTrigger` now renders a recipe-styled `CloseButton`, so the
// tree sits under a `<ThemeProvider>` fed the `hope` preset — a zero-DOM provider (its values live in
// CSS), so the closed server output is still just the trigger, but the provider shifts `_hk` keys, so
// it must be present identically everywhere. See __internal__/theming.md.

/**
 * `defaultOpen` is optional so the ssr test can also exercise the open server render (its `Portal`
 * `isServer` guard must not crash `renderToStringAsync`, and its portaled content must stay absent
 * from the output). The hydration path uses the default — closed.
 */
export function Tree(props?: { defaultOpen?: boolean }): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Dialog.Root defaultOpen={props?.defaultOpen}>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Content>
            <Dialog.Title>Dialog title</Dialog.Title>
            <Dialog.Description>Dialog description</Dialog.Description>
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ThemeProvider>
  );
}

/** The closed server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
