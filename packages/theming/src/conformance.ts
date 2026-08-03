/**
 * The conformance kit — the runtime half of the theming drift gate (`@hope-ui/theming/conformance`).
 *
 * A theme author runs it in a test against their recipe functions (a recipe maps props to class
 * names). It complements the compile-time `satisfies RecipeRegistry` check they write in their own
 * source: `satisfies` proves the *types* line up, this proves the functions actually produce a class
 * for every slot at every variant combination. Neither can prove a variant renders the way the theme
 * *intended* — that stays the job of visual/story tests.
 *
 * The kit knows nothing about any specific component: the author passes the recipe plus the prop
 * combinations and slots to exercise. It depends on no test runner, returning a result (or throwing,
 * from the `assert*` forms) for the author to wrap in whatever `it(...)` they use.
 */

import { hopeVar, SEMANTIC_COLOR_TOKENS, SEMANTIC_OPACITY_TOKENS } from "./semantic-tokens";
import type { SlotRecipeFn } from "./slot-recipe";

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
  /**
   * Slots the recipe declares but leaves **intentionally unstyled** (e.g. a description that only
   * inherits the root's text metrics). Each is still checked for *existing* as a callable slot, so a
   * component can call `ctx.slots.<slot>()` safely, but is exempt from the non-empty class that
   * `slots` requires. List them here rather than dropping them from the expectation, which would stop
   * verifying they exist at all.
   */
  unstyledSlots?: readonly string[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Checks that `recipe` produces a non-empty class for every `slot`, and that every `unstyledSlot` is a
 * declared (callable) slot — which may produce no class — across every `case` in `expectation`. Never
 * throws — collects every failure so a caller can report them all at once.
 */
export function checkSlotRecipeConformance<Variants>(
  recipe: SlotRecipeFn<Variants, string>,
  expectation: SlotRecipeExpectation<Variants>,
): ConformanceResult {
  const errors: string[] = [];

  for (const props of expectation.cases) {
    const result = recipe(props);
    for (const slot of expectation.slots) {
      // tailwind-variants resolves each slot to a *function*; calling it yields the class string.
      if (!isNonEmptyString(result?.[slot]?.())) {
        errors.push(`slot "${slot}" produced no class for props ${JSON.stringify(props ?? {})}`);
      }
    }
    // An unstyled slot need only exist and be callable: tailwind-variants resolves an empty slot base
    // to `undefined`, so no class is fine. Anything else non-string means it isn't a class function.
    for (const slot of expectation.unstyledSlots ?? []) {
      const slotFn = result?.[slot];
      if (typeof slotFn !== "function") {
        errors.push(
          `unstyled slot "${slot}" is not a declared slot for props ${JSON.stringify(props ?? {})}`,
        );
        continue;
      }
      const value = slotFn();
      if (value != null && typeof value !== "string") {
        errors.push(
          `unstyled slot "${slot}" resolved to a ${typeof value}, not a class string, for props ${JSON.stringify(props ?? {})}`,
        );
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
 * The physical Tailwind utilities a recipe must not emit, each paired with the logical utility that
 * replaces it. A layout must mirror for right-to-left languages, and that is a property of the classes
 * a preset emits, not a per-component flag: `pr-8` reserves a gutter on the right in every locale,
 * while `pe-8` reserves it on the side the text *ends* — the same edge in LTR, the mirrored one in
 * RTL. A physical utility never fails loudly; it mis-paints for every RTL reader while the variant
 * matrix stays green.
 *
 * Deliberately absent: Tailwind v4's axis shorthands (`px-*`, `mx-*`, `inset-x-*`, `border-x-*`,
 * `space-x-*`, `divide-x-*`) are already logical, and `origin-left`/`origin-right` have no portable
 * logical keyword to name as a replacement.
 *
 * Each `test` matches a whole base utility with its variant chain already stripped, so `^-?pr-` hits
 * `pr-8` and `-pr-2` but not `pre-wrap`, and `^border-l(-|$)` hits `border-l` and `border-l-4` but not
 * `border-blue-500`.
 *
 * `scripts/check-rtl-safety.mjs` applies the same table statically to this repo's own source and keeps
 * its own copy of it; a drift guard in `packages/presets/src/hope/__tests__/hope.test.ts` fails if the
 * two diverge (it lives there because reading a script off disk assumes a repo layout, and this
 * contract package must not). This runtime half is what reaches a *third-party* preset, and the
 * classes a recipe only assembles at call time from `compoundVariants`.
 */
export const PHYSICAL_UTILITIES: ReadonlyArray<{
  test: RegExp;
  physical: string;
  logical: string;
}> = [
  { test: /^-?pl-/, physical: "pl-*", logical: "ps-*" },
  { test: /^-?pr-/, physical: "pr-*", logical: "pe-*" },
  { test: /^-?ml-/, physical: "ml-*", logical: "ms-*" },
  { test: /^-?mr-/, physical: "mr-*", logical: "me-*" },
  { test: /^-?left-/, physical: "left-*", logical: "start-*" },
  { test: /^-?right-/, physical: "right-*", logical: "end-*" },
  { test: /^border-l(-|$)/, physical: "border-l*", logical: "border-s*" },
  { test: /^border-r(-|$)/, physical: "border-r*", logical: "border-e*" },
  { test: /^rounded-l(-|$)/, physical: "rounded-l*", logical: "rounded-s*" },
  { test: /^rounded-r(-|$)/, physical: "rounded-r*", logical: "rounded-e*" },
  { test: /^rounded-tl(-|$)/, physical: "rounded-tl*", logical: "rounded-ss*" },
  { test: /^rounded-tr(-|$)/, physical: "rounded-tr*", logical: "rounded-se*" },
  { test: /^rounded-bl(-|$)/, physical: "rounded-bl*", logical: "rounded-es*" },
  { test: /^rounded-br(-|$)/, physical: "rounded-br*", logical: "rounded-ee*" },
  { test: /^text-left$/, physical: "text-left", logical: "text-start" },
  { test: /^text-right$/, physical: "text-right", logical: "text-end" },
  { test: /^float-left$/, physical: "float-left", logical: "float-start" },
  { test: /^float-right$/, physical: "float-right", logical: "float-end" },
  { test: /^clear-left$/, physical: "clear-left", logical: "clear-start" },
  { test: /^clear-right$/, physical: "clear-right", logical: "clear-end" },
  { test: /^scroll-pl-/, physical: "scroll-pl-*", logical: "scroll-ps-*" },
  { test: /^scroll-pr-/, physical: "scroll-pr-*", logical: "scroll-pe-*" },
  { test: /^scroll-ml-/, physical: "scroll-ml-*", logical: "scroll-ms-*" },
  { test: /^scroll-mr-/, physical: "scroll-mr-*", logical: "scroll-me-*" },
];

/**
 * Splits a Tailwind candidate into its variant chain and base utility, ignoring a `:` that belongs
 * to an arbitrary variant (`[&_svg]:`, `data-[slot=x]:`, `supports-[display:grid]:`).
 */
function splitVariants(candidate: string): { variants: string; base: string } {
  let depth = 0;
  let lastSeparator = -1;
  for (let index = 0; index < candidate.length; index++) {
    const char = candidate[index];
    if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
    } else if (char === ":" && depth === 0) {
      lastSeparator = index;
    }
  }
  return {
    variants: candidate.slice(0, lastSeparator + 1),
    base: candidate.slice(lastSeparator + 1),
  };
}

/**
 * An `rtl:`/`ltr:`-scoped utility is a deliberate manual flip (`ltr:pr-8 rtl:pl-8`) — the one shape
 * where a physical class is correct, and the escape hatch for a rule no logical property can express
 * (hope's calendar mirrors its chevrons with `rtl:[&_svg]:rotate-180`).
 *
 * Exported for the same reason as {@link PHYSICAL_UTILITIES}: the static script keeps its own copy and
 * the drift guard compares the two by `.source`. An exemption that diverges between the two halves
 * splits the rule just as silently as a table entry would.
 */
export const DIRECTION_SCOPED = /(^|:)(rtl|ltr):/;

/**
 * `data-side` reports where a floating layer *landed* after flipping — measured geometry, a physical
 * fact — so a physical class under that scope is the matching answer, not a defect (see
 * `__internal__/theming.md` § RTL-aware recipes). A recipe that really wants "the side nearest where
 * the text starts" layers `ltr:`/`rtl:` on top, which {@link DIRECTION_SCOPED} covers.
 *
 * Limited to the registered variant names `createFloating` emits; the arbitrary form
 * (`data-[side=bottom]:`) is deliberately not matched. Exported for the drift guard, like
 * {@link DIRECTION_SCOPED}.
 */
export const MEASURED_SIDE_SCOPED = /(^|:)data-side-(top|right|bottom|left):/;

/**
 * Whether a candidate's variant chain makes its base utility direction-invariant — either a manual
 * flip the author already spelled both ways, or a scope whose own values are physical geometry.
 */
function isDirectionInvariant(variants: string): boolean {
  return DIRECTION_SCOPED.test(variants) || MEASURED_SIDE_SCOPED.test(variants);
}

/**
 * Checks that every class `recipe` emits is direction-relative — logical utilities only — across
 * every `case` in `expectation`. The RTL analogue of {@link checkSlotRecipeConformance}, and the
 * runtime half of the rule `pnpm check:rtl-safety` enforces over this repo's own source. Never
 * throws — collects every failure so a caller can report them all at once.
 */
export function checkLogicalPropertyConformance<Variants>(
  recipe: SlotRecipeFn<Variants, string>,
  expectation: SlotRecipeExpectation<Variants>,
): ConformanceResult {
  const errors: string[] = [];
  const slots = [...expectation.slots, ...(expectation.unstyledSlots ?? [])];

  for (const props of expectation.cases) {
    const result = recipe(props);
    for (const slot of slots) {
      const classes = result?.[slot]?.();
      if (typeof classes !== "string") {
        continue;
      }
      for (const candidate of classes.split(/\s+/).filter(Boolean)) {
        const { variants, base } = splitVariants(candidate);
        if (isDirectionInvariant(variants)) {
          continue;
        }
        const rule = PHYSICAL_UTILITIES.find(({ test }) => test.test(base));
        if (rule) {
          errors.push(
            `slot "${slot}" uses physical utility "${candidate}" (use ${rule.logical} instead of ` +
              `${rule.physical}) for props ${JSON.stringify(props ?? {})}`,
          );
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Like {@link checkLogicalPropertyConformance}, but throws a single aggregated error when the recipe
 * emits a physical utility. The convenient form for
 * `it("is RTL-safe", () => assertLogicalPropertyConformance(recipe, …))`.
 */
export function assertLogicalPropertyConformance<Variants>(
  recipe: SlotRecipeFn<Variants, string>,
  expectation: SlotRecipeExpectation<Variants>,
): void {
  const { ok, errors } = checkLogicalPropertyConformance(recipe, expectation);
  if (!ok) {
    throw new Error(
      `Logical-property (RTL) conformance failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}

/**
 * Checks that a theme's CSS defines a `--hope-<token>` CSS variable for every semantic color token in
 * `tokens` (default: the whole {@link SEMANTIC_COLOR_TOKENS} vocabulary). Recipes reference these
 * tokens through utilities (`bg-primary` → `var(--hope-primary)`), so one the preset forgot compiles
 * to an unresolved `var()` and silently drops the style. Tokens live in CSS rather than a TS object,
 * which puts them out of reach of the compile-time `satisfies` check — hence this runtime pass over
 * the preset's `tailwind.css`.
 *
 * Only *declaration* is asserted (the light/`:root` value); dark overrides are per-preset, and not
 * every token changes between modes.
 */
export function checkSemanticTokenConformance(
  cssText: string,
  tokens: readonly string[] = SEMANTIC_COLOR_TOKENS,
): ConformanceResult {
  const errors: string[] = [];
  for (const token of tokens) {
    // The trailing `:` stops a shorter token from matching a longer one that starts with it —
    // `focus` against `focus-halo`, or `primary` against `primary-soft`.
    const declared = new RegExp(`${hopeVar(token)}\\s*:`).test(cssText);
    if (!declared) {
      errors.push(`semantic token "${hopeVar(token)}" is not defined in the theme CSS`);
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

/**
 * The opacity-axis analogue of {@link checkSemanticTokenConformance}, defaulting to the whole
 * {@link SEMANTIC_OPACITY_TOKENS} axis. Opacity is a separate contract from color only because
 * Tailwind v4 has no `--opacity-*` theme namespace, so these values reach utilities through a shared
 * `@utility` layer instead of `@theme inline`; the completeness requirement and the `--hope-`
 * namespace (hence the same regex) are identical.
 */
export function checkOpacityTokenConformance(
  cssText: string,
  tokens: readonly string[] = SEMANTIC_OPACITY_TOKENS,
): ConformanceResult {
  const errors: string[] = [];
  for (const token of tokens) {
    const declared = new RegExp(`${hopeVar(token)}\\s*:`).test(cssText);
    if (!declared) {
      errors.push(`opacity token "${hopeVar(token)}" is not defined in the theme CSS`);
    }
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Like {@link checkOpacityTokenConformance}, but throws a single aggregated error when the theme CSS
 * is missing opacity tokens. Convenient for `it("defines every opacity token", () => assertOpacityTokenConformance(css))`.
 */
export function assertOpacityTokenConformance(cssText: string, tokens?: readonly string[]): void {
  const { ok, errors } = checkOpacityTokenConformance(cssText, tokens);
  if (!ok) {
    throw new Error(
      `Opacity token conformance failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}
