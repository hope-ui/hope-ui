import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";

// One popover with a deliberately wide trigger, so "matches the anchor" is visible rather than
// asserted. `fullWidth` makes the button fill the column below, which is wider than the `md` card's
// own max width — the case that separates a matched card from a merely large one.
function WidePopover(props: { matchAnchorWidth?: boolean; label: string; body: string }) {
  return (
    <Popover.Root matchAnchorWidth={props.matchAnchorWidth}>
      <Popover.Trigger
        render={(p) => (
          <Button variant="soft" colorScheme="neutral" fullWidth {...(p as ButtonProps)}>
            {props.label}
          </Button>
        )}
      />
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>Share this page</Popover.Title>
            <Popover.Description>{props.body}</Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Live demo for "Matching the anchor's width": the same card, both ways, stacked so the two widths
// can be compared against one trigger width. Generously spaced — an open card is as wide as its
// trigger here, so a tight stack would cover the other trigger.
export function PopoverMatchAnchorWidthDemo() {
  return (
    <div class="not-prose mx-auto flex w-full max-w-sm flex-col gap-32 py-2">
      <WidePopover
        matchAnchorWidth
        label="matchAnchorWidth"
        body="This card is exactly as wide as the button that opened it, past the md size's own max width."
      />
      <WidePopover
        label="The default"
        body="This card shrink-wraps its content and stops at the md size's max width."
      />
    </div>
  );
}
