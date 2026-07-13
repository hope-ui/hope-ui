import { describe, expect, it } from "vitest";
import { type SlotRecipeFn, THEMING_CONTRACT_VERSION, type ThemeRecipes } from "../theme-recipes";

// --- Type-level contract checks (verified by `pnpm typecheck`, not at runtime) ---

// A single-part recipe defaults to the "root" slot; the return type is Record<Slot, string>.
const singleSlot: SlotRecipeFn<{ size?: "sm" | "md" }> = (props) => ({
  root: `x x--size_${props?.size ?? "md"}`,
});
const _rootIsDefault: string = singleSlot().root;
void _rootIsDefault;

// A multi-part recipe names its slots; each is a class string.
const multiSlot: SlotRecipeFn<{ variant?: "a" }, "root" | "label"> = () => ({
  root: "y",
  label: "y__label",
});
const _label: string = multiSlot().label;
void _label;

// The registry is empty by design, so an empty theme satisfies it in isolation. Components/themes
// add entries by `declare module "@hope-ui/theming"`; that augmentation isn't declared here because
// it would leak across the whole program's typecheck.
const _emptyTheme = {} satisfies ThemeRecipes;
void _emptyTheme;

// --- Runtime check ---

describe("theme-recipes contract", () => {
  it("pins the contract version", () => {
    expect(THEMING_CONTRACT_VERSION).toBe(1);
  });
});
