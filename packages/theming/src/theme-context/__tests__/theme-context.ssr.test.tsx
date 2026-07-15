import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import type { RecipeRegistry } from "../../registry/registry";
import type { SlotRecipeFn } from "../../styling/recipe";
import { ThemeProvider, useRecipe } from "../theme-context";

// A synthetic single-"root"-slot recipe stands in for a real component's recipe, cast into the
// registry so this exercises the machinery — how a recipe is injected and read — without depending
// on any real component's API or variant vocabulary.
type DemoVariants = { size?: "sm" | "md" };
const demo: SlotRecipeFn<DemoVariants> = (props) => ({
  root: () => `demo demo--size_${props?.size ?? "md"}`,
});
const theme = { demo } as unknown as RecipeRegistry;

function Probe() {
  const recipe = useRecipe("demo" as keyof RecipeRegistry) as SlotRecipeFn<DemoVariants>;
  // Returns the recipe's class string as text — the point is only that the recipe *executes* on the
  // server, i.e. the provider's context is readable during `renderToStringAsync`.
  return recipe({ size: "sm" }).root();
}

// SSR (node, server builds of solid-js AND @solidjs/web): proves the ThemeProvider context is
// readable during `renderToStringAsync` — it resolves through the owner graph the server render
// establishes, so a provider wrapping the server render delivers the recipe on the server. This
// is the "works in SolidStart" half for theming.
describe("ThemeProvider + useRecipe on the server", () => {
  it("server-reads the injected recipe and emits its class string", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider theme={theme}>
        <Probe />
      </ThemeProvider>
    ));
    expect(html).toMatch(/\bdemo--size_sm\b/);
  });
});
