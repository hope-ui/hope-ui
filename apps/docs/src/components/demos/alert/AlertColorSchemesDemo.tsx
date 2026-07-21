import { Alert } from "@hope-ui/components/alert";
import type { AlertColorScheme } from "@hope-ui/theming";
import { For } from "solid-js";

// Live demo for the "Status" section: the four status roles, each rendered with its
// built-in glyph. Omitting `icon` falls back to hope's status glyph — info / success /
// warning / danger only (primary and neutral ship none). Each row states its meaning in
// words, with the color and glyph as reinforcing second channels.
const ROWS: { colorScheme: AlertColorScheme; title: string; description: string }[] = [
  { colorScheme: "info", title: "Heads up", description: "A new workspace theme is available." },
  { colorScheme: "success", title: "Payment received", description: "Your invoice is settled." },
  {
    colorScheme: "warning",
    title: "Storage almost full",
    description: "You've used 92% of your plan's quota.",
  },
  {
    colorScheme: "danger",
    title: "Deployment failed",
    description: "The last build could not be published.",
  },
];

export function AlertColorSchemesDemo() {
  return (
    <div class="not-prose flex w-full max-w-md flex-col gap-3">
      <For each={ROWS}>
        {(row) => (
          <Alert.Root
            variant="soft"
            colorScheme={row.colorScheme}
            title={row.title}
            description={row.description}
          />
        )}
      </For>
    </div>
  );
}
