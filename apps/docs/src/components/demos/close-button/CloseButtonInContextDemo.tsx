import { Button } from "@hope-ui/components/button";
import { CloseButton } from "@hope-ui/components/close-button";
import { createSignal, Show } from "solid-js";

// Live demo for the "In context" section.
//
// The everyday job of a CloseButton: dismiss a transient surface. It sits in the corner of a
// notification card and, on click, removes it. A "Show again" Button restores the card so the demo
// is repeatable. `onClick` is an ordinary native handler — CloseButton is a button first.
export function CloseButtonInContextDemo() {
  const [open, setOpen] = createSignal(true);

  return (
    <div class="flex min-h-24 w-full max-w-md items-center justify-center not-prose">
      <Show
        when={open()}
        fallback={
          <Button variant="soft" colorScheme="neutral" size="sm" onClick={() => setOpen(true)}>
            Show again
          </Button>
        }
      >
        <div class="flex w-full items-start gap-3 rounded-lg border border-subtle bg-surface-raised p-4 text-foreground shadow-sm">
          <div class="flex-1">
            <p class="text-sm font-medium">Changes saved</p>
            <p class="text-sm text-foreground-muted">
              Your preferences were updated across all devices.
            </p>
          </div>
          <CloseButton aria-label="Dismiss notification" onClick={() => setOpen(false)} />
        </div>
      </Show>
    </div>
  );
}
