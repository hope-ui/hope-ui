import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";

// Live demo for "Grouping the header": the case `Popover.Header` is for — a card holding a second
// region under the labelled text. The header's own gap is tighter than the one `size` puts between
// regions, so the title and description read as one block against the copy row, instead of three
// siblings evenly spaced. Nothing here is behavioral: the labelling still rides on Title/Description.
export function PopoverHeaderDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger render={(p) => <Button {...(p as ButtonProps)}>Share this page</Button>} />
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Header>
              <Popover.Title>Share this page</Popover.Title>
              <Popover.Description>Anyone with the link can view it.</Popover.Description>
            </Popover.Header>
            <div class="flex gap-2">
              <input
                readonly
                value="hope-ui.dev/s/8fk2"
                aria-label="Share link"
                class="w-full rounded-md border border-subtle bg-surface px-2 py-1 text-foreground text-sm"
              />
              <Button size="sm">Copy</Button>
            </div>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
