import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import {
  type CompleteVariantsOf,
  definePreset,
  type Preset,
  type PresetConfig,
  type SlotClasses,
} from "../preset";
import type { RecipeRegistry } from "../recipe-registry";
import type { SlotRecipeFn } from "../slot-recipe";
import { tv } from "../styling";
import { ThemeProvider, useDefaults, useRecipe, useSlots, useTheme } from "../theme-context";

// Unit tests (node, no DOM): the pure-logic half of the provider — the `use*` hooks reading a preset
// out of context, the friendly missing-provider error, and the guard against a non-preset value.
// `ThemeProvider` renders no DOM at all, so context can be exercised without a document by invoking
// the accessor it returns (see `inProvider`).

// A synthetic recipe standing in for a real component's — two slots, so composition precedence is
// observable. Its slot fns fold in `{ class }` the way a real `tv` recipe does, which makes the whole
// `base → preset → instance → class` chain readable as a plain string.
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
// "demo" is not a real registry key, so it is cast at the call boundary. Keeping it synthetic is the
// point: it declares no `ThemeablePropsRegistry` entry, standing in for a component that never opted
// into non-variant defaults, so `ThemeablePropsOf`'s fallback arm stays exercised. Swapping it for a
// registered component later would quietly stop testing that path.
// It is type-punned to one concrete key rather than the `keyof RecipeRegistry` union: `button` has
// several slots and the full variant set, so `useSlots` resolves to a rich slot record and
// `variantsProps` demands every key. A union would instead collapse the slots and variants to the
// intersection across *all* recipes, and shrink further with each recipe added. Runtime value stays
// `"demo"`.
const recipe = "demo" as unknown as "button";

// `variantsProps` demands every variant key be present, so tests spread this all-`undefined` base and
// override only the key they exercise — as a real component passes its full resolved variant set.
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

// Negative pin: omitting a variant key must stay a compile error. If the type is ever loosened back
// to the all-optional `RecipeVariantsOf`, this call stops erroring and `pnpm typecheck` then fails on
// the now-unused `@ts-expect-error` — which is how the regression announces itself.
const _missingVariantKeyIsAnError = () =>
  useSlots({
    recipe,
    // @ts-expect-error only `size` is given; the other variant keys must be present too.
    variantsProps: () => ({ size: "sm" }),
  });
void _missingVariantKeyIsAnError;

/**
 * Runs `use()` inside a `<ThemeProvider>`'s owner and returns its result. `ThemeProvider` renders no
 * DOM, so it hands back the context provider's accessor; invoking that evaluates `children` within
 * the context exactly as inserting it into a document would.
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
      // With no provider the throw happens before any lookup, so the key is irrelevant — `as never`
      // only sidesteps the registry's key type.
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
    expect(out).toEqual({ size: "sm", tone: "plain" });
  });
});

describe("useSlots — precedence recipe base → preset → instance → class", () => {
  it("composes preset, instance, and the slot's own class argument in order over the recipe base", () => {
    const preset = demoPreset({
      components: { demo: { slotClasses: { root: "preset-root", label: "preset-label" } } },
    });
    const out = inProvider(preset, () => {
      const slots = useSlots({
        recipe,
        variantsProps: () => ({ ...fullVariants, size: "sm" }),
        slotClasses: () => ({ root: "instance-root" }),
      });
      return { root: slots.root("consumer-class"), label: slots.label(), bare: slots.root() };
    });
    expect(out.root).toBe("base-root preset-root instance-root consumer-class");
    expect(out.label).toBe("base-label preset-label");
    // Omitting the argument yields exactly the pre-`class` chain: no stray separator, no `undefined`.
    expect(out.bare).toBe("base-root preset-root instance-root");
  });

  // Why the argument exists rather than a second `cx(slots.x(), props.class)` at the call site: going
  // *through* the recipe's `{ class }` seam lets tailwind-merge resolve the conflict, so the
  // consumer's utility replaces the recipe's instead of both shipping and stylesheet order deciding.
  // Uses the real `tv` rather than the synthetic recipe above, since the merge is what's under test.
  it("routes the class argument through the recipe's tailwind-merge seam", () => {
    const merging = tv({ slots: { root: "p-4 text-sm" } }) as unknown as RecipeRegistry["button"];
    const preset = definePreset({ demo: merging } as unknown as RecipeRegistry);
    const root = inProvider(preset, () =>
      useSlots({ recipe, variantsProps: () => fullVariants }).root("p-8"),
    );
    expect(root).toBe("text-sm p-8");
  });

  // …and the merge spans the *whole* chain, not just base-vs-argument. `useSlots` hands the recipe one
  // `cx(preset, instance, consumer)` string, and `cx` only concatenates (`"p-5 p-6 p-8"`), so it is
  // tailwind-merge inside the recipe that collapses the four paddings to the last. Pinned separately
  // because the documented precedence holds only as long as the merge reaches inside that argument.
  it("collapses conflicting utilities across the whole override chain, last layer winning", () => {
    const merging = tv({
      slots: { root: "p-4 rounded-xl text-sm" },
    }) as unknown as RecipeRegistry["button"];
    const preset = definePreset(
      { demo: merging } as unknown as RecipeRegistry,
      {
        components: { demo: { slotClasses: { root: "p-5" } } },
      } as unknown as PresetConfig,
    );
    const root = inProvider(preset, () =>
      useSlots({
        recipe,
        variantsProps: () => fullVariants,
        slotClasses: () => ({ root: "p-6" }) as SlotClasses<"button">,
      }).root("p-8"),
    );
    expect(root).toBe("rounded-xl text-sm p-8");
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
