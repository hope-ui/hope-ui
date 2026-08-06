import { Alert } from "@hope-ui/components/alert";
import { Badge } from "@hope-ui/components/badge";
import { Button } from "@hope-ui/components/button";
import type { JSX } from "@solidjs/web";
import { createSignal, For, Show } from "solid-js";
import { ActivityIcon, RocketIcon, TriangleAlertIcon, UsersIcon } from "~/components/Icons";
import { PreviewAppBar } from "./PreviewAppBar";
import { PreviewDeployments } from "./PreviewDeployments";
import { PreviewInviteDialog } from "./PreviewInviteDialog";
import { PreviewSchedule } from "./PreviewSchedule";

// The live preview's payload: a small but complete product screen — app bar, a dismissible notice,
// a stat row, an activity list and a release panel — assembled from ten shipped hope components.
//
// It is a mock *application* rather than a component inventory on purpose. A row of buttons proves a
// primary color exists; a screen proves the whole token set holds together, because it is the only
// way to see a surface behind a raised card behind a floating layer, a muted caption beside its
// heading, and four status roles competing for attention in one glance.

interface Stat {
  label: string;
  value: string;
  delta: string;
  trend: "success" | "danger";
  icon: (props: { class?: string }) => JSX.Element;
}

const STATS: Stat[] = [
  { label: "Deploys today", value: "18", delta: "+5", trend: "success", icon: RocketIcon },
  { label: "p95 latency", value: "212 ms", delta: "+18 ms", trend: "danger", icon: ActivityIcon },
  { label: "Active seats", value: "34", delta: "+2", trend: "success", icon: UsersIcon },
];

function StatCard(props: { stat: Stat }) {
  return (
    <div class="rounded-xl border border-subtle bg-surface-raised p-4 shadow-sm">
      <span class="flex items-center gap-2 text-xs font-medium text-foreground-muted">
        <props.stat.icon class="size-3.5" />
        {props.stat.label}
      </span>
      <span class="mt-2 flex items-baseline gap-2">
        <span class="text-2xl font-semibold tracking-tight text-foreground">
          {props.stat.value}
        </span>
        <Badge variant="soft" colorScheme={props.stat.trend} size="xs">
          {props.stat.delta}
        </Badge>
      </span>
    </div>
  );
}

function TrialNotice() {
  const [open, setOpen] = createSignal(true);

  return (
    <Show
      when={open()}
      fallback={
        <Button variant="soft" colorScheme="neutral" size="sm" onClick={() => setOpen(true)}>
          Show the trial notice
        </Button>
      }
    >
      {/* The compound anatomy, because the convenience props auto-compose icon + text + close only —
          `Alert.Actions` (and so the buttons) is reachable from this form alone. `CloseTrigger` is
          explicit here for the same reason: `closable` is read by the auto-composed body only. */}
      <Alert.Root open={open()} onOpenChange={setOpen} variant="soft" colorScheme="warning">
        <Alert.Icon>
          <TriangleAlertIcon />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Trial ends in 5 days</Alert.Title>
          <Alert.Description>
            Add a payment method to keep production deploys running.
          </Alert.Description>
          <Alert.Actions>
            <Button size="sm" variant="solid" colorScheme="warning">
              Add payment
            </Button>
            {/* `adaptive` inherits the alert's own text color and mixes its hover wash from it — a
                `ghost` button would wash to the soft alert's tint and show no hover at all. */}
            <Button size="sm" variant="adaptive">
              Compare plans
            </Button>
          </Alert.Actions>
        </Alert.Content>
        <Alert.CloseTrigger />
      </Alert.Root>
    </Show>
  );
}

export function PreviewApp() {
  return (
    <div class="space-y-5">
      <PreviewAppBar />

      <TrialNotice />

      <div class="grid gap-3 sm:grid-cols-3">
        <For each={STATS}>{(stat) => <StatCard stat={stat} />}</For>
      </div>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div class="space-y-5">
          <PreviewDeployments />

          <div class="flex flex-wrap items-center gap-3 rounded-xl border border-subtle bg-surface-sunken p-4">
            <span class="min-w-0 flex-1 text-sm text-foreground-muted">
              <span class="font-medium text-foreground">4 commits</span> are waiting behind the
              current release.
            </span>
            <PreviewInviteDialog />
            <Button size="sm" variant="solid" colorScheme="primary" startDecorator={<RocketIcon />}>
              Deploy
            </Button>
          </div>
        </div>

        <PreviewSchedule />
      </div>
    </div>
  );
}
