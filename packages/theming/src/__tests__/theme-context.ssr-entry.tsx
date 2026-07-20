import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { definePreset } from "../preset";
import type { RecipeRegistry } from "../recipe-registry";
import type { SlotRecipeFn } from "../slot-recipe";
import { ThemeProvider, useRecipe } from "../theme-context";

// The single source of truth for the ThemeProvider SSR → hydration round-trip tree, shared by
// `theme-context.ssr.test.tsx` (renders it, inline-snapshots the bytes), `theme-context.browser.test.tsx`
// (passes it to hydrateFixture), and the hydration-fixture bridge (renders it server-side to feed the
// browser test). Reusing one tree enforces "structurally identical server and client".

// A synthetic single-"root"-slot recipe stands in for a real component's recipe, cast into the
// registry so this exercises the machinery — how a preset is injected and read — without depending
// on any real component's API or variant vocabulary.
type DemoVariants = { size?: "sm" | "md" };
const demo: SlotRecipeFn<DemoVariants> = (props) => ({
  root: () => `demo demo--size_${props?.size ?? "md"}`,
});
const theme = { demo } as unknown as RecipeRegistry;

// `ThemeProvider` is zero-DOM (token values live in a preset's CSS, not a runtime `<style>`), so the
// output is exactly the probe `<button>` — no wrapper node to shift `_hk` keys.
const preset = definePreset(theme);

function Probe(): JSX.Element {
  const recipe = useRecipe("demo" as keyof RecipeRegistry) as SlotRecipeFn<DemoVariants>;
  // A real element so the render produces a hydratable node; the class proves the recipe *executes*
  // (the provider's context is readable during render), on both server and client.
  return (
    <button type="button" class={recipe({ size: "sm" }).root()}>
      go
    </button>
  );
}

export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={preset}>
      <Probe />
    </ThemeProvider>
  );
}

/** The server render the hydration-fixture bridge invokes. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
