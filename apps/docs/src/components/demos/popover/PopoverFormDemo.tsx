import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";
import { createSignal } from "solid-js";

// Live demo for "With a form": the one demo that needs `initialFocus`. Left to itself the autofocus
// takes the first focusable descendant — here the corner ✕ — and a reader who opened "Rename
// project" wants the caret in the field instead. `initialFocus` is a per-read accessor, resolved
// after the content mounts, so it can point at an element inside the card. Closing still returns
// focus to the trigger.
export function PopoverFormDemo() {
  const [name, setName] = createSignal("Acme Marketing Site");
  const [draft, setDraft] = createSignal(name());
  const [open, setOpen] = createSignal(false);
  const [nameInput, setNameInput] = createSignal<HTMLInputElement>();

  const save = (event: SubmitEvent) => {
    event.preventDefault();
    setName(draft());
    setOpen(false);
  };

  return (
    <div class="not-prose flex flex-col items-center gap-3">
      <p class="text-foreground text-sm">
        Project: <strong>{name()}</strong>
      </p>

      <Popover.Root
        size="lg"
        open={open()}
        onOpenChange={(next) => {
          setDraft(name());
          setOpen(next);
        }}
      >
        <Popover.Trigger
          render={(p) => (
            <Button variant="soft" colorScheme="neutral" {...(p as ButtonProps)}>
              Rename project
            </Button>
          )}
        />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Content initialFocus={nameInput}>
              <Popover.Arrow />
              <Popover.Title>Rename project</Popover.Title>
              <Popover.CloseTrigger size="sm" />
              <form class="flex flex-col gap-3" onSubmit={save}>
                <label class="flex flex-col gap-1 text-foreground-muted text-sm" for="project-name">
                  Project name
                  <input
                    ref={setNameInput}
                    id="project-name"
                    class="w-full rounded-md border border-subtle bg-surface px-2 py-1 text-foreground text-sm"
                    value={draft()}
                    onInput={(event) => setDraft(event.currentTarget.value)}
                  />
                </label>
                <Button type="submit" size="sm" class="self-start">
                  Save
                </Button>
              </form>
            </Popover.Content>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
