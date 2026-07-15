import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { definePreset } from "../../presets";
import type { RecipeRegistry } from "../../recipes/registry";
import type { SlotRecipeFn } from "../../recipes/slot-recipe";
import { ThemeProvider, useRecipe } from "../theme-context";

// A synthetic single-"root"-slot recipe stands in for a real component's recipe, cast into the
// registry so this exercises the machinery — how a preset is injected and read — without depending
// on any real component's API or variant vocabulary.
type DemoVariants = { size?: "sm" | "md" };
const demo: SlotRecipeFn<DemoVariants> = (props) => ({
  root: () => `demo demo--size_${props?.size ?? "md"}`,
});
const theme = { demo } as unknown as RecipeRegistry;

// The token preset shared with `theme-context.browser.test.tsx`: its `renderPresetStyle` output is
// deterministic, so the browser test hydrates the exact bytes this file snapshots. Both files build
// the identical tree (`<ThemeProvider preset={tokenPreset}><Probe/></ThemeProvider>`), so hydration
// keys line up.
const tokenPreset = definePreset(theme, {
  tokens: {
    colors: { primary: { light: "violet.600", dark: "violet.400" } },
    radii: { base: "0.5rem" },
  },
});

// The exact `<style>` text `renderPresetStyle` emits for `tokenPreset`: colors in the fixed
// SEMANTIC_COLOR_TOKENS order, radii after them in `:root`, and a `.dark` block for the one token
// with a dark value. Byte-for-byte, so a regression in the renderer surfaces here, not in a vague
// hydration mismatch downstream.
const EXPECTED_STYLE =
  ":root {\n" +
  "  --hope-primary: var(--color-violet-600);\n" +
  "  --hope-radii-base: 0.5rem;\n" +
  "}\n" +
  ".dark {\n" +
  "  --hope-primary: var(--color-violet-400);\n" +
  "}";

function Probe() {
  const recipe = useRecipe("demo" as keyof RecipeRegistry) as SlotRecipeFn<DemoVariants>;
  // A real element so the token case produces a hydratable node; the class proves the recipe
  // *executes* on the server, i.e. the provider's context is readable during renderToStringAsync.
  return (
    <button type="button" class={recipe({ size: "sm" }).root()}>
      go
    </button>
  );
}

// SSR (node, server builds of solid-js AND @solidjs/web): proves the ThemeProvider context is
// readable during `renderToStringAsync` — it resolves through the owner graph the server render
// establishes, so a provider wrapping the server render delivers the recipe on the server. This is
// the "works in SolidStart" half for theming.
describe("ThemeProvider + useRecipe on the server", () => {
  it("server-reads the injected recipe and emits its class string (no-token preset)", async () => {
    // A token-free preset takes the zero-DOM branch — no `<style>` in the output at all.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={definePreset(theme)}>
        <Probe />
      </ThemeProvider>
    ));
    expect(html).toMatch(/\bdemo--size_sm\b/);
    expect(html).not.toContain("<style");
  });

  it("inlines a deterministic token <style> and still server-reads the recipe", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={tokenPreset}>
        <Probe />
      </ThemeProvider>
    ));
    // The exact `<style>` text, and the recipe class alongside it.
    expect(html).toContain(EXPECTED_STYLE);
    expect(html).toMatch(/\bdemo--size_sm\b/);
    // Genuine server output — the byte source the browser test hydrates. `_hk` keys and all.
    // Regenerate deliberately with `pnpm exec vitest run --project=ssr -u`.
    await expect(html).toMatchFileSnapshot("./__fixtures__/theme-context-tokens-ssr.html");
  });
});
