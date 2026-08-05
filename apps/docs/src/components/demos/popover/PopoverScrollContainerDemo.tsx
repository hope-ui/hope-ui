import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";

// Live demo for "Portal": the trigger sits inside a small scroll container. `Popover.Portal` lifts
// the layer out of that container's `overflow`, so the card is never clipped by it, while
// `autoUpdate` (on by default) keeps the card glued to the trigger as the container scrolls — open
// it, then scroll the box.
export function PopoverScrollContainerDemo() {
  return (
    <div class="not-prose h-56 w-72 overflow-y-auto rounded-lg border border-subtle bg-surface p-4">
      <div class="h-24" />
      <Popover.Root size="sm">
        <Popover.Trigger
          render={(p) => (
            <Button variant="soft" colorScheme="neutral" {...(p as ButtonProps)}>
              Open, then scroll
            </Button>
          )}
        />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Title>Not clipped</Popover.Title>
              <Popover.Description>
                The card lives at the end of <code>body</code>, so the scroll box can’t cut it off.
              </Popover.Description>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <div class="h-72" />
    </div>
  );
}
