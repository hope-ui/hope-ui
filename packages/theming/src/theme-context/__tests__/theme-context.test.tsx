import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { definePreset, type Preset, type PresetConfig } from "../../presets";
import type { RecipeRegistry } from "../../recipes/registry";
import type { SlotRecipeFn } from "../../recipes/slot-recipe";
import { ThemeProvider, useDefaults, useRecipe, useSlots, useTheme } from "../theme-context";

// Unit (node, client build): the pure-logic half of the provider — the `use*` hooks reading a
// Preset out of context, the friendly missing-provider error, and the D7 non-preset guard. Context
// is exercised without a DOM by invoking the provider's returned accessor (see `inProvider`), the
// same technique `create-component-context.test.ts` uses. This works because a token-free preset
// takes the zero-DOM branch, so `ThemeProvider` returns a bare context provider (no `<style>`).

// A synthetic recipe standing in for a real component's recipe — two slots, so slot-composition
// precedence is observable. The slot fns fold in `{ class }` like a real `tv` recipe would, so
// `useSlots`' output shows the whole `base → preset → instance → class` chain as a plain string.
type DemoVariants = { size?: "sm" | "md" | "lg"; tone?: "brand" | "plain" };
type DemoSlot = "root" | "label";
/** Space-join truthy string parts — a stand-in for a `tv` slot fn that keeps the output a `string`. */
function join(...parts: unknown[]): string {
  return parts
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(" ");
}
const demo: SlotRecipeFn<DemoVariants, DemoSlot> = () => ({
  root: (o) => join("base-root", o?.class),
  label: (o) => join("base-label", o?.class),
});
const registry = { demo } as unknown as RecipeRegistry;
// "demo" isn't a real registry key; cast at the call boundary the way the ssr/browser tests do.
const recipe = "demo" as keyof RecipeRegistry;

/** Build a demo preset from the synthetic registry; `config` is cast (its keys are synthetic). */
function demoPreset(config?: unknown): Preset {
  return definePreset(registry, config as PresetConfig | undefined);
}

/**
 * Runs `use()` inside a `<ThemeProvider>`'s owner and returns its result. `ThemeProvider` with a
 * token-free preset returns the `ThemeContext` provider accessor directly (zero-DOM branch);
 * invoking it evaluates `children` within the context, exactly as inserting it into DOM would.
 */
function inProvider<T>(preset: Preset, use: () => T): T {
  let captured!: T;
  createRoot((dispose) => {
    const resolve = ThemeProvider({
      preset,
      get children() {
        captured = use();
        return null;
      },
    });
    (resolve as unknown as () => void)();
    dispose();
  });
  return captured;
}

describe("useTheme / useRecipe without a ThemeProvider", () => {
  it("useRecipe throws a friendly error naming ThemeProvider", () => {
    createRoot((dispose) => {
      // The throw happens before any lookup, because there is no provider; `as never` sidesteps
      // the registry's key type.
      expect(() => useRecipe("anything" as never)).toThrow(/ThemeProvider/);
      dispose();
    });
  });

  it("useTheme throws the same friendly error", () => {
    createRoot((dispose) => {
      expect(() => useTheme()).toThrow(/ThemeProvider/);
      dispose();
    });
  });
});

describe("ThemeProvider preset guard (D7)", () => {
  it("throws naming ThemeProvider and definePreset when handed a bare recipe map", () => {
    createRoot((dispose) => {
      expect(() =>
        ThemeProvider({ preset: registry as unknown as Preset, children: null }),
      ).toThrow(/definePreset/);
      expect(() =>
        ThemeProvider({ preset: registry as unknown as Preset, children: null }),
      ).toThrow(/ThemeProvider/);
      dispose();
    });
  });

  it("throws for non-object and other non-preset values", () => {
    createRoot((dispose) => {
      for (const value of [null, undefined, {}, "preset", 42]) {
        expect(() => ThemeProvider({ preset: value as unknown as Preset, children: null })).toThrow(
          /definePreset/,
        );
      }
      dispose();
    });
  });
});

describe("useTheme / useRecipe under a provider", () => {
  it("useTheme returns the mounted preset", () => {
    const preset = demoPreset({ darkMode: "media" });
    expect(inProvider(preset, () => useTheme())).toBe(preset);
  });

  it("useRecipe returns the registered recipe", () => {
    const root = inProvider(demoPreset(), () =>
      (useRecipe(recipe) as unknown as SlotRecipeFn<DemoVariants, DemoSlot>)().root(),
    );
    expect(root).toBe("base-root");
  });

  it("useRecipe throws a clear error when the preset has no recipe for the key", () => {
    inProvider(demoPreset(), () => {
      expect(() => useRecipe("missing" as keyof RecipeRegistry)).toThrow(/no "missing" recipe/);
      return null;
    });
  });
});

describe("useDefaults — precedence instance ?? preset ?? builtin", () => {
  it("falls back to the built-in default when neither instance nor preset sets the key", () => {
    const size = inProvider(
      demoPreset(),
      () =>
        useDefaults({ recipe, props: {} as DemoVariants, defaults: { size: "md" as const } }).size,
    );
    expect(size).toBe("md");
  });

  it("uses the preset defaultVariants over the built-in when the instance is unset", () => {
    const preset = demoPreset({ components: { demo: { defaultVariants: { size: "sm" } } } });
    const size = inProvider(
      preset,
      () =>
        useDefaults({ recipe, props: {} as DemoVariants, defaults: { size: "md" as const } }).size,
    );
    expect(size).toBe("sm");
  });

  it("uses the instance prop over both preset and built-in", () => {
    const preset = demoPreset({ components: { demo: { defaultVariants: { size: "sm" } } } });
    const size = inProvider(
      preset,
      () =>
        useDefaults({
          recipe,
          props: { size: "lg" } as DemoVariants,
          defaults: { size: "md" as const },
        }).size,
    );
    expect(size).toBe("lg");
  });

  it("resolves each key independently (preset fills one, builtin the other)", () => {
    const preset = demoPreset({ components: { demo: { defaultVariants: { size: "sm" } } } });
    const out = inProvider(preset, () => {
      const merged = useDefaults({
        recipe,
        props: {} as DemoVariants,
        defaults: { size: "md" as const, tone: "plain" as const },
      });
      return { size: merged.size, tone: merged.tone };
    });
    // `size` comes from the preset, `tone` (absent from the preset) from the built-in.
    expect(out).toEqual({ size: "sm", tone: "plain" });
  });
});

describe("useSlots — precedence recipe base → preset → instance → class", () => {
  it("composes preset, instance, and (root-only) class in order over the recipe base", () => {
    const preset = demoPreset({
      components: { demo: { slotClasses: { root: "preset-root", label: "preset-label" } } },
    });
    const out = inProvider(preset, () => {
      const slots = useSlots({
        recipe,
        variants: () => ({ size: "sm" }),
        slotClasses: () => ({ root: "instance-root" }),
        class: () => "consumer-class",
      });
      return { root: slots.root(), label: slots.label() };
    });
    // root folds in every layer, in order; the consumer `class` lands last and only on root.
    expect(out.root).toBe("base-root preset-root instance-root consumer-class");
    // label gets the preset layer but no instance override and never the root-only `class`.
    expect(out.label).toBe("base-label preset-label");
  });

  it("resolves the preset slotClasses function form with the current variants", () => {
    const preset = demoPreset({
      components: {
        demo: {
          slotClasses: (v: DemoVariants) => ({ root: v.size === "sm" ? "sm-root" : "other-root" }),
        },
      },
    });
    const root = inProvider(preset, () =>
      useSlots({ recipe, variants: () => ({ size: "sm" }) }).root(),
    );
    expect(root).toBe("base-root sm-root");
  });

  it("emits just the recipe base when the preset has no slotClasses and no instance overrides", () => {
    const root = inProvider(demoPreset(), () =>
      useSlots({ recipe, variants: () => ({ size: "md" }) }).root(),
    );
    expect(root).toBe("base-root");
  });
});
