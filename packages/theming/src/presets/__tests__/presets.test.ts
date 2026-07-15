import { describe, expect, it } from "vitest";
import type { ButtonRecipe } from "../../recipes/button";
import type { RecipeRegistry } from "../../recipes/registry";
import { definePreset, isPreset, type Preset } from "../presets";

// A minimal, self-contained recipe map — the theming package must not depend on `@hope-ui/presets`.
// The class functions are stubs; these tests exercise the *machinery* (merge + brand), not styling.
const stubRecipe: ButtonRecipe = () => ({
  root: () => "",
  label: () => "",
  startDecorator: () => "",
  endDecorator: () => "",
  loader: () => "",
});
const registry: RecipeRegistry = { button: stubRecipe };

describe("definePreset — bootstrap from a raw registry", () => {
  it("brands the result and carries the registry as `recipes`", () => {
    const preset = definePreset(registry);
    expect(isPreset(preset)).toBe(true);
    expect(preset.recipes).toBe(registry);
    expect(preset.recipes.button).toBe(stubRecipe);
  });

  it("normalizes empty overrides — no tokens, no components, default darkMode", () => {
    const preset = definePreset(registry);
    expect(preset.tokens).toEqual({});
    expect(preset.components).toEqual({});
    expect(preset.darkMode).toBe(".dark");
  });

  it("applies a config's tokens, components, and darkMode", () => {
    const preset = definePreset(registry, {
      darkMode: "media",
      tokens: {
        colors: { primary: { light: "violet.600", dark: "violet.400" } },
        radii: { base: "0.5rem" },
      },
      components: {
        button: { defaultVariants: { size: "sm" }, slotClasses: { root: "rounded-full" } },
      },
    });
    expect(preset.darkMode).toBe("media");
    expect(preset.tokens.colors?.primary).toEqual({ light: "violet.600", dark: "violet.400" });
    expect(preset.tokens.radii?.base).toBe("0.5rem");
    expect(preset.components.button?.defaultVariants).toEqual({ size: "sm" });
    expect(preset.components.button?.slotClasses).toEqual({ root: "rounded-full" });
  });

  it("retains camelCase keys and Tailwind-shorthand values verbatim (CSS transform is token-css's job)", () => {
    const preset = definePreset(registry, {
      tokens: { colors: { onPrimarySoft: "amber.100", foregroundMuted: { light: "mauve.600" } } },
    });
    expect(preset.tokens.colors).toEqual({
      onPrimarySoft: "amber.100",
      foregroundMuted: { light: "mauve.600" },
    });
  });
});

describe("definePreset — extend a preset (deep-merge, config wins)", () => {
  const base = definePreset(registry, {
    darkMode: "[data-theme=dark]",
    tokens: { colors: { primary: "violet.600", neutral: "mauve.500" }, radii: { base: "0.5rem" } },
    components: {
      button: {
        defaultVariants: { variant: "solid", size: "lg" },
        slotClasses: { root: "shadow" },
      },
    },
  });

  it("inherits recipes from the base (config never carries recipes)", () => {
    const derived = definePreset(base, { tokens: { colors: { primary: "indigo.600" } } });
    expect(derived.recipes).toBe(registry);
  });

  it("merges tokens per token — an override replaces that token, siblings are kept", () => {
    const derived = definePreset(base, { tokens: { colors: { primary: "indigo.600" } } });
    expect(derived.tokens.colors).toEqual({ primary: "indigo.600", neutral: "mauve.500" });
    expect(derived.tokens.radii).toEqual({ base: "0.5rem" }); // radii untouched
  });

  it("merges components per field — setting defaultVariants keeps the base slotClasses", () => {
    const derived = definePreset(base, {
      components: { button: { defaultVariants: { size: "xs" } } },
    });
    // defaultVariants deep-merges per variant key (size overridden, variant retained)…
    expect(derived.components.button?.defaultVariants).toEqual({ variant: "solid", size: "xs" });
    // …and the untouched slotClasses field survives.
    expect(derived.components.button?.slotClasses).toEqual({ root: "shadow" });
  });

  it("replaces slotClasses wholesale when the override provides it", () => {
    const derived = definePreset(base, {
      components: { button: { slotClasses: { label: "font-bold" } } },
    });
    expect(derived.components.button?.slotClasses).toEqual({ label: "font-bold" });
    expect(derived.components.button?.defaultVariants).toEqual({ variant: "solid", size: "lg" });
  });

  it("resolves darkMode as config ?? base ?? '.dark'", () => {
    expect(definePreset(base).darkMode).toBe("[data-theme=dark]"); // inherit base
    expect(definePreset(base, { darkMode: "media" }).darkMode).toBe("media"); // config wins
    expect(definePreset(registry).darkMode).toBe(".dark"); // bootstrap default
  });

  it("does not mutate the base preset", () => {
    definePreset(base, {
      tokens: { colors: { primary: "indigo.600" } },
      components: {
        button: { defaultVariants: { size: "xs" }, slotClasses: { label: "font-bold" } },
      },
    });
    expect(base.tokens.colors).toEqual({ primary: "violet.600", neutral: "mauve.500" });
    expect(base.components.button).toEqual({
      defaultVariants: { variant: "solid", size: "lg" },
      slotClasses: { root: "shadow" },
    });
  });
});

describe("isPreset", () => {
  it("is true for a defined preset, false for a raw registry", () => {
    expect(isPreset(definePreset(registry))).toBe(true);
    expect(isPreset(registry)).toBe(false);
  });

  it("is false for non-preset values", () => {
    for (const value of [null, undefined, {}, "preset", 42, [], () => {}]) {
      expect(isPreset(value)).toBe(false);
    }
  });

  it("recognizes a preset branded by a separate copy via the cross-realm Symbol.for registry", () => {
    // Simulates a Preset produced by a *different* installed copy of @hope-ui/theming: same global
    // symbol key, so `isPreset` must accept it (constraint #6).
    const foreign = {
      [Symbol.for("hope-ui.preset")]: true,
      recipes: registry,
      tokens: {},
      components: {},
      darkMode: ".dark",
    } satisfies Record<symbol | string, unknown> as unknown as Preset;
    expect(isPreset(foreign)).toBe(true);
  });
});
