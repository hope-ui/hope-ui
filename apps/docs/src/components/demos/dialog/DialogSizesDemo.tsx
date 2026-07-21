import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog, type DialogSize } from "@hope-ui/components/dialog";
import { createSignal, For } from "solid-js";

const SIZES: DialogSize[] = ["xs", "sm", "md", "lg", "xl", "cover", "full"];

// One self-contained sized dialog; the label is the size so the trigger doubles as its caption.
function SizedDialog(props: { size: DialogSize }) {
  const [open, setOpen] = createSignal(false);
  return (
    <Dialog.Root open={open()} onOpenChange={setOpen} size={props.size}>
      <Dialog.Trigger
        render={(p) => (
          <Button variant="soft" colorScheme="neutral" {...(p as ButtonProps)}>
            {props.size}
          </Button>
        )}
      />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                Size <code>{props.size}</code>
              </Dialog.Title>
              <Dialog.Description>
                {props.size === "cover"
                  ? "Fills the viewport minus a margin, keeping the radius."
                  : props.size === "full"
                    ? "Edge-to-edge, no radius or margin."
                    : "A width-capped, centered card."}
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <p>Both `cover` and `full` ignore `placement` and fill the frame.</p>
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

// Live demo for "Sizes": a row of triggers, one per size in the scale.
export function DialogSizesDemo() {
  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-2">
      <For each={SIZES}>{(size) => <SizedDialog size={size} />}</For>
    </div>
  );
}
