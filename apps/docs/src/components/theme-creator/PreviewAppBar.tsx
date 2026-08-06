import { Badge } from "@hope-ui/components/badge";
import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Combobox } from "@hope-ui/components/combobox";
import { Popover } from "@hope-ui/components/popover";
import { Select } from "@hope-ui/components/select";
import { createSignal, Show } from "solid-js";
import { BellIcon, RocketIcon } from "~/components/Icons";
import { ENVIRONMENTS, PROJECTS, type Project } from "./preview-data";
import { usePreviewLayer } from "./preview-layer";

// The mock app's top bar: brand, a Combobox that searches projects, a Select for the environment,
// and a notification Popover. It is the densest strip of real controls in the preview, which makes
// it the one that shows a token change fastest — trigger borders, placeholder text, the focus halo
// and the popup surfaces all move together.

const itemToValue = (project: Project) => project.id;
const itemToLabel = (project: Project) => project.name;

function ProjectSearch() {
  const layer = usePreviewLayer();

  return (
    <Combobox.Root
      size="sm"
      items={PROJECTS}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      defaultValue={PROJECTS[0]}
    >
      <Combobox.Control class="w-full">
        <Combobox.Input aria-label="Search projects" placeholder="Search projects…" />
        <Combobox.Clear />
        <Combobox.Trigger>
          <Combobox.Icon />
        </Combobox.Trigger>
      </Combobox.Control>
      <Combobox.Portal mount={layer()}>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.List>
              {(project: Project) => (
                <Combobox.Item item={project}>
                  <Combobox.ItemText>{project.name}</Combobox.ItemText>
                  {/* `foreground-muted`, not `foreground-subtle`: subtle at 12px falls under
                      WCAG's 4.5:1 for normal-size text. */}
                  <span class="me-2 text-xs text-foreground-muted">{project.team}</span>
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              )}
            </Combobox.List>
            <Combobox.Empty>No project matches that.</Combobox.Empty>
            <Combobox.Status />
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function EnvironmentSelect() {
  const layer = usePreviewLayer();

  return (
    <Select.Root size="sm" items={ENVIRONMENTS} defaultValue={ENVIRONMENTS[0]}>
      <Select.Trigger class="w-36" aria-label="Environment">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal mount={layer()}>
        <Select.Positioner>
          <Select.Content>
            <Select.List>
              {(environment: string) => (
                <Select.Item item={environment}>
                  <Select.ItemText>{environment}</Select.ItemText>
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

function Notifications() {
  const layer = usePreviewLayer();
  // Uncontrolled everywhere else in the preview; controlled here only so the unread dot can clear
  // when the panel is opened, which is what makes the danger role visibly do a job.
  const [seen, setSeen] = createSignal(false);

  return (
    <Popover.Root size="sm" onOpenChange={(open) => open && setSeen(true)}>
      <Popover.Trigger
        // Solid types a native button's props wider than `Button` does, so the spread is cast — the
        // same bridge `Popover.CloseTrigger` makes when it spreads onto `CloseButton`.
        render={(triggerProps) => (
          <span class="relative inline-flex">
            <Button
              {...(triggerProps as ButtonProps)}
              iconOnly
              size="sm"
              variant="ghost"
              colorScheme="neutral"
              aria-label="Notifications"
            >
              <BellIcon />
            </Button>
            <Show when={!seen()}>
              <Badge
                variant="solid"
                colorScheme="danger"
                shape="circle"
                size="sm"
                class="pointer-events-none absolute -top-1 -end-1"
              >
                3
              </Badge>
            </Show>
          </span>
        )}
      />
      <Popover.Portal mount={layer()}>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>3 new events</Popover.Title>
            <Popover.Description>
              <span class="block">
                <span class="font-medium text-foreground">checkout-service</span> failed its health
                check twice in the last hour.
              </span>
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function PreviewAppBar() {
  return (
    <div class="flex flex-wrap items-center gap-3 border-b border-subtle pb-4">
      <span class="flex items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-on-primary shadow-sm">
          <RocketIcon class="size-4" />
        </span>
        <span class="font-semibold tracking-tight text-foreground">Northwind</span>
        <Badge variant="soft" colorScheme="primary" size="sm">
          Pro
        </Badge>
      </span>

      <div class="order-last w-full min-w-0 sm:order-none sm:ms-auto sm:w-56">
        <ProjectSearch />
      </div>

      <span class="ms-auto flex items-center gap-2 sm:ms-0">
        <EnvironmentSelect />
        <Notifications />
        <span class="grid size-8 shrink-0 place-items-center rounded-full bg-neutral-soft text-sm font-medium text-neutral-emphasis">
          AL
        </span>
      </span>
    </div>
  );
}
