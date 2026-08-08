import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Dialog } from "../index";

// One tree, three consumers: `dialog.ssr.test.tsx` snapshots its server bytes,
// `dialog.browser.test.tsx` hydrates it, and the hydration-fixture bridge renders it server-side to
// feed that browser test. Sharing one definition is what keeps the server and client trees identical
// — Solid matches their nodes by position, so a component inserted before `Dialog.Trigger`, even one
// that renders nothing, shifts its key and breaks hydration.
//
// `Dialog.Portal` renders nothing on the server and nothing while closed, so the fixture is just the
// trigger `<button>`; the Backdrop/Content subtree still matters because it appears on the client
// once the dialog opens. The `<ThemeProvider>` is required by the styled `Dialog.CloseTrigger`; it
// emits no DOM of its own, but it *does* shift node positions, so it must be present identically in
// both halves.

/**
 * `defaultOpen` is optional so the SSR test can also render the open state: its portal must not
 * crash `renderToStream`, and its portaled content must stay out of the output. The hydration
 * path uses the default — closed.
 */
export function Tree(props?: { defaultOpen?: boolean }): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Dialog.Root defaultOpen={props?.defaultOpen}>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Dialog title</Dialog.Title>
                <Dialog.Description>Dialog description</Dialog.Description>
              </Dialog.Header>
              <Dialog.Body>Dialog body</Dialog.Body>
              {/* No explicit CloseTrigger — `Content` auto-renders one (showCloseButton defaults true).
              An explicit one too would give the dialog two "Close" buttons. */}
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Portal>
      </Dialog.Root>
    </ThemeProvider>
  );
}

/** The closed server render the hydration-fixture bridge invokes. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
