import { Alert } from "@hope-ui/components/alert";
import { Badge } from "@hope-ui/components/badge";
import { Button } from "@hope-ui/components/button";
import { CloseButton } from "@hope-ui/components/close-button";
import type { JSX } from "@solidjs/web";
import { createMemo, createSignal } from "solid-js";
import { MoonIcon, SunIcon } from "~/components/Icons";
import { deriveTokens } from "./generator";
import type { ThemeConfig } from "./theme-config";

// The live preview: ONE wrapper carries the derived `--hope-*` tokens as inline style, and every
// hope component inside it re-themes through the cascade (utilities resolve `var(--hope-*)` at the
// use site). Setting the tokens inline — rather than toggling `.dark` — is what lets the preview
// have its OWN light/dark mode, independent of the site's. The token map is a pure function of
// `config` + `mode`, both seeded deterministically, so the prerendered markup hydrates cleanly.

// The preset derives its whole `--radius-*` scale from the single `--hope-radius` knob as px offsets
// (see hope/tailwind.css). Overriding `--hope-radius` inline should cascade into them, but we also
// set the scale explicitly so the rounding is guaranteed regardless of resolution order.
function radiusScale(radius: string): Record<string, string> {
  return {
    "--radius-xs": `calc(${radius} - 6px)`,
    "--radius-sm": `calc(${radius} - 4px)`,
    "--radius-md": `calc(${radius} - 2px)`,
    "--radius-lg": radius,
    "--radius-xl": `calc(${radius} + 4px)`,
    "--radius-2xl": `calc(${radius} + 8px)`,
    "--radius-3xl": `calc(${radius} + 12px)`,
    "--radius-4xl": `calc(${radius} + 16px)`,
  };
}

function ModeToggle(props: { mode: "light" | "dark"; onChange: (mode: "light" | "dark") => void }) {
  const seg = (target: "light" | "dark") =>
    `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
      props.mode === target
        ? "bg-surface text-foreground shadow-sm"
        : "text-foreground-muted hover:text-foreground"
    }`;
  // A <fieldset> (implicit `group` role) rather than a div+role="group" — same reason RolePicker /
  // RadiusControl use one, and it satisfies biome's useSemanticElements without a suppression.
  return (
    <fieldset
      class="inline-flex items-center rounded-lg border border-subtle bg-surface-sunken p-0.5"
      aria-label="Preview color mode"
    >
      <button
        type="button"
        class={seg("light")}
        aria-pressed={props.mode === "light" ? "true" : "false"}
        onClick={() => props.onChange("light")}
      >
        <SunIcon class="size-3.5" />
        Light
      </button>
      <button
        type="button"
        class={seg("dark")}
        aria-pressed={props.mode === "dark" ? "true" : "false"}
        onClick={() => props.onChange("dark")}
      >
        <MoonIcon class="size-3.5" />
        Dark
      </button>
    </fieldset>
  );
}

// A labeled showcase group. Header + content, styled with the (themed) preview tokens.
function Group(props: { title: string; children: JSX.Element }) {
  return (
    <section class="space-y-3">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">
        {props.title}
      </h3>
      {props.children}
    </section>
  );
}

export function ThemePreview(props: { config: ThemeConfig }) {
  // Preview mode seeds to "light" so SSR is deterministic; it is toggled independently of the site.
  const [mode, setMode] = createSignal<"light" | "dark">("light");
  const tokens = createMemo(() => deriveTokens(props.config));

  const style = createMemo<JSX.CSSProperties>(() => {
    const map = tokens()[mode()];
    const out: Record<string, string> = {};
    for (const key in map) {
      out[`--hope-${key}`] = map[key];
    }
    Object.assign(out, radiusScale(props.config.radius));
    // Paint the canvas itself from the themed surface/foreground so the mode switch is visible.
    out["background-color"] = "var(--hope-surface)";
    out.color = "var(--hope-foreground)";
    return out as JSX.CSSProperties;
  });

  return (
    <div class="overflow-hidden rounded-2xl border border-subtle bg-surface-raised shadow-sm">
      {/* Panel header — site chrome (NOT themed), so it stays legible in the site's own mode. */}
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-subtle px-4 py-2.5">
        <span class="text-sm font-medium text-foreground">Live preview</span>
        <ModeToggle mode={mode()} onChange={setMode} />
      </div>

      {/* Themed canvas — every hope component below reads its color from these inline tokens. */}
      <div class="space-y-8 p-6 sm:p-8" style={style()}>
        <Group title="Buttons · variants">
          <div class="flex flex-wrap items-center gap-3">
            <Button variant="solid" colorScheme="primary">
              Solid
            </Button>
            <Button variant="soft" colorScheme="primary">
              Soft
            </Button>
            <Button variant="outline" colorScheme="primary">
              Outline
            </Button>
            <Button variant="ghost" colorScheme="primary">
              Ghost
            </Button>
            <Button variant="link" colorScheme="primary">
              Link
            </Button>
          </div>
        </Group>

        <Group title="Buttons · roles">
          <div class="flex flex-wrap items-center gap-3">
            <Button variant="solid" colorScheme="primary">
              Primary
            </Button>
            <Button variant="solid" colorScheme="success">
              Success
            </Button>
            <Button variant="solid" colorScheme="info">
              Info
            </Button>
            <Button variant="solid" colorScheme="warning">
              Warning
            </Button>
            <Button variant="solid" colorScheme="danger">
              Danger
            </Button>
            <Button variant="soft" colorScheme="neutral">
              Neutral
            </Button>
          </div>
        </Group>

        <Group title="Buttons · sizes & states">
          <div class="flex flex-wrap items-center gap-3">
            <Button size="xs" variant="soft" colorScheme="primary">
              XS
            </Button>
            <Button size="sm" variant="soft" colorScheme="primary">
              SM
            </Button>
            <Button size="md" variant="solid" colorScheme="primary">
              MD
            </Button>
            <Button size="lg" variant="solid" colorScheme="primary" loading>
              Loading
            </Button>
            <Button size="lg" variant="outline" colorScheme="neutral" disabled>
              Disabled
            </Button>
          </div>
        </Group>

        <Group title="Badges">
          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="solid" colorScheme="primary">
              Solid
            </Badge>
            <Badge variant="soft" colorScheme="primary">
              Soft
            </Badge>
            <Badge variant="subtle" colorScheme="primary">
              Subtle
            </Badge>
            <Badge variant="outline" colorScheme="primary">
              Outline
            </Badge>
            <Badge variant="dot" colorScheme="success">
              Live
            </Badge>
            <Badge variant="dot" colorScheme="warning">
              Pending
            </Badge>
            <Badge variant="dot" colorScheme="danger">
              Error
            </Badge>
            <Badge variant="solid" colorScheme="danger" shape="circle" size="sm">
              7
            </Badge>
          </div>
        </Group>

        <Group title="Alerts">
          <div class="space-y-3">
            <Alert.Root
              colorScheme="info"
              variant="soft"
              title="Heads up"
              description="This is an informational alert, themed live."
            />
            <Alert.Root
              colorScheme="success"
              variant="soft"
              title="Saved"
              description="Your changes have been stored."
            />
            <Alert.Root
              colorScheme="warning"
              variant="soft"
              title="Careful"
              description="This action needs your attention."
              closable
            />
            <Alert.Root
              colorScheme="danger"
              variant="solid"
              title="Something went wrong"
              description="We couldn't complete the request."
            />
          </div>
        </Group>

        <Group title="Close button · surface-adaptive">
          {/* CloseButton takes its color from the surface it sits on (currentColor), so it reads on a
              plain surface and on a solid role fill alike. */}
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2 rounded-lg border border-subtle bg-surface-raised px-3 py-2 text-foreground">
              <span class="text-sm">On a surface</span>
              <CloseButton size="sm" />
              <CloseButton size="md" />
              <CloseButton size="lg" />
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-on-primary">
              <span class="text-sm">On primary</span>
              <CloseButton size="md" />
            </div>
          </div>
        </Group>

        {/* Composed surface card — surfaces + foreground ramp + borders + role fills together. */}
        <Group title="Composed surface">
          <div class="rounded-xl border border-subtle bg-surface-raised p-4 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary shadow-sm">
                <SunIcon class="size-5" />
              </div>
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-foreground">Project theme</div>
                <div class="truncate text-xs text-foreground-muted">Preview across surfaces</div>
              </div>
              <Badge class="ml-auto" variant="soft" colorScheme="success">
                Ready
              </Badge>
            </div>
            <p class="mt-3 text-sm text-foreground-muted">
              Elevation, text ramp, borders and role colors all resolve from the tokens you picked.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="solid" colorScheme="primary">
                Confirm
              </Button>
              <Button size="sm" variant="soft" colorScheme="neutral">
                Cancel
              </Button>
            </div>
          </div>
        </Group>
      </div>
    </div>
  );
}
