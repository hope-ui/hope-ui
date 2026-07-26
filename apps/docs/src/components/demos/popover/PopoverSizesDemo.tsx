import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover, type PopoverSize } from "@hope-ui/components/popover";
import { For } from "solid-js";

const SIZES: PopoverSize[] = ["sm", "md", "lg"];

// One self-contained sized popover; the trigger label is the size, so it doubles as its caption.
function SizedPopover(props: { size: PopoverSize }) {
  return (
    <Popover.Root size={props.size}>
      <Popover.Trigger
        render={(p) => (
          <Button variant="soft" colorScheme="neutral" {...(p as ButtonProps)}>
            {props.size}
          </Button>
        )}
      />
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>
              Size <code>{props.size}</code>
            </Popover.Title>
            <Popover.Description>
              The scale sets the card's max width, its padding, and the rhythm between these two
              lines.
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Live demo for "Sizes": a row of triggers, one per value in the scale.
export function PopoverSizesDemo() {
  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-2">
      <For each={SIZES}>{(size) => <SizedPopover size={size} />}</For>
    </div>
  );
}
