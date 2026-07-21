import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import { createSignal } from "solid-js";

// The canonical styled dialog for the "Usage" section: a trigger opens a centered card with a
// header (title + description), a body, and a footer action row, plus the auto corner ✕
// (`showCloseButton` defaults to `true`). Controlled via a signal so the footer's Cancel/Delete
// can close it. A hope `Button` is the trigger, rendered through `Dialog.Trigger`'s `render` prop —
// Solid types a native button's `disabled` wider than `Button` does, so the spread is cast.
export function DialogBasicDemo() {
  const [open, setOpen] = createSignal(false);

  return (
    <Dialog.Root open={open()} onOpenChange={setOpen}>
      <Dialog.Trigger render={(p) => <Button {...(p as ButtonProps)}>Delete project</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete project</Dialog.Title>
              <Dialog.Description>
                This permanently deletes <b>Acme Marketing Site</b> and everything inside it.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <p>Removed for every member of the workspace. This action cannot be undone.</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="solid" colorScheme="danger" onClick={() => setOpen(false)}>
                Delete project
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
