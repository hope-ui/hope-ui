/**
 * The conformance kit — the runtime half of the drift gate (`@hope-ui/theming/conformance`).
 *
 * A theme author runs it in a test against their `tailwind-variants` recipe functions. It
 * complements the compile-time `satisfies RecipeRegistry` check (which the author writes in their
 * own source): `satisfies` proves the *types* line up; this proves the *functions* actually produce
 * a class for every slot at every variant combination the author cares about. Neither can prove
 * *mapping correctness* (that a given variant renders as this theme's intended style) — that stays
 * the job of per-theme visual/story tests.
 *
 * It is **generic**: the kit knows nothing about any specific component. The author passes the
 * recipe plus the prop combinations and slots to exercise — those are the component's own decisions,
 * not this package's. No test-runner dependency: it returns a result (or throws, via
 * `assertSlotRecipeConformance`) so the author wraps it in whatever `it(...)` they use.
 */
import { SEMANTIC_COLOR_TOKENS } from "../semantic-tokens/semantic-tokens";
import type { SlotRecipeFn } from "../styling/recipe";

export interface ConformanceResult {
  ok: boolean;
  /** One human-readable line per failure; empty when `ok`. */
  errors: string[];
}

export interface SlotRecipeExpectation<Variants> {
  /**
   * Variant-prop combinations to exercise — typically the default (`{}` or `undefined`) plus one
   * per variant value the component declares.
   */
  cases: ReadonlyArray<Variants | undefined>;
  /** Every slot the recipe must produce a non-empty class for (a single-part component → `["root"]`). */
  slots: readonly string[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Checks that `recipe` produces a non-empty class for every `slot` across every `case` in
 * `expectation`. Never throws — collects every failure so a caller can report them all at once.
 */
export function checkSlotRecipeConformance<Variants>(
  recipe: SlotRecipeFn<Variants, string>,
  expectation: SlotRecipeExpectation<Variants>,
): ConformanceResult {
  const errors: string[] = [];

  for (const props of expectation.cases) {
    const result = recipe(props);
    for (const slot of expectation.slots) {
      // A slot resolves to a class *function* (tailwind-variants) — call it for its class string.
      if (!isNonEmptyString(result?.[slot]?.())) {
        errors.push(`slot "${slot}" produced no class for props ${JSON.stringify(props ?? {})}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Like {@link checkSlotRecipeConformance}, but throws a single aggregated error when the recipe is
 * non-conformant. The convenient form for `it("conforms", () => assertSlotRecipeConformance(recipe, …))`.
 */
export function assertSlotRecipeConformance<Variants>(
  recipe: SlotRecipeFn<Variants, string>,
  expectation: SlotRecipeExpectation<Variants>,
): void {
  const { ok, errors } = checkSlotRecipeConformance(recipe, expectation);
  if (!ok) {
    throw new Error(`Slot recipe conformance failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  }
}

/**
 * Checks that a theme's CSS defines a `--hope-<token>` variable for every semantic color token in
 * `tokens` (default: the full {@link SEMANTIC_COLOR_TOKENS} vocabulary). A theme is chosen at the
 * consumer's Tailwind build time and every recipe/component references these tokens as utilities
 * (`bg-primary` → `var(--hope-primary)`); a token the theme forgot to define compiles to an
 * unresolved `var()` and silently breaks styling. This is the CSS-side analogue of the recipe
 * axis's {@link checkSlotRecipeConformance}: once tokens live in CSS rather than a TS object the
 * compile-time `satisfies` guarantee is gone, so a theme runs this against its `theme.css`.
 *
 * It asserts only that each token is *declared* (its light/`:root` value); dark overrides are a
 * per-theme concern and not every token changes between modes.
 */
export function checkSemanticTokenConformance(
  cssText: string,
  tokens: readonly string[] = SEMANTIC_COLOR_TOKENS,
): ConformanceResult {
  const errors: string[] = [];
  for (const token of tokens) {
    // The `:` anchor stops a prefix token (`on-primary`) from matching a longer one
    // (`on-primary-soft`).
    const declared = new RegExp(`--hope-${token}\\s*:`).test(cssText);
    if (!declared) {
      errors.push(`semantic token "--hope-${token}" is not defined in the theme CSS`);
    }
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Like {@link checkSemanticTokenConformance}, but throws a single aggregated error when the theme
 * CSS is missing tokens. Convenient for `it("defines every token", () => assertSemanticTokenConformance(css))`.
 */
export function assertSemanticTokenConformance(cssText: string, tokens?: readonly string[]): void {
  const { ok, errors } = checkSemanticTokenConformance(cssText, tokens);
  if (!ok) {
    throw new Error(
      `Semantic token conformance failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}
