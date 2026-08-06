import { Badge } from "@hope-ui/components/badge";
import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";
import { For } from "solid-js";
import { EllipsisIcon, GitBranchIcon } from "~/components/Icons";
import { DEPLOYMENTS, type Deployment } from "./preview-data";
import { usePreviewLayer } from "./preview-layer";

// The activity list every deploy dashboard has: one row per build, its state as a dot Badge, and a
// per-row actions Popover. Four rows, four color roles — this is where success/info/warning/danger
// are seen doing a job rather than lined up as a swatch row.

function RowActions(props: { deployment: Deployment }) {
  const layer = usePreviewLayer();

  return (
    <Popover.Root size="sm">
      <Popover.Trigger
        // Solid types a native button's props wider than `Button` does, hence the cast.
        render={(triggerProps) => (
          <Button
            {...(triggerProps as ButtonProps)}
            iconOnly
            size="sm"
            variant="ghost"
            colorScheme="neutral"
            aria-label={`Actions for ${props.deployment.branch}`}
          >
            <EllipsisIcon />
          </Button>
        )}
      />
      <Popover.Portal mount={layer()}>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>
              {props.deployment.branch} · {props.deployment.commit}
            </Popover.Title>
            <Popover.Description>
              Pushed by {props.deployment.author}, {props.deployment.when}.
            </Popover.Description>
            <div class="mt-3 flex gap-2">
              <Button size="sm" variant="soft" colorScheme="primary">
                Redeploy
              </Button>
              <Button size="sm" variant="ghost" colorScheme="danger">
                Roll back
              </Button>
            </div>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function DeploymentRow(props: { deployment: Deployment }) {
  return (
    <li class="flex items-center gap-3 px-4 py-3">
      <GitBranchIcon class="size-4 shrink-0 text-foreground-subtle" />
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium text-foreground">
          {props.deployment.branch}
        </span>
        <span class="block truncate text-xs text-foreground-muted">
          <code>{props.deployment.commit}</code> · {props.deployment.author} ·{" "}
          {props.deployment.when}
        </span>
      </span>
      <Badge variant="dot" colorScheme={props.deployment.status} size="sm">
        {props.deployment.label}
      </Badge>
      <RowActions deployment={props.deployment} />
    </li>
  );
}

export function PreviewDeployments() {
  return (
    <section class="overflow-hidden rounded-xl border border-subtle bg-surface-raised shadow-sm">
      <header class="flex items-center justify-between gap-3 border-b border-subtle px-4 py-3">
        {/* `h2`, not the `h4` the type size suggests: the page's only heading above this is its
            `h1`, and skipping levels is an axe `heading-order` violation. */}
        <h2 class="text-sm font-semibold text-foreground">Recent deployments</h2>
        <Button variant="link" colorScheme="primary" size="sm">
          View all
        </Button>
      </header>
      <ul class="divide-y divide-subtle">
        <For each={DEPLOYMENTS}>{(deployment) => <DeploymentRow deployment={deployment} />}</For>
      </ul>
    </section>
  );
}
