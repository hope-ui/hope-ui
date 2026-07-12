/**
 * The conformance kit — the runtime half of the drift gate (`@hope-ui/theming/conformance`).
 *
 * A theme author runs it in a test *after* `panda codegen`, against their generated recipe
 * functions. It complements the compile-time `satisfies ThemeRecipes` check (which the author
 * writes in their own source): `satisfies` proves the *types* line up; this proves the generated
 * *functions* actually produce a class for every slot at every variant combination the author
 * cares about. Neither can prove *mapping correctness* (that a given variant renders as this
 * theme's intended style) — that stays the job of per-theme visual/story tests.
 *
 * It is **generic**: the kit knows nothing about any specific component (there are none yet). The
 * author passes the recipe plus the prop combinations and slots to exercise — those are the
 * component's own decisions, not this package's. No test-runner dependency: it returns a result
 * (or throws, via `assertSlotRecipeConformance`) so the author wraps it in whatever `it(...)` they use.
 */
import type { SlotRecipeFn } from "../theme-recipes/theme-recipes";

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
      if (!isNonEmptyString(result?.[slot])) {
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
