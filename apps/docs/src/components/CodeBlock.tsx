import { Dynamic } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";

type AnyProps = Record<string, unknown>;

// Custom `pre` for MDX code blocks. Renders the highlighted <pre> produced by
// rehype-pretty-code (via the `providerImportSource` map in mdx-components.tsx)
// wrapped with a hover-revealed copy button.
//
// The button reads the <pre>'s `textContent` at click time — line numbers are
// CSS `::before` counters and never enter textContent, so this yields clean
// source. `onClick` / `navigator.clipboard` are client-only, so this is
// SSG-safe: the markup renders on the server and the interactivity hydrates.
export function CodeBlock(props: AnyProps) {
  let pre: HTMLElement | undefined;
  const [copied, setCopied] = createSignal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pre?.textContent ?? "");
      setCopied(true);
      clearTimeout(timer);
      timer = setTimeout(() => setCopied(false), 2000);
    } catch {
      // navigator.clipboard needs a secure context; ignore failures silently.
    }
  };

  return (
    <div class="group relative">
      <button
        type="button"
        onClick={copy}
        aria-label={copied() ? "Code copied to clipboard" : "Copy code to clipboard"}
        class="absolute right-2 top-2 z-10 rounded-md border border-strong bg-surface-raised-hovered/80 px-2 py-1 text-xs font-medium text-foreground-muted opacity-0 backdrop-blur transition-opacity hover:bg-surface-raised-pressed focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied() ? "Copied" : "Copy"}
      </button>
      <Dynamic component="pre" {...props} ref={(el: HTMLElement) => (pre = el)} />
    </div>
  );
}
