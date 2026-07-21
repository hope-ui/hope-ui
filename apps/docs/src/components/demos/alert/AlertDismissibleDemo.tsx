import { Alert } from "@hope-ui/components/alert";
import { Button } from "@hope-ui/components/button";
import { createSignal } from "solid-js";

// Live demo for the "Dismissible" section. `closable` renders an `Alert.CloseTrigger`;
// dismissing plays the exit transition (fade + slide) and then unmounts. Driving `open`
// as a controlled signal lets a "Show again" Button bring it back, so the transition is
// repeatable. `onExitComplete` fires once the exit animation has finished and the alert
// has left the DOM.
export function AlertDismissibleDemo() {
  const [open, setOpen] = createSignal(true);

  return (
    <div class="not-prose flex min-h-28 w-full max-w-md flex-col items-start gap-3">
      <Button
        variant="soft"
        colorScheme="neutral"
        size="sm"
        disabled={open()}
        onClick={() => setOpen(true)}
      >
        Show Alert
      </Button>
      <Alert.Root
        open={open()}
        onOpenChange={setOpen}
        closable
        variant="soft"
        colorScheme="success"
        title="Changes saved"
        description="Dismiss me — I fade and slide out."
      />
    </div>
  );
}
