import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import type { RecipeRegistry } from "../../registry/registry";
import type { SlotRecipeFn } from "../../styling/recipe";
import { ThemeProvider, useRecipe } from "../theme-context";

// Synthetic single-"root"-slot recipe, cast into the registry — see the ssr test for the
// rationale. Proves the same context round-trip on the real client runtime.
type DemoVariants = { size?: "sm" | "md" };
const demo: SlotRecipeFn<DemoVariants> = (props) => ({
  root: () => `demo demo--size_${props?.size ?? "md"}`,
});
const theme = { demo } as unknown as RecipeRegistry;

function Probe() {
  const recipe = useRecipe("demo" as keyof RecipeRegistry) as SlotRecipeFn<DemoVariants>;
  return (
    <button type="button" class={recipe({ size: "sm" }).root()}>
      go
    </button>
  );
}

describe("ThemeProvider + useRecipe on the client", () => {
  it("client-reads the injected recipe and applies its class to the DOM", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider theme={theme}>
        <Probe />
      </ThemeProvider>
    ));

    const button = page.getByRole("button", { name: "go" });
    await expect.element(button).toBeInTheDocument();
    expect(container.querySelector("button")?.className).toContain("demo--size_sm");

    await expectNoA11yViolations(container);
    dispose();
  });
});
