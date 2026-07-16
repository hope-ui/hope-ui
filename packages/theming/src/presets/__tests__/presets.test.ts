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

  it("normalizes empty overrides — an empty components object", () => {
    const preset = definePreset(registry);
    expect(preset.components).toEqual({});
  });

  it("applies a config's components", () => {
    const preset = definePreset(registry, {
      components: {
        button: { defaultProps: { size: "sm" }, slotClasses: { root: "rounded-full" } },
      },
    });
    expect(preset.components.button?.defaultProps).toEqual({ size: "sm" });
    expect(preset.components.button?.slotClasses).toEqual({ root: "rounded-full" });
  });

  it("round-trips a behavioral defaultProps (not just a variant)", () => {
    // `defaultProps` widened from variants-only to the curated themeable surface, so a behavioral
    // policy prop (`nativeButton`) — not a recipe variant — is now expressible and carried verbatim.
    const preset = definePreset(registry, {
      components: { button: { defaultProps: { nativeButton: false } } },
    });
    expect(preset.components.button?.defaultProps).toEqual({ nativeButton: false });
  });

  it("deep-merges a behavioral defaultProps per key alongside a variant default", () => {
    const base = definePreset(registry, {
      components: { button: { defaultProps: { size: "lg" } } },
    });
    const derived = definePreset(base, {
      components: { button: { defaultProps: { nativeButton: false } } },
    });
    // The variant default from the base survives; the behavioral one from the override is added.
    expect(derived.components.button?.defaultProps).toEqual({ size: "lg", nativeButton: false });
  });
});

describe("definePreset — extend a preset (deep-merge, config wins)", () => {
  const base = definePreset(registry, {
    components: {
      button: {
        defaultProps: { variant: "solid", size: "lg" },
        slotClasses: { root: "shadow" },
      },
    },
  });

  it("inherits recipes from the base (config never carries recipes)", () => {
    const derived = definePreset(base, {
      components: { button: { defaultProps: { size: "xs" } } },
    });
    expect(derived.recipes).toBe(registry);
  });

  it("merges components per field — setting defaultProps keeps the base slotClasses", () => {
    const derived = definePreset(base, {
      components: { button: { defaultProps: { size: "xs" } } },
    });
    // defaultProps deep-merges per key (size overridden, variant retained)…
    expect(derived.components.button?.defaultProps).toEqual({ variant: "solid", size: "xs" });
    // …and the untouched slotClasses field survives.
    expect(derived.components.button?.slotClasses).toEqual({ root: "shadow" });
  });

  it("replaces slotClasses wholesale when the override provides it", () => {
    const derived = definePreset(base, {
      components: { button: { slotClasses: { label: "font-bold" } } },
    });
    expect(derived.components.button?.slotClasses).toEqual({ label: "font-bold" });
    expect(derived.components.button?.defaultProps).toEqual({ variant: "solid", size: "lg" });
  });

  it("does not mutate the base preset", () => {
    definePreset(base, {
      components: {
        button: { defaultProps: { size: "xs" }, slotClasses: { label: "font-bold" } },
      },
    });
    expect(base.components.button).toEqual({
      defaultProps: { variant: "solid", size: "lg" },
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
      components: {},
    } satisfies Record<symbol | string, unknown> as unknown as Preset;
    expect(isPreset(foreign)).toBe(true);
  });
});
