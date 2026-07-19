import { For } from "solid-js";
import { RADIUS_PRESETS } from "./theme-config";

// Segmented corner-radius control. Native `<input type="radio">`s again (keyboard + single-select
// for free), visually a connected segmented bar; the selected segment is a filled primary pill (the
// same treatment as the nav tabs). This is site chrome, so it uses the site's own tokens, not the
// theme being built.
export function RadiusControl(props: { value: string; onChange: (value: string) => void }) {
  return (
    <fieldset class="min-w-0">
      <legend class="text-sm font-semibold text-foreground">Radius</legend>
      <div class="mt-2 inline-flex flex-wrap gap-0.5 rounded-lg border border-subtle bg-surface p-0.5">
        <For each={RADIUS_PRESETS}>
          {(preset) => {
            const selected = () => props.value === preset.value;
            // Reactive class string (`classList` is not honored in this Solid 2.0 build).
            const segClass = () =>
              `inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-focus ${
                selected()
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-foreground-muted hover:bg-surface-raised-hovered hover:text-foreground"
              }`;
            return (
              <label class="cursor-pointer">
                <input
                  type="radio"
                  name="tc-radius"
                  value={preset.value}
                  checked={selected()}
                  onChange={() => props.onChange(preset.value)}
                  class="peer sr-only"
                  aria-label={`${preset.label} (${preset.value})`}
                />
                <span class={segClass()}>{preset.label}</span>
              </label>
            );
          }}
        </For>
      </div>
    </fieldset>
  );
}
