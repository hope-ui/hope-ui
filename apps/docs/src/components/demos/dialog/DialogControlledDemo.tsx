import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import { createSignal } from "solid-js";

// Live demo for "Open state". The same signal drives the dialog and an out-of-dialog status line +
// a second button, so the two-way binding (`open` + `onOpenChange`) is visible: opening from the
// trigger, the outside button, Escape, an outside click, or the corner ✕ all keep the label in sync.
export function DialogControlledDemo() {
  const [open, setOpen] = createSignal(false);

  return (
    <div class="not-prose flex flex-col items-center gap-3">
      <div class="flex items-center gap-3">
        <Dialog.Root open={open()} onOpenChange={setOpen}>
          <Dialog.Trigger render={(p) => <Button {...(p as ButtonProps)}>Open dialog</Button>} />
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Controlled dialog</Dialog.Title>
                  <Dialog.Description>
                    The parent owns <code>open</code>; every close path routes through{" "}
                    <code>onOpenChange</code>.
                  </Dialog.Description>
                </Dialog.Header>
                <Dialog.Body>
                  <p>Close me from the ✕, Escape, an outside click, or the button below.</p>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button onClick={() => setOpen(false)}>Done</Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Dialog.Portal>
        </Dialog.Root>
        <Button variant="soft" colorScheme="neutral" onClick={() => setOpen((v) => !v)}>
          Toggle from outside
        </Button>
      </div>
      <p class="text-sm text-foreground-muted">
        State: <b>{open() ? "open" : "closed"}</b>
      </p>
    </div>
  );
}
