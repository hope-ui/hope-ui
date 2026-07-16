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

// The preset shared with `theme-context.browser.test.tsx`: `ThemeProvider` is zero-DOM (token values
// live in a preset's CSS, not a runtime `<style>`), so the SSR output is exactly the probe `<button>`.
// Both files build the identical tree (`<ThemeProvider preset={preset}><Probe/></ThemeProvider>`), so
// hydration keys line up.
const preset = definePreset(theme);

function Probe() {
  const recipe = useRecipe("demo" as keyof RecipeRegistry) as SlotRecipeFn<DemoVariants>;
  // A real element so the render produces a hydratable node; the class proves the recipe *executes*
  // on the server, i.e. the provider's context is readable during renderToStringAsync.
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
  it("server-reads the injected recipe and emits its class string, with no <style> of its own", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={preset}>
        <Probe />
      </ThemeProvider>
    ));
    expect(html).toMatch(/\bdemo--size_sm\b/);
    // Zero-DOM provider: it contributes no markup, so nothing but the probe is emitted.
    expect(html).not.toContain("<style");
  });

  it("matches the committed SSR fixture byte for byte", async () => {
    // Genuine server output — the byte source the browser test hydrates. `_hk` keys and all.
    // Regenerate deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={preset}>
        <Probe />
      </ThemeProvider>
    ));
    await expect(html).toMatchFileSnapshot("./__fixtures__/theme-context-ssr.html");
  });
});
