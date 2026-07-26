import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";
import { Show } from "solid-js";

// Live demo for "Arrow": the same popover with and without `Popover.Arrow`. The arrow is opt-in and
// goes *inside* `Popover.Content`, whose `relative` is what its absolute pin resolves against — the
// primitive measures where it should sit and the recipe draws the box.
function ArrowPopover(props: { withArrow: boolean; label: string }) {
  return (
    <Popover.Root size="sm">
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
            <Show when={props.withArrow}>
              <Popover.Arrow />
            </Show>
            <Popover.Title>Storage</Popover.Title>
            <Popover.Description>
              12.4 GB of 20 GB used across every project in this workspace.
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function PopoverArrowDemo() {
  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-2">
      <ArrowPopover withArrow label="With an arrow" />
      <ArrowPopover withArrow={false} label="Without one" />
    </div>
  );
}
