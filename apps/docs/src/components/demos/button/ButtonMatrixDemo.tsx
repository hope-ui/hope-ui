import { Button } from "@hope-ui/components/button";
import type { ButtonColorScheme, ButtonVariant } from "@hope-ui/theming";
import { For } from "solid-js";

// The full `variant` × `colorScheme` grid for the doc's "Color schemes" section — a
// per-role matrix that reads better as a live component than as inline MDX. Mirrors
// the component's `VariantColorMatrix` story.
//
// `default` is intentionally omitted: it is color-independent (it ignores
// `colorScheme`), so it has no row here. The `inverted` row sits on a dark strip so its
// light fills stay visible on the page background.
const COLORED_VARIANTS: Exclude<ButtonVariant, "default">[] = [
  "solid",
  "inverted",
  "soft",
  "outline",
  "ghost",
  "link",
];
const COLORS: ButtonColorScheme[] = ["primary", "neutral", "success", "info", "warning", "danger"];

export function ButtonMatrixDemo() {
  return (
    // Each `<For>` callback returns exactly one element (a flex row, or one cell) — never a
    // fragment wrapping another `<For>`, which yields a variable node count per row and breaks
    // Solid's `<For>` DOM tracking. Flex rows keep the columns aligned.
    <div class="not-prose flex flex-col gap-3 overflow-x-auto">
      <div class="flex items-center gap-3">
        <span class="w-14 shrink-0" />
        <For each={COLORS}>
          {(color) => (
            <span class="w-20 shrink-0 text-center font-mono text-xs text-foreground-muted">
              {color}
            </span>
          )}
        </For>
      </div>
      <For each={COLORED_VARIANTS}>
        {(variant) => (
          <div
            class={`flex items-center gap-3 rounded-md ${
              variant === "inverted" ? "bg-surface-inverse py-2" : ""
            }`}
          >
            <span class="w-14 shrink-0 text-right font-mono text-xs text-foreground-muted">
              {variant}
            </span>
            <For each={COLORS}>
              {(color) => (
                <div class="flex w-20 shrink-0 justify-center">
                  <Button variant={variant} colorScheme={color} size="sm">
                    Button
                  </Button>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
