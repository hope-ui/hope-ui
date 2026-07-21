import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import { createSignal } from "solid-js";

// Live demo for "Dismissal": disabling both light-dismiss paths. `closeOnEscape={false}` +
// `closeOnInteractOutside={false}` (forwarded to the primitive's dismiss layer) mean neither Escape
// nor a scrim click closes the dialog — a footer button is the only way out. Reserve this for a
// choice the user genuinely must make.
export function DialogNonDismissibleDemo() {
  const [open, setOpen] = createSignal(false);

  return (
    <Dialog.Root
      open={open()}
      onOpenChange={setOpen}
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      <Dialog.Trigger render={(p) => <Button {...(p as ButtonProps)}>Accept the terms</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content showCloseButton={false}>
            <Dialog.Header>
              <Dialog.Title>Before you continue</Dialog.Title>
              <Dialog.Description>
                Escape and outside clicks are disabled — you must choose a button.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <p>By continuing you agree to the terms of service and privacy policy.</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" colorScheme="danger" onClick={() => setOpen(false)}>
                Decline
              </Button>
              <Button onClick={() => setOpen(false)}>Accept</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
