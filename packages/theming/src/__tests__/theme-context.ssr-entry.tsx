import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { definePreset } from "../preset";
import type { RecipeRegistry } from "../recipe-registry";
import type { SlotRecipeFn } from "../slot-recipe";
import { ThemeProvider, useRecipe } from "../theme-context";

// The one definition of the tree used for the ThemeProvider server-render → hydration round-trip:
// `theme-context.ssr.test.tsx` snapshots its bytes, `theme-context.browser.test.tsx` hydrates it, and
// the fixture bridge renders it server-side to feed that browser test. Sharing a single definition is
// what guarantees the server and client halves are structurally identical.

// A synthetic single-slot recipe stands in for a real component's, cast into the registry, so these
// tests exercise the machinery — how a preset is injected and read — and not any component's API.
type DemoVariants = { size?: "sm" | "md" };
const demo: SlotRecipeFn<DemoVariants> = (props) => ({
  root: () => `demo demo--size_${props?.size ?? "md"}`,
});
const theme = { demo } as unknown as RecipeRegistry;

// `ThemeProvider` renders no DOM (token values live in a preset's CSS, not a runtime `<style>`), so
// the output is exactly the probe `<button>`. Solid pairs server and client nodes by their position
// in the tree, so a wrapper node here would shift every hydration key below it.
const preset = definePreset(theme);

function Probe(): JSX.Element {
  const recipe = useRecipe("demo" as keyof RecipeRegistry) as SlotRecipeFn<DemoVariants>;
  // A real element, so the render produces a hydratable node. The class is the evidence: it only
  // appears if the recipe ran, which means the provider's context was readable during that render.
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
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
