import { For } from "solid-js";
import type { Family } from "./theme-config";

// A labeled grid of color swatches for one role. Native `<input type="radio">`s (visually replaced
// by the swatch) give single-select semantics and arrow-key navigation for free — no custom widget,
// matching hope-ui's "use the native control until a real component ships" stance. Each swatch is
// filled with `var(--color-<family>-500)`; the docs app keeps the whole palette alive (see
// styles/palette-keepalive.css) so every family resolves. SSR-safe: `checked` is a pure function of
// the current value, and `onChange` is the only client-side bit.
export function RolePicker<F extends Family>(props: {
  /** Radio group name — must be unique on the page. */
  name: string;
  /** Group heading, e.g. "Primary". */
  label: string;
  /** One-line purpose. */
  hint: string;
  /** The families to offer. */
  families: readonly F[];
  /** The selected family. */
  value: F;
  onChange: (family: F) => void;
}) {
  return (
    <fieldset class="min-w-0">
      <legend class="flex w-full items-baseline justify-between gap-2">
        <span class="text-sm font-semibold text-foreground">{props.label}</span>
        <span class="font-mono text-xs text-foreground-subtle">{props.value}</span>
      </legend>
      <p class="mt-0.5 text-xs text-foreground-muted">{props.hint}</p>

      <div class="mt-2.5 flex flex-wrap gap-1.5">
        <For each={props.families}>
          {(family) => {
            const selected = () => props.value === family;
            // Reactive class string — `classList` is not honored in this Solid 2.0 build (see
            // TableOfContents.tsx). The permanent edge is an *inset* ring; selection/focus is an
            // *outset* `outline`, so the two never fight over the same ring width/color.
            const swatchClass = () =>
              `block size-7 rounded-md shadow-sm ring-1 ring-inset ring-black/10 transition-transform dark:ring-white/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus ${
                selected() ? "outline-2 outline-offset-2 outline-focus scale-110" : ""
              }`;
            return (
              <label class="cursor-pointer" title={family}>
                <input
                  type="radio"
                  name={props.name}
                  value={family}
                  checked={selected()}
                  onChange={() => props.onChange(family)}
                  class="peer sr-only"
                  aria-label={family}
                />
                <span
                  class={swatchClass()}
                  style={{ "background-color": `var(--color-${family}-500)` }}
                />
              </label>
            );
          }}
        </For>
      </div>
    </fieldset>
  );
}
