import { Badge } from "@hope-ui/components/badge";
import type { BadgeColorScheme } from "@hope-ui/theming";
import { For } from "solid-js";

// Live demo for the "Status" section: the `dot` variant as a real status indicator
// in a small deployments-style list. `dot` renders role-neutral chrome (so the label
// stays legible in both themes) with a single role-colored status pip, which maps
// cleanly onto success / warning / danger / neutral states.
const ROWS: { name: string; state: string; color: BadgeColorScheme }[] = [
  { name: "api-gateway", state: "Live", color: "success" },
  { name: "web-frontend", state: "Deploying", color: "warning" },
  { name: "billing-worker", state: "Failed", color: "danger" },
  { name: "legacy-cron", state: "Paused", color: "neutral" },
];

export function BadgeStatusDemo() {
  return (
    <div class="not-prose w-full max-w-sm divide-y divide-subtle overflow-hidden rounded-lg border border-subtle bg-surface">
      <For each={ROWS}>
        {(row) => (
          <div class="flex items-center justify-between gap-4 px-4 py-2.5">
            <span class="font-mono text-sm text-foreground">{row.name}</span>
            <Badge variant="dot" colorScheme={row.color}>
              {row.state}
            </Badge>
          </div>
        )}
      </For>
    </div>
  );
}
