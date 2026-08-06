import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Calendar } from "@hope-ui/components/calendar";
import { Listbox } from "@hope-ui/components/listbox";
import { Popover } from "@hope-ui/components/popover";
import { Select } from "@hope-ui/components/select";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { CalendarIcon } from "~/components/Icons";
import { REGIONS, RELEASE_DATE, REVIEWERS, type Reviewer } from "./preview-data";
import { usePreviewLayer } from "./preview-layer";

// The "set up the next release" side panel: a region Select, a date picker (a Calendar in a
// Popover — the shape a real app reaches for, rather than a bare month grid), and a multi-select
// Listbox of reviewers. Together they cover the three surfaces a form-heavy screen leans on: the
// control chrome, the floating layer, and the collection row's selected/active states.

const itemToValue = (reviewer: Reviewer) => String(reviewer.id);
const itemToLabel = (reviewer: Reviewer) => reviewer.name;
const isItemDisabled = (reviewer: Reviewer) => reviewer.away ?? false;

function Field(props: { label: string; children: JSX.Element }) {
  return (
    <div class="space-y-1.5">
      <span class="block text-xs font-medium text-foreground-muted">{props.label}</span>
      {props.children}
    </div>
  );
}

function RegionSelect() {
  const layer = usePreviewLayer();

  return (
    <Select.Root size="sm" items={REGIONS} defaultValue={REGIONS[1]}>
      <Select.Trigger class="w-full" aria-label="Deploy region">
        <Select.Value placeholder="Pick a region" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal mount={layer()}>
        <Select.Positioner>
          <Select.Content>
            <Select.List>
              {(region: string) => (
                <Select.Item item={region}>
                  <Select.ItemText>{region}</Select.ItemText>
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

/**
 * What `onValueChange` emits, described structurally so this file reads the public component surface
 * without importing `@hope-ui/primitives` (the same stance the Calendar demos take). It is a union
 * over every selection mode; single mode — the default — only ever produces the first arm.
 */
type CalendarSelection =
  | CalendarDate
  | { start: CalendarDate; end: CalendarDate }
  | CalendarDate[]
  | null;

function ReleaseDatePicker() {
  const layer = usePreviewLayer();
  const [date, setDate] = createSignal<CalendarDate>(RELEASE_DATE);

  const pick = (value: CalendarSelection) => {
    if (value instanceof CalendarDate) {
      setDate(value);
    }
  };

  return (
    <Popover.Root size="lg">
      <Popover.Trigger
        // Solid types a native button's props wider than `Button` does, hence the cast.
        render={(triggerProps) => (
          <Button
            {...(triggerProps as ButtonProps)}
            fullWidth
            size="sm"
            variant="outline"
            colorScheme="neutral"
            startDecorator={<CalendarIcon />}
          >
            {String(date())}
          </Button>
        )}
      />
      <Popover.Portal mount={layer()}>
        <Popover.Positioner>
          {/* A popover is a `role="dialog"`, and this one carries a calendar rather than a
              `Popover.Title` — so it needs the name a title would have registered, or axe reports
              `aria-dialog-name`. */}
          <Popover.Content aria-label="Ship date">
            <Calendar.Root
              size="sm"
              value={date()}
              onValueChange={pick}
              defaultFocusedValue={RELEASE_DATE}
            />
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ReviewerList() {
  const [reviewers, setReviewers] = createSignal<Reviewer[]>([REVIEWERS[0], REVIEWERS[2]]);

  return (
    <Listbox.Root
      aria-label="Reviewers"
      size="sm"
      selectionMode="multiple"
      items={REVIEWERS}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      isItemDisabled={isItemDisabled}
      value={reviewers()}
      onChange={setReviewers}
      class="max-h-44 rounded-lg border border-subtle bg-surface"
    >
      {(reviewer: Reviewer) => (
        <Listbox.Item item={reviewer}>
          <span class="min-w-0 flex-1 truncate">
            {reviewer.name}
            {/* `foreground-muted`, not `foreground-subtle`: subtle at 12px lands at 4.17:1 on this
                surface, under WCAG's 4.5:1 for normal-size text (axe `color-contrast`). */}
            <span class="ms-2 text-xs text-foreground-muted">{reviewer.role}</span>
          </span>
          <Listbox.ItemIndicator />
        </Listbox.Item>
      )}
    </Listbox.Root>
  );
}

export function PreviewSchedule() {
  return (
    <section class="space-y-4 rounded-xl border border-subtle bg-surface-raised p-4 shadow-sm">
      <header>
        <h2 class="text-sm font-semibold text-foreground">Next release</h2>
        <p class="mt-0.5 text-xs text-foreground-muted">
          Rolls out once every reviewer has signed off.
        </p>
      </header>

      <Field label="Region">
        <RegionSelect />
      </Field>

      <Field label="Ship date">
        <ReleaseDatePicker />
      </Field>

      <Field label="Reviewers">
        <ReviewerList />
      </Field>
    </section>
  );
}
