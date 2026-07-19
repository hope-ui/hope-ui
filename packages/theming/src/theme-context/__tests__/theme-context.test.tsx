import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import {
  type CompleteVariantsOf,
  definePreset,
  type Preset,
  type PresetConfig,
} from "../../preset";
import type { SlotRecipeFn } from "../../recipes/slot-recipe";
import type { RecipeRegistry } from "../../registry";
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
// "demo" isn't a real registry key; cast at the call boundary the way the ssr/browser tests do. It
// deliberately declares no `ThemeablePropsRegistry` entry, so it stands in for a component that never
// opted into chrome-content defaults and whose `defaultProps` fall back to the recipe variants
// (`ThemeablePropsOf`'s `RecipeVariantsOf` branch). Keep it synthetic — don't "fix" it to a
// registered component later, or that fallback path stops being exercised.
// Type-punned to the `button` key (see `fullVariants` below): a concrete multi-slot recipe with a
// `label` slot and the full variant set, so `useSlots({ recipe })` resolves to `Record<"root" |
// "label" | …, …>` and `variantsProps` demands every key. Pinning to a single key (not the
// `keyof RecipeRegistry` union) is what keeps this stable as recipes are added — a union collapses
// `RecipeSlotsOf`/`CompleteVariantsOf` to the intersection across *all* recipes (just `root`/`size`
// once a two-slot, one-variant recipe like `closeButton` joins). Runtime value stays `"demo"`.
const recipe = "demo" as unknown as "button";

// `useSlots`' `variantsProps` demands `CompleteVariantsOf` (every variant key present). The demo is
// type-punned to the `button` key, so spread this all-`undefined` base and override only the key a
// given test exercises — mirroring how a real component always passes its full resolved variant set.
const fullVariants: CompleteVariantsOf<"button"> = {
  variant: undefined,
  colorScheme: undefined,
  size: undefined,
  fullWidth: undefined,
  iconOnly: undefined,
  loaderPlacement: undefined,
};

/** Build a demo preset from the synthetic registry; `config` is cast (its keys are synthetic). */
function demoPreset(config?: unknown): Preset {
  return definePreset(registry, config as PresetConfig | undefined);
}

// Negative pin: `variantsProps` requires *every* variant key to be present, so omitting one is a
// compile error. If the type is ever loosened back to the all-optional `RecipeVariantsOf`, this stops
// erroring and `pnpm typecheck` fails on the now-unused `@ts-expect-error` — flagging the regression.
const _missingVariantKeyIsAnError = () =>
  useSlots({
    recipe,
    // @ts-expect-error only `size` is given; the other variant keys must be present too.
    variantsProps: () => ({ size: "sm" }),
  });
void _missingVariantKeyIsAnError;

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
    const preset = demoPreset();
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

  it("uses the preset defaultProps over the built-in when the instance is unset", () => {
    const preset = demoPreset({ components: { demo: { defaultProps: { size: "sm" } } } });
    const size = inProvider(
      preset,
      () =>
        useDefaults({ recipe, props: {} as DemoVariants, defaults: { size: "md" as const } }).size,
    );
    expect(size).toBe("sm");
  });

  it("uses the instance prop over both preset and built-in", () => {
    const preset = demoPreset({ components: { demo: { defaultProps: { size: "sm" } } } });
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
    const preset = demoPreset({ components: { demo: { defaultProps: { size: "sm" } } } });
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
        variantsProps: () => ({ ...fullVariants, size: "sm" }),
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

  it("resolves the preset slotClasses function form with the current variantsProps", () => {
    const preset = demoPreset({
      components: {
        demo: {
          slotClasses: (v: DemoVariants) => ({ root: v.size === "sm" ? "sm-root" : "other-root" }),
        },
      },
    });
    const root = inProvider(preset, () =>
      useSlots({ recipe, variantsProps: () => ({ ...fullVariants, size: "sm" }) }).root(),
    );
    expect(root).toBe("base-root sm-root");
  });

  it("emits just the recipe base when the preset has no slotClasses and no instance overrides", () => {
    const root = inProvider(demoPreset(), () =>
      useSlots({ recipe, variantsProps: () => ({ ...fullVariants, size: "md" }) }).root(),
    );
    expect(root).toBe("base-root");
  });
});
