import type { JSX } from "@solidjs/web";
import { createMemo, createSignal } from "solid-js";
import { MoonIcon, SunIcon } from "~/components/Icons";
import { type ColorMode, colorMode, setColorMode } from "~/lib/color-mode";
import { deriveTokens } from "./generator";
import { PreviewApp } from "./PreviewApp";
import { PreviewLayerContext } from "./preview-layer";
import type { ThemeConfig } from "./theme-config";

// The live preview: ONE canvas element carries the derived `--hope-*` tokens as inline style, and
// every hope component inside it re-themes through the cascade (utilities resolve `var(--hope-*)` at
// the use site). The token map is a pure function of `config` + the site's color mode, both seeded
// deterministically, so the prerendered markup hydrates cleanly.
//
// The mode is the SITE's, read from `~/lib/color-mode` — the panel's own Light/Dark control writes
// that same store. The preview used to keep a private mode signal, which meant it could sit in light
// while the page around it was dark; now the two can't disagree, and either switch moves both.

// The preset derives its whole `--radius-*` scale from the single `--hope-radius` knob (see
// hope/tailwind.css). Overriding `--hope-radius` alone is NOT enough: those declarations sit on
// `:root`, so `--radius-lg: var(--hope-radius)` computes against the *document's* knob and
// descendants inherit that finished value. The scale is therefore restated here, with the preset's
// own multipliers, so the preview rounds corners exactly the way the exported theme.css will.
function radiusScale(radius: string): Record<string, string> {
  return {
    "--radius-xs": `calc(${radius} * 0.4)`,
    "--radius-sm": `calc(${radius} * 0.6)`,
    "--radius-md": `calc(${radius} * 0.8)`,
    "--radius-lg": radius,
    "--radius-xl": `calc(${radius} * 1.4)`,
    "--radius-2xl": `calc(${radius} * 1.8)`,
    "--radius-3xl": `calc(${radius} * 2.2)`,
    "--radius-4xl": `calc(${radius} * 2.6)`,
  };
}

function ModeToggle() {
  const seg = (target: ColorMode) =>
    `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
      colorMode() === target
        ? "bg-surface text-foreground shadow-sm"
        : "text-foreground-muted hover:text-foreground"
    }`;
  // A <fieldset> (implicit `group` role) rather than a div+role="group" — same reason RadiusControl
  // uses one, and it satisfies biome's useSemanticElements without a suppression.
  return (
    <fieldset
      class="inline-flex items-center rounded-lg border border-subtle bg-surface-sunken p-0.5"
      aria-label="Color mode"
    >
      <button
        type="button"
        class={seg("light")}
        aria-pressed={colorMode() === "light" ? "true" : "false"}
        onClick={() => setColorMode("light")}
      >
        <SunIcon class="size-3.5" />
        Light
      </button>
      <button
        type="button"
        class={seg("dark")}
        aria-pressed={colorMode() === "dark" ? "true" : "false"}
        onClick={() => setColorMode("dark")}
      >
        <MoonIcon class="size-3.5" />
        Dark
      </button>
    </fieldset>
  );
}

export function ThemePreview(props: { config: ThemeConfig }) {
  const tokens = createMemo(() => deriveTokens(props.config));
  // Published to the preview's parts so their popups portal *into* the canvas instead of
  // `document.body`, which is the only way a floating layer inherits the previewed tokens.
  const [canvas, setCanvas] = createSignal<HTMLElement>();

  const style = createMemo<JSX.CSSProperties>(() => {
    const map = tokens()[colorMode()];
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
        <ModeToggle />
      </div>

      {/* Themed canvas — every hope component below reads its color from these inline tokens. */}
      <div ref={setCanvas} class="p-4 sm:p-6" style={style()}>
        <PreviewLayerContext value={canvas}>
          <PreviewApp />
        </PreviewLayerContext>
      </div>
    </div>
  );
}
