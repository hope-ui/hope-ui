import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import { createSignal } from "solid-js";

// Live demo for "Alert dialog": the APG destructive-confirmation pattern. `role="alertdialog"` is set
// on `Root` and threaded to `Content`; the corner ✕ is dropped (`showCloseButton={false}`) so the two
// footer actions are the only exits — the user must make a deliberate choice.
export function DialogAlertDialogDemo() {
  const [open, setOpen] = createSignal(false);

  return (
    <Dialog.Root role="alertdialog" open={open()} onOpenChange={setOpen}>
      <Dialog.Trigger render={(p) => <Button {...(p as ButtonProps)}>Delete account</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content showCloseButton={false}>
            <Dialog.Header>
              <Dialog.Title>Delete your account?</Dialog.Title>
              <Dialog.Description>
                This erases your profile, projects, and billing history. It cannot be undone.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Button onClick={() => setOpen(false)}>Keep account</Button>
              <Button variant="solid" colorScheme="danger" onClick={() => setOpen(false)}>
                Delete account
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
