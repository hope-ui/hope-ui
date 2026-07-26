import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import { Popover } from "@hope-ui/components/popover";

// Live demo for "Inside a Dialog": a popover opened from inside a *modal* layer, on default props on
// both roots — which is the whole point. A modal Dialog marks everything outside its card `inert` +
// `aria-hidden`, cages focus inside it, and listens for Escape on the document; the popover's layer
// portals out as a sibling of the dialog's, so without the three shared stacks it would be a
// casualty of all three. With them the card stays clickable, keeps the focus it was given, and takes
// the first Escape on its own — the second closes the dialog.
export function PopoverInDialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...(p as ButtonProps)}>Project settings</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Project settings</Dialog.Title>
              <Dialog.Description>
                The popover below opens above the modal, stays clickable, and takes the first Escape
                on its own.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <div class="flex items-center justify-between gap-3">
                <span class="text-foreground text-sm">Visibility</span>
                <Popover.Root size="sm">
                  <Popover.Trigger
                    render={(p) => (
                      <Button
                        variant="soft"
                        colorScheme="neutral"
                        size="sm"
                        {...(p as ButtonProps)}
                      >
                        Who can see this?
                      </Button>
                    )}
                  />
                  <Popover.Portal>
                    <Popover.Positioner>
                      <Popover.Content>
                        <Popover.Arrow />
                        <Popover.Title>Workspace only</Popover.Title>
                        <Popover.Description>
                          Every member of the workspace can open this project. Guests cannot.
                        </Popover.Description>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
