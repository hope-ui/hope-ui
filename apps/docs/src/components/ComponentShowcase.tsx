import { Alert } from "@hope-ui/components/alert";
import { Badge } from "@hope-ui/components/badge";
import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Calendar } from "@hope-ui/components/calendar";
import { Combobox } from "@hope-ui/components/combobox";
import { Dialog } from "@hope-ui/components/dialog";
import { Listbox } from "@hope-ui/components/listbox";
import { Popover } from "@hope-ui/components/popover";
import { Select } from "@hope-ui/components/select";
import type { BadgeColorScheme } from "@hope-ui/theming";
import { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { Link } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import { ArrowRightIcon, BoxIcon, CircleCheckIcon, ShareIcon, TrashIcon } from "~/components/Icons";
import { PathLink } from "~/components/PathLink";

// The homepage's live component gallery — the "Polished, out of the box" section.
//
// Deliberately NOT a variant matrix: each card is a small slice of a real product screen (invite a
// teammate, pick a date, confirm a deletion), so a visitor sees how the components compose rather
// than how many colors each one has. Every card footer links to that component's doc page.
//
// The whole homepage is prerendered (SSG) and then hydrated, which is what `SHOWCASE_MONTH` below
// is about, and why nothing here formats a date or reads a locale at runtime.

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface Person {
  id: number;
  name: string;
  handle: string;
}

const TEAMMATES: Person[] = [
  { id: 1, name: "Maya Chen", handle: "@maya" },
  { id: 2, name: "Tomás Ruiz", handle: "@tomas" },
  { id: 3, name: "Priya Nair", handle: "@priya" },
  { id: 4, name: "Jonas Weber", handle: "@jonas" },
  { id: 5, name: "Amara Okafor", handle: "@amara" },
];

const personToValue = (person: Person) => String(person.id);
const personToLabel = (person: Person) => person.name;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

// Plain strings, so Select needs no accessors at all: the item *is* its value and its label.
const PERMISSIONS = ["Owner", "Can edit", "Can comment", "Can view"];

const MEMBERS: { person: Person; permission: string; colorScheme: BadgeColorScheme }[] = [
  { person: TEAMMATES[0], permission: "Owner", colorScheme: "primary" },
  { person: TEAMMATES[2], permission: "Can edit", colorScheme: "neutral" },
];

const PROJECT_FACTS = [
  { label: "Framework", value: "SolidJS" },
  { label: "Region", value: "fra1 · Paris" },
  { label: "Domain", value: "acme.dev" },
  { label: "Last commit", value: "3f2a91c" },
];

const SERVICES: { name: string; state: string; colorScheme: BadgeColorScheme }[] = [
  { name: "api-gateway", state: "Live", colorScheme: "success" },
  { name: "web-frontend", state: "Deploying", colorScheme: "warning" },
  { name: "billing-worker", state: "Failed", colorScheme: "danger" },
  { name: "legacy-cron", state: "Paused", colorScheme: "neutral" },
];

// The calendar seeds its visible month from `defaultFocusedValue`; left to `today()` it would differ
// between build time (this site is prerendered) and view time, so the server HTML and the hydrated
// client would disagree on the entire grid — a hydration mismatch. A fixed month keeps them identical.
const SHOWCASE_MONTH = new CalendarDate(2026, 9, 15);

// ---------------------------------------------------------------------------
// Card shell
// ---------------------------------------------------------------------------

const PART_LABEL = {
  alert: "Alert",
  badge: "Badge",
  button: "Button",
  calendar: "Calendar",
  "close-button": "CloseButton",
  combobox: "Combobox",
  dialog: "Dialog",
  listbox: "Listbox",
  popover: "Popover",
  select: "Select",
} as const;

type PartSlug = keyof typeof PART_LABEL;

/**
 * One slice of app UI, framed. `parts` names the hope-ui components it is built from and links each
 * to its doc page — the shortest path from "I like that" to "here's how".
 */
function ShowcaseCard(props: {
  title: string;
  caption: string;
  parts: readonly PartSlug[];
  class?: string;
  children: JSX.Element;
}) {
  return (
    <article
      // No `hover:-translate-y-1` here, unlike the feature cards above: these hold live controls, and
      // a card that shifts under the pointer makes its own popup a moving target.
      class={[
        "hope-card hope-reveal flex flex-col rounded-2xl border border-subtle bg-surface-raised p-6 shadow-sm transition-all! hover:shadow-lg",
        props.class,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h3 class="text-sm font-semibold text-foreground">{props.title}</h3>
      <p class="mt-1 text-xs leading-relaxed text-foreground-muted">{props.caption}</p>

      <div class="mt-5">{props.children}</div>

      {/* `mt-auto` pins the footer to the bottom edge, so cards of unequal content in the same grid
          row still line their chips up. */}
      <ul class="mt-auto flex flex-wrap gap-1.5 pt-6">
        <For each={props.parts}>
          {(slug) => (
            <li>
              <PathLink
                to={`/components/${slug}`}
                class="inline-flex items-center rounded-full border border-subtle bg-surface px-2.5 py-1 font-mono text-[11px] text-foreground-muted transition-colors hover:border-primary/60 hover:text-primary"
              >
                {PART_LABEL[slug]}
              </PathLink>
            </li>
          )}
        </For>
      </ul>
    </article>
  );
}

/** A person row's avatar: initials on a soft primary disc. */
function Avatar(props: { name: string }) {
  return (
    <span class="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary-emphasis">
      {initials(props.name)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// The cards
// ---------------------------------------------------------------------------

// Combobox + Select + Button + Badge — the share sheet every collaborative app has.
function InviteCard() {
  return (
    <ShowcaseCard
      title="Invite a teammate"
      caption="A searchable people field, the permission picker beside it, and the button that sends it."
      parts={["combobox", "select", "button", "badge"]}
      class="sm:col-span-2"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Combobox.Root items={TEAMMATES} itemToValue={personToValue} itemToLabel={personToLabel}>
            <Combobox.Control class="w-full sm:flex-1">
              <Combobox.Input aria-label="Invite a teammate" placeholder="Search teammates…" />
              <Combobox.Clear />
              <Combobox.Trigger>
                <Combobox.Icon />
              </Combobox.Trigger>
            </Combobox.Control>
            <Combobox.Portal>
              <Combobox.Positioner>
                <Combobox.Content>
                  <Combobox.List>
                    {(person: Person) => (
                      <Combobox.Item item={person}>
                        <Combobox.ItemText>{person.name}</Combobox.ItemText>
                        <Combobox.ItemIndicator />
                      </Combobox.Item>
                    )}
                  </Combobox.List>
                  <Combobox.Empty>Nobody by that name.</Combobox.Empty>
                  <Combobox.Status />
                </Combobox.Content>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>

          <Select.Root items={PERMISSIONS} defaultValue="Can edit">
            <Select.Trigger aria-label="Permission" class="w-full sm:w-40">
              <Select.Value placeholder="Permission" />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Content>
                  <Select.List>
                    {(permission: string) => (
                      <Select.Item item={permission}>
                        <Select.ItemText>{permission}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    )}
                  </Select.List>
                </Select.Content>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>

          <Button variant="solid" colorScheme="primary">
            Invite
          </Button>
        </div>

        <ul class="divide-y divide-subtle overflow-hidden rounded-lg border border-subtle bg-surface">
          <For each={MEMBERS}>
            {(member) => (
              <li class="flex items-center gap-3 px-3 py-2">
                <Avatar name={member.person.name} />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm text-foreground">{member.person.name}</span>
                  <span class="block truncate text-xs text-foreground-subtle">
                    {member.person.handle}
                  </span>
                </span>
                <Badge variant="soft" colorScheme={member.colorScheme}>
                  {member.permission}
                </Badge>
              </li>
            )}
          </For>
        </ul>
      </div>
    </ShowcaseCard>
  );
}

// Badge's `dot` variant doing what it is actually for — a status column.
function ServiceHealthCard() {
  return (
    <ShowcaseCard
      title="Service health"
      caption="Status pips down a list, one role token per state."
      parts={["badge"]}
    >
      <ul class="divide-y divide-subtle overflow-hidden rounded-lg border border-subtle bg-surface">
        <For each={SERVICES}>
          {(service) => (
            <li class="flex items-center justify-between gap-3 px-3 py-2.5">
              <span class="truncate font-mono text-xs text-foreground">{service.name}</span>
              <Badge variant="dot" colorScheme={service.colorScheme}>
                {service.state}
              </Badge>
            </li>
          )}
        </For>
      </ul>
    </ShowcaseCard>
  );
}

// The zero-children Calendar: no compound parts, so `Root` renders its own nav + month grid.
function ScheduleCard() {
  return (
    <ShowcaseCard
      title="Pick a date"
      caption="Arrow keys move the cursor, PageUp/PageDown change month."
      parts={["calendar"]}
    >
      <div class="flex justify-center">
        <Calendar.Root size="sm" defaultFocusedValue={SHOWCASE_MONTH} />
      </div>
    </ShowcaseCard>
  );
}

// A multi-select Listbox as the assignee picker it would be in a review tool. Controlled, so the
// count below the list tracks the selection — the readout starts from a fixed default, so the
// prerendered text and the hydrated text agree.
function ReviewersCard() {
  const [reviewers, setReviewers] = createSignal<Person[]>([TEAMMATES[0], TEAMMATES[2]]);

  return (
    <ShowcaseCard
      title="Assign reviewers"
      caption="Multi-select with roving focus — Space toggles, type to jump."
      parts={["listbox"]}
    >
      <Listbox.Root
        aria-label="Assign reviewers"
        selectionMode="multiple"
        items={TEAMMATES}
        itemToValue={personToValue}
        itemToLabel={personToLabel}
        value={reviewers()}
        onChange={setReviewers}
        class="max-h-64 w-full rounded-lg border border-subtle bg-surface p-1"
      >
        {(person: Person) => (
          <Listbox.Item item={person}>
            <Listbox.ItemIndicator />
            <Avatar name={person.name} />
            <span class="min-w-0 flex-1 truncate">{person.name}</span>
          </Listbox.Item>
        )}
      </Listbox.Root>
      <output class="mt-3 block text-xs text-foreground-subtle">
        {reviewers().length} of {TEAMMATES.length} assigned
      </output>
    </ShowcaseCard>
  );
}

// The two overlays side by side, in the place an app puts them: a non-modal share popover, and the
// modal confirmation that guards a destructive action.
function ProjectCard() {
  const [confirmOpen, setConfirmOpen] = createSignal(false);

  return (
    <ShowcaseCard
      title="Project actions"
      caption="A non-modal popover for sharing; a modal, focus-trapped dialog for deleting."
      parts={["popover", "dialog", "close-button", "badge"]}
    >
      <div class="flex flex-col gap-4">
        <div class="rounded-lg border border-subtle bg-surface p-3">
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-sm font-medium text-foreground">Acme Marketing Site</span>
            <Badge variant="dot" colorScheme="success">
              Live
            </Badge>
          </div>
          <p class="mt-1 text-xs text-foreground-subtle">Production · deployed 2 hours ago</p>
        </div>

        <dl class="flex flex-col gap-2 text-xs">
          <For each={PROJECT_FACTS}>
            {(fact) => (
              <div class="flex items-center justify-between gap-3">
                <dt class="text-foreground-subtle">{fact.label}</dt>
                <dd class="truncate font-mono text-foreground-muted">{fact.value}</dd>
              </div>
            )}
          </For>
        </dl>

        <div class="flex flex-wrap gap-2">
          <Popover.Root>
            {/* Solid types a native button's `disabled` wider than `Button` does, so the trigger's
                spread is cast — the documented button→button bridge in the Popover docs. */}
            <Popover.Trigger
              render={(triggerProps) => (
                <Button
                  {...(triggerProps as ButtonProps)}
                  size="sm"
                  variant="soft"
                  startDecorator={<ShareIcon />}
                >
                  Share
                </Button>
              )}
            />
            <Popover.Portal>
              <Popover.Positioner>
                <Popover.Content>
                  <Popover.Arrow />
                  <Popover.Header>
                    <Popover.Title>Share this project</Popover.Title>
                    <Popover.Description>Anyone with the link can view it.</Popover.Description>
                  </Popover.Header>
                  <div class="flex gap-2">
                    <input
                      readonly
                      value="hope-ui.dev/p/acme"
                      aria-label="Share link"
                      class="w-full rounded-md border border-subtle bg-surface px-2 py-1 text-sm text-foreground"
                    />
                    <Button size="sm">Copy</Button>
                  </div>
                </Popover.Content>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>

          <Dialog.Root open={confirmOpen()} onOpenChange={setConfirmOpen}>
            <Dialog.Trigger
              render={(triggerProps) => (
                <Button
                  {...(triggerProps as ButtonProps)}
                  size="sm"
                  variant="ghost"
                  colorScheme="danger"
                  startDecorator={<TrashIcon />}
                >
                  Delete
                </Button>
              )}
            />
            <Dialog.Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Delete this project?</Dialog.Title>
                    <Dialog.Description>
                      This permanently deletes <b>Acme Marketing Site</b> and everything inside it.
                    </Dialog.Description>
                  </Dialog.Header>
                  <Dialog.Body>
                    <p>Every member of the workspace loses access. This cannot be undone.</p>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button
                      variant="solid"
                      colorScheme="danger"
                      onClick={() => setConfirmOpen(false)}
                    >
                      Delete project
                    </Button>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </ShowcaseCard>
  );
}

// The compound Alert: its own icon, an actions row, and a dismiss button that plays the exit
// transition before unmounting. Dismiss it — it stays dismissed until the page reloads.
function DeployAlertCard() {
  return (
    <ShowcaseCard
      title="Tell them what happened"
      caption="A dismissible banner with its own actions row — the compound anatomy, not a preset shape."
      parts={["alert", "button", "close-button"]}
      class="sm:col-span-2 lg:col-span-3"
    >
      <Alert.Root variant="soft" colorScheme="success">
        <Alert.Icon>
          <CircleCheckIcon />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Deployment finished</Alert.Title>
          <Alert.Description>
            acme-web #128 is live on preview — built and shipped in 42 seconds.
          </Alert.Description>
          <Alert.Actions>
            <Button size="sm" variant="solid" colorScheme="success">
              Visit preview
            </Button>
            <Button size="sm" variant="ghost" colorScheme="success">
              View logs
            </Button>
          </Alert.Actions>
        </Alert.Content>
        <Alert.CloseTrigger />
      </Alert.Root>
    </ShowcaseCard>
  );
}

// ---------------------------------------------------------------------------

export function ComponentShowcase() {
  return (
    <section class="relative overflow-x-clip border-y border-subtle bg-surface-sunken/60 py-20 sm:py-28">
      <div
        aria-hidden="true"
        // `left-1/2` + `-translate-x-1/2` is the horizontal-centering idiom — direction-invariant,
        // rtl-ok: no logical spelling exists for it.
        class="hope-glow pointer-events-none absolute left-1/2 top-0 -z-10 size-144 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div class="mx-auto max-w-7xl px-6">
        <div class="hope-reveal mx-auto max-w-2xl text-center">
          <span class="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface-raised px-3 py-1 text-xs font-medium text-foreground-muted">
            <BoxIcon class="size-3.5 text-primary" />
            Real components, right here
          </span>
          <h2 class="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Polished, out of the box
          </h2>
          <p class="mt-4 text-lg leading-relaxed text-foreground-muted">
            Not a swatch board — every card below is a working slice of an app. Open the pickers,
            tab through the rows, dismiss the banner. What you see is exactly what ships.
          </p>
        </div>

        <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InviteCard />
          <ServiceHealthCard />
          <ScheduleCard />
          <ReviewersCard />
          <ProjectCard />
          <DeployAlertCard />
        </div>

        <div class="hope-reveal mt-8 flex justify-center">
          <Link
            to="/components"
            class="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hovered"
          >
            Explore all components
            <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
