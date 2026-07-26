import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";

// Live demo for "Dismissal": `closeOnFocusOutside={false}` on the second popover. Open either one
// and Tab — the default closes as focus leaves the card, the opt-out stays open so the reader can
// keep referring to it while working elsewhere. Escape, an outside click and the trigger still close
// both.
function DismissalPopover(props: { closeOnFocusOutside: boolean; label: string; body: string }) {
  return (
    <Popover.Root size="sm" closeOnFocusOutside={props.closeOnFocusOutside}>
      <Popover.Trigger
        render={(p) => (
          <Button variant="soft" colorScheme="neutral" {...(p as ButtonProps)}>
            {props.label}
          </Button>
        )}
      />
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>Tab away</Popover.Title>
            <Popover.Description>{props.body}</Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function PopoverDismissalDemo() {
  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-2">
      <DismissalPopover
        closeOnFocusOutside
        label="Closes on focus out"
        body="The default: focus landing outside the card dismisses it."
      />
      <DismissalPopover
        closeOnFocusOutside={false}
        label="Stays open"
        body="Focus can leave and this card stays put."
      />
      <Button variant="ghost">Somewhere else</Button>
    </div>
  );
}
