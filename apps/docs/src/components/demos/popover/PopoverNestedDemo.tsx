import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";
import { createSignal, For } from "solid-js";

const STATUSES = ["Any", "Open", "Merged", "Closed"] as const;

type Status = (typeof STATUSES)[number];

// Live demo for "Nested popovers": a second `Popover.Root` living inside the first one's content.
// Both layers portal to `<body>` as siblings, so by every DOM measure the inner card sits *outside*
// the outer one — the document-keyed layer stack is what makes it a layer *above* instead:
//
//  - clicking inside the inner card is not an outside press for the outer one, so it stays open;
//  - focus moving into the inner card is not focus leaving the outer one, so `closeOnFocusOutside`
//    doesn't fire;
//  - only the topmost layer takes an Escape, so the first one closes the inner popover and the
//    second closes the outer.
//
// Picking a status closes the inner layer alone and returns focus to the button that opened it,
// which is inside the outer card.
export function PopoverNestedDemo() {
  const [status, setStatus] = createSignal<Status>("Any");
  const [statusOpen, setStatusOpen] = createSignal(false);

  return (
    <Popover.Root size="lg">
      <Popover.Trigger render={(p) => <Button {...(p as ButtonProps)}>Filters</Button>} />
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>Filters</Popover.Title>
            <Popover.Description>
              Narrow the list down. Each control can open a layer of its own.
            </Popover.Description>

            <div class="flex items-center justify-between gap-3 pt-1">
              <span class="text-foreground text-sm">Status</span>

              <Popover.Root
                size="sm"
                side="right"
                align="start"
                open={statusOpen()}
                onOpenChange={setStatusOpen}
              >
                <Popover.Trigger
                  render={(p) => (
                    <Button variant="soft" colorScheme="neutral" size="sm" {...(p as ButtonProps)}>
                      {status()}
                    </Button>
                  )}
                />
                <Popover.Portal>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Arrow />
                      <Popover.Title>Status</Popover.Title>
                      <div class="flex flex-col items-stretch gap-1 pt-1">
                        <For each={STATUSES}>
                          {(option) => (
                            <Button
                              variant={option === status() ? "soft" : "ghost"}
                              colorScheme={option === status() ? "primary" : "neutral"}
                              size="sm"
                              onClick={() => {
                                setStatus(option);
                                setStatusOpen(false);
                              }}
                            >
                              {option}
                            </Button>
                          )}
                        </For>
                      </div>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
