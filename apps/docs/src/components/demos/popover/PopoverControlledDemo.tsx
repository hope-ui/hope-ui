import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";
import { createSignal } from "solid-js";

// Live demo for "Open state": `open` is driven by a signal, so a button *outside* the popover can
// open it and the card's own action can close it — every dismissal path (the trigger, Escape, an
// outside click, Tab-ing away) routes through `onOpenChange` first, which is what keeps the readout
// below honest.
export function PopoverControlledDemo() {
  const [open, setOpen] = createSignal(false);

  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-3">
      <Popover.Root open={open()} onOpenChange={setOpen}>
        <Popover.Trigger render={(p) => <Button {...(p as ButtonProps)}>Invite people</Button>} />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Title>Invite people</Popover.Title>
              <Popover.Description>
                Teammates you invite get access to every project in this workspace.
              </Popover.Description>
              <Button size="sm" class="mt-1 self-start" onClick={() => setOpen(false)}>
                Send invites
              </Button>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      <Button variant="soft" colorScheme="neutral" onClick={() => setOpen(!open())}>
        Toggle from outside
      </Button>

      <output class="text-sm text-foreground-muted">
        open: <code>{String(open())}</code>
      </output>
    </div>
  );
}
