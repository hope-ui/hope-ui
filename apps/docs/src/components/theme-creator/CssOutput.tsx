import { createMemo, createSignal, onCleanup, Show } from "solid-js";
import { CheckIcon, CopyIcon } from "~/components/Icons";
import { toCss } from "./generator";
import type { ThemeConfig } from "./theme-config";

// The generated `theme.css` with a Copy button. `toCss` is a pure function of `config`, so the
// prerendered markup is deterministic; `navigator.clipboard` is the only client-side bit (guarded,
// fired on click) — the same island pattern as CodeBlock.tsx.
export function CssOutput(props: { config: ThemeConfig }) {
  const css = createMemo(() => toCss(props.config));
  const [copied, setCopied] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css());
      setCopied(true);
      clearTimeout(timer);
      timer = setTimeout(() => setCopied(false), 2000);
    } catch {
      // navigator.clipboard needs a secure context; ignore failures silently.
    }
  };

  return (
    <div class="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-subtle bg-surface-sunken shadow-sm">
      <div class="flex items-center justify-between gap-2 border-b border-subtle bg-surface-raised px-4 py-2.5">
        <span class="font-mono text-xs text-foreground-muted">theme.css</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied() ? "theme.css copied to clipboard" : "Copy theme.css to clipboard"}
          class="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised"
        >
          {/* Icon swap wrapped in host <span>s so the first child of the <Show> boundary is a host
              element, not a component (SolidJS 2.0 hydration-walk safety — see index.tsx). */}
          <span class="grid size-3.5 place-items-center">
            <Show
              when={copied()}
              fallback={
                <span>
                  <CopyIcon class="size-3.5" />
                </span>
              }
            >
              <span>
                <CheckIcon class="size-3.5" />
              </span>
            </Show>
          </span>
          {copied() ? "Copied" : "Copy"}
        </button>
      </div>

      <pre class="overflow-auto p-4 font-mono text-[11px] leading-relaxed text-foreground">
        <code>{css()}</code>
      </pre>

      <p class="border-t border-subtle px-4 py-2 text-[11px] leading-relaxed text-foreground-subtle">
        Import after <code class="text-foreground-muted">@hope-ui/presets/hope/tailwind.css</code>{" "}
        so these values win.
      </p>
    </div>
  );
}
