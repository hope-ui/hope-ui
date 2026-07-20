import { describe, expect, it } from "vitest";
import type { AlertRecipeVariants, AlertSlot } from "../../recipes/alert";
import type { BadgeRecipeVariants, BadgeSlot } from "../../recipes/badge";
import type { ButtonRecipeVariants, ButtonSlot } from "../../recipes/button";
import type { CloseButtonRecipeVariants, CloseButtonSlot } from "../../recipes/close-button";
import type { DialogRecipeVariants, DialogSlot } from "../../recipes/dialog";
import type { SlotClassFn } from "../../recipes/slot-recipe";
import { type RecipeRegistry, THEMING_CONTRACT_VERSION } from "../recipe-registry";

// The registry declares each hope-authored component's recipe contract directly (no module
// augmentation), so a conforming theme provides every recipe named in it — here, `alert`, `badge`,
// `button`, `closeButton`, and `dialog`. This is a compile-time assignability check (verified by
// `pnpm typecheck`).
const _theme = {
  alert: (props?: AlertRecipeVariants): Record<AlertSlot, SlotClassFn> => ({
    root: () => `alert alert--${props?.variant ?? "default"}`,
    icon: () => "alert__icon",
    content: () => "alert__content",
    title: () => "alert__title",
    description: () => "alert__description",
    actions: () => "alert__actions",
    close: () => "alert__close",
  }),
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
  closeButton: (props?: CloseButtonRecipeVariants): Record<CloseButtonSlot, SlotClassFn> => ({
    root: () => `close close--${props?.size ?? "sm"}`,
    icon: () => "close__icon",
  }),
  dialog: (props?: DialogRecipeVariants): Record<DialogSlot, SlotClassFn> => ({
    backdrop: () => "dialog__backdrop",
    content: () => `dialog__content dialog__content--${props?.size ?? "md"}`,
    header: () => "dialog__header",
    body: () => "dialog__body",
    footer: () => "dialog__footer",
    title: () => "dialog__title",
    description: () => "dialog__description",
    closeTrigger: () => "dialog__close-trigger",
  }),
} satisfies RecipeRegistry;
void _theme;

describe("RecipeRegistry contract", () => {
  it("pins the contract version", () => {
    expect(THEMING_CONTRACT_VERSION).toBe(1);
  });
});
