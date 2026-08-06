import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import { Select } from "@hope-ui/components/select";
import { createSignal, For } from "solid-js";
import { PlusIcon } from "~/components/Icons";
import { INVITE_ROLES, REVIEWERS } from "./preview-data";
import { usePreviewLayer } from "./preview-layer";

// The modal half of the preview. A Dialog is the only place the scrim token (`bg-scrim`) and the
// overlay surface are visible at all, and the Select inside it doubles as the proof that a floating
// layer stacks correctly above a modal one.

function RoleSelect() {
  const layer = usePreviewLayer();

  return (
    <Select.Root size="sm" items={INVITE_ROLES} defaultValue={INVITE_ROLES[2]}>
      <Select.Trigger class="w-full" aria-label="Access level">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal mount={layer()}>
        <Select.Positioner>
          <Select.Content>
            <Select.List>
              {(role: string) => (
                <Select.Item item={role}>
                  <Select.ItemText>{role}</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              )}
            </Select.List>
          </Select.Content>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

export function PreviewInviteDialog() {
  const layer = usePreviewLayer();
  // Controlled so the footer buttons can close it. `Dialog.CloseTrigger` would do that for free, but
  // it *is* a CloseButton — it would name the "Cancel" button "Close", and a visible label that
  // disagrees with the accessible name is exactly the bug the docs tell readers to avoid.
  const [open, setOpen] = createSignal(false);

  return (
    <Dialog.Root size="sm" open={open()} onOpenChange={setOpen}>
      <Dialog.Trigger
        // Solid types a native button's props wider than `Button` does, hence the cast.
        render={(triggerProps) => (
          <Button
            {...(triggerProps as ButtonProps)}
            size="sm"
            variant="soft"
            colorScheme="neutral"
            startDecorator={<PlusIcon />}
          >
            Invite
          </Button>
        )}
      />
      <Dialog.Portal mount={layer()}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Invite to Northwind</Dialog.Title>
              <Dialog.Description>
                They get an email with a link that expires in seven days.
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Body class="space-y-4">
              <div class="space-y-1.5">
                <span class="block text-xs font-medium text-foreground-muted">Access level</span>
                <RoleSelect />
              </div>

              <div class="space-y-1.5">
                <span class="block text-xs font-medium text-foreground-muted">
                  Already on the team
                </span>
                <ul class="divide-y divide-subtle rounded-lg border border-subtle">
                  <For each={REVIEWERS.slice(0, 3)}>
                    {(reviewer) => (
                      <li class="flex items-center gap-2 px-3 py-2 text-sm">
                        <span class="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-soft text-xs font-medium text-neutral-emphasis">
                          {reviewer.name.charAt(0)}
                        </span>
                        <span class="min-w-0 flex-1 truncate text-foreground">{reviewer.name}</span>
                        <span class="text-xs text-foreground-muted">{reviewer.role}</span>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="ghost" colorScheme="neutral" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="solid" colorScheme="primary" onClick={() => setOpen(false)}>
                Send invite
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
