import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog, type DialogScrollBehavior } from "@hope-ui/components/dialog";
import { createSignal, For } from "solid-js";

// Plenty of filler so the body clearly overflows the viewport and has real distance to scroll.
function LongBody() {
  return (
    <For each={Array.from({ length: 30 })}>
      {(_, i) => (
        <p>
          {i() + 1}. The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor
          jugs.
        </p>
      )}
    </For>
  );
}

function ScrollDialog(props: { scrollBehavior: DialogScrollBehavior; label: string }) {
  const [open, setOpen] = createSignal(false);
  return (
    <Dialog.Root open={open()} onOpenChange={setOpen} scrollBehavior={props.scrollBehavior}>
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
              <Dialog.Title>Terms of service</Dialog.Title>
              <Dialog.Description>
                scrollBehavior <code>{props.scrollBehavior}</code>
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <div class="flex flex-col gap-3">
                <LongBody />
              </div>
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

// Live demo for "Scroll behavior": the same long dialog rendered both ways.
export function DialogScrollDemo() {
  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-2">
      <ScrollDialog scrollBehavior="inside" label="inside (body scrolls)" />
      <ScrollDialog scrollBehavior="outside" label="outside (card scrolls)" />
    </div>
  );
}
