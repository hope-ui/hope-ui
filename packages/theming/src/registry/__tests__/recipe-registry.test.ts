import { describe, expect, it } from "vitest";
import type { BadgeRecipeVariants, BadgeSlot } from "../../recipes/badge";
import type { ButtonRecipeVariants, ButtonSlot } from "../../recipes/button";
import type { SlotClassFn } from "../../recipes/slot-recipe";
import { type RecipeRegistry, THEMING_CONTRACT_VERSION } from "../recipe-registry";

// The registry declares each hope-authored component's recipe contract directly (no module
// augmentation), so a conforming theme provides every recipe named in it — here, `badge` and
// `button`. This is a compile-time assignability check (verified by `pnpm typecheck`).
const _theme = {
  badge: (props?: BadgeRecipeVariants): Record<BadgeSlot, SlotClassFn> => ({
    root: () => `badge badge--${props?.variant ?? "soft"}`,
    label: () => "badge__label",
    startDecorator: () => "badge__start",
    endDecorator: () => "badge__end",
    dot: () => "badge__dot",
  }),
  button: (props?: ButtonRecipeVariants): Record<ButtonSlot, SlotClassFn> => ({
    root: () => `btn btn--${props?.variant ?? "default"}`,
    label: () => "btn__label",
    startDecorator: () => "btn__start",
    endDecorator: () => "btn__end",
    loader: () => "btn__loader",
  }),
} satisfies RecipeRegistry;
void _theme;

describe("RecipeRegistry contract", () => {
  it("pins the contract version", () => {
    expect(THEMING_CONTRACT_VERSION).toBe(1);
  });
});
