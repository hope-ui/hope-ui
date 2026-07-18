import { Badge } from "@hope-ui/components/badge";
import type { BadgeColorScheme, BadgeVariant } from "@hope-ui/theming";
import { For } from "solid-js";

// The full `variant` × `colorScheme` grid for the doc's "Color schemes" section — a
// 36-badge matrix that reads better as a live component than as inline MDX. Mirrors
// the component's `VariantColorMatrix` story.
//
// Every variant varies per role — even `dot`, whose role-neutral chrome carries a
// role-colored status dot — so unlike Button's matrix there is no color-independent
// variant to omit here.
const VARIANTS: BadgeVariant[] = ["solid", "inverted", "soft", "subtle", "outline", "dot"];
const COLORS: BadgeColorScheme[] = ["primary", "neutral", "success", "info", "warning", "danger"];

export function BadgeMatrixDemo() {
  return (
    // Each `<For>` callback returns exactly one element (a flex row, or one cell) — never a
    // fragment wrapping another `<For>`, which yields a variable node count per row and breaks
    // Solid's `<For>` DOM tracking. The `inverted` row sits on a dark strip so its light,
    // on-color fills stay visible (inverted is designed for solid, colored surfaces).
    <div class="not-prose flex flex-col gap-3 overflow-x-auto">
      <div class="flex items-center gap-3">
        <span class="w-16 shrink-0" />
        <For each={COLORS}>
          {(color) => (
            <span class="w-20 shrink-0 text-center font-mono text-xs text-foreground-muted">
              {color}
            </span>
          )}
        </For>
      </div>
      <For each={VARIANTS}>
        {(variant) => (
          <div
            class={`flex items-center gap-3 rounded-md ${
              variant === "inverted" ? "bg-surface-inverse py-2" : ""
            }`}
          >
            <span class="w-16 shrink-0 text-right font-mono text-xs text-foreground-muted">
              {variant}
            </span>
            <For each={COLORS}>
              {(color) => (
                <div class="flex w-20 shrink-0 justify-center">
                  <Badge variant={variant} colorScheme={color}>
                    Badge
                  </Badge>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
