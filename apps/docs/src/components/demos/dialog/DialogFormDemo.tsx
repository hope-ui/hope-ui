import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import { createSignal } from "solid-js";

// Live demo for "With a form". The fields live in a `<form>` in the body; the footer's Save button
// sits outside that element but submits it via the native `form` attribute. The focus trap moves
// focus to the first field on open, and Tab cycles within the card. Submitting closes the dialog.
export function DialogFormDemo() {
  const [open, setOpen] = createSignal(false);
  const field =
    "w-full rounded-md border border-subtle bg-transparent px-3 py-2 text-sm text-foreground outline-none focus-visible:border-primary";

  return (
    <Dialog.Root open={open()} onOpenChange={setOpen} size="sm">
      <Dialog.Trigger render={(p) => <Button {...(p as ButtonProps)}>Edit profile</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit profile</Dialog.Title>
              <Dialog.Description>Update your details. Changes save on submit.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <form
                id="edit-profile-form"
                class="flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setOpen(false);
                }}
              >
                <label class="flex flex-col gap-1 text-sm font-medium text-foreground">
                  Name
                  <input class={field} value="Ada Lovelace" />
                </label>
                <label class="flex flex-col gap-1 text-sm font-medium text-foreground">
                  Email
                  <input class={field} type="email" value="ada@example.com" />
                </label>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="edit-profile-form">
                Save changes
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
