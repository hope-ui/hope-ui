import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog, type DialogPlacement } from "@hope-ui/components/dialog";
import { createSignal } from "solid-js";

// One dialog anchored by a given placement; the trigger label names it.
function PlacedDialog(props: { placement: DialogPlacement; label: string }) {
  const [open, setOpen] = createSignal(false);
  return (
    <Dialog.Root open={open()} onOpenChange={setOpen} placement={props.placement}>
      <Dialog.Trigger
        render={(p) => (
          <Button variant="soft" colorScheme="neutral" {...(p as ButtonProps)}>
            {props.label}
          </Button>
        )}
      />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                Placement <code>{props.placement}</code>
              </Dialog.Title>
              <Dialog.Description>
                {props.placement === "center"
                  ? "Centered in the viewport (the default)."
                  : "Anchored near the top of the viewport."}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <p>Open both to feel where each one lands.</p>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Live demo for "Placement": the same dialog centered vs. top-anchored.
export function DialogPlacementDemo() {
  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-2">
      <PlacedDialog placement="center" label="center" />
      <PlacedDialog placement="top" label="top" />
    </div>
  );
}
