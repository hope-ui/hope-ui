import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";

// Live demo for "Anchoring to something else": the layer is positioned against the whole row while
// the button inside it keeps owning the toggle and the ARIA — "anchored to the row, opened by the
// button". Unmounting the anchor hands positioning back to the trigger.
export function PopoverAnchorDemo() {
  return (
    <Popover.Root side="right" align="start">
      <Popover.Anchor class="flex w-72 items-center justify-between gap-3 rounded-lg border border-subtle bg-surface p-3">
        <span class="text-foreground text-sm">Acme Marketing Site</span>
        <Popover.Trigger
          render={(p) => (
            <Button variant="soft" colorScheme="neutral" size="sm" {...(p as ButtonProps)}>
              Details
            </Button>
          )}
        />
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>Acme Marketing Site</Popover.Title>
            <Popover.Description>
              Anchored to the whole row, not to the button that opened it.
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
