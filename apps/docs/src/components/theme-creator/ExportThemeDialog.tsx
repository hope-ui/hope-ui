import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Dialog } from "@hope-ui/components/dialog";
import type { JSX } from "@solidjs/web";
import { createMemo, createSignal, onCleanup } from "solid-js";
import { CheckIcon, CodeIcon, CopyIcon } from "~/components/Icons";
import { toCss } from "./generator";
import type { ThemeConfig } from "./theme-config";

// The generated `theme.css`, shown on demand inside a hope Dialog rather than a permanent column —
// the whole reason the live preview can now claim the page. `toCss` is a pure function of `config`,
// so nothing here runs during SSR (Dialog.Portal returns null on the server and the dialog defaults
// closed); `navigator.clipboard` is the only client-side bit, guarded and fired on click.
export function ExportThemeDialog(props: { config: ThemeConfig }) {
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

  // Solid types a native button's props wider than `Button` does (e.g. `disabled: boolean | ""`), so
  // the spread is cast — the same bridge Dialog.CloseTrigger makes onto CloseButton.
  const trigger = (p: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button
      {...(p as ButtonProps)}
      fullWidth
      size="lg"
      variant="solid"
      colorScheme="primary"
      endDecorator={<CodeIcon />}
    >
      Export theme
    </Button>
  );

  return (
    <Dialog.Root size="xl" scrollBehavior="inside">
      <Dialog.Trigger render={trigger} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Export theme</Dialog.Title>
              <Dialog.Description>
                Import after{" "}
                <code class="text-foreground-muted">@hope-ui/presets/hope/tailwind.css</code> so
                these values win.
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Body class="rounded-xl border border-subtle">
              <div class="overflow-hidden bg-surface-sunken">
                <div class="border-b border-subtle bg-surface-raised px-4 py-2">
                  <span class="font-mono text-xs text-foreground-muted">theme.css</span>
                </div>
                <pre class="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground">
                  <code>{css()}</code>
                </pre>
              </div>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                variant="solid"
                size="lg"
                onClick={copy}
                endDecorator={copied() ? <CheckIcon /> : <CopyIcon />}
              >
                {copied() ? "Copied" : "Copy CSS"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
