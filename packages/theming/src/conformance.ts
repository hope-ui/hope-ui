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
   * Slots the recipe declares but leaves **intentionally unstyled** by default (e.g. a description
   * that only inherits the root's text metrics). Each must still be a *declared* slot — the recipe
   * resolves it to a class **function** — so the component can safely call `ctx.slots.<slot>()`, but
   * that function may produce no class (tailwind-variants collapses an empty `""` slot base to
   * `undefined`). Such a slot is therefore exempt from the non-empty requirement `slots` enforces. Use
   * this instead of dropping the slot from the expectation entirely, which would stop verifying it
   * exists at all.
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
      // A slot resolves to a class *function* (tailwind-variants) — call it for its class string.
      if (!isNonEmptyString(result?.[slot]?.())) {
        errors.push(`slot "${slot}" produced no class for props ${JSON.stringify(props ?? {})}`);
      }
    }
    // Unstyled slots need only be *declared* (a callable slot). Their class may be empty — an empty
    // tailwind-variants slot base resolves to `undefined` — but the slot must exist so the component
    // can call it. A non-string, non-nullish result would mean the slot isn't a real class function.
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
 * replaces it. hope-ui supports RTL from day one, which is a property of the classes a preset emits
 * rather than a per-component flag: `pr-8` reserves a gutter on the right in every locale, while
 * `pe-8` reserves it on the side the text *ends* — the same edge in `ltr`, the mirrored one in
 * `rtl`. A physical utility does not fail loudly; it mis-paints for every RTL reader while the
 * variant matrix stays green.
 *
 * Absent by design, because Tailwind v4's axis shorthands are **already logical**: `px-*`
 * (`padding-inline`), `mx-*`, `inset-x-*`, `border-x-*`, `space-x-*`, `divide-x-*`. Also absent:
 * `origin-left`/`origin-right`, since `transform-origin` has no portable logical keyword and there
 * would be no replacement to name.
 *
 * Each `test` matches a WHOLE base utility with its variant chain already stripped, so `^-?pr-`
 * matches `pr-8` and `-pr-2` but not `pre-wrap`, and `^border-l(-|$)` matches `border-l` and
 * `border-l-4` but not `border-blue-500`.
 *
 * The repo-side static scan (`scripts/check-rtl-safety.mjs`, `pnpm check:rtl-safety`) applies the
 * same table to source files; a drift guard in `__tests__/conformance.test.ts` fails if the two
 * diverge. This runtime half is what reaches a *third-party* preset and the classes a recipe only
 * assembles at call time through `compoundVariants`.
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
 * where a physical class is the correct answer, and the escape hatch for a rule a logical property
 * cannot express (hope's calendar mirrors its chevrons with `rtl:[&_svg]:rotate-180`).
 */
function isDirectionScoped(variants: string): boolean {
  return /(^|:)(rtl|ltr):/.test(variants);
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
        if (isDirectionScoped(variants)) {
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
 * Checks that a theme's CSS defines a `--hope-<token>` variable for every semantic color token in
 * `tokens` (default: the full {@link SEMANTIC_COLOR_TOKENS} vocabulary). A theme is chosen at the
 * consumer's Tailwind build time and every recipe/component references these tokens as utilities
 * (`bg-primary` → `var(--hope-primary)`); a token the preset forgot to define compiles to an
 * unresolved `var()` and silently breaks styling. This is the CSS-side analogue of the recipe
 * axis's {@link checkSlotRecipeConformance}: once tokens live in CSS rather than a TS object the
 * compile-time `satisfies` guarantee is gone, so a preset runs this against its `tailwind.css`.
 *
 * It asserts only that each token is *declared* (its light/`:root` value); dark overrides are a
 * per-preset concern and not every token changes between modes.
 */
export function checkSemanticTokenConformance(
  cssText: string,
  tokens: readonly string[] = SEMANTIC_COLOR_TOKENS,
): ConformanceResult {
  const errors: string[] = [];
  for (const token of tokens) {
    // The `:` anchor stops a prefix token (`focus`) from matching a longer one
    // (`focus-halo`), or `primary` from matching `primary-soft`.
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
 * The opacity-axis analogue of {@link checkSemanticTokenConformance}: checks that a theme's CSS
 * defines a `--hope-<token>` variable for every semantic opacity token in `tokens` (default: the
 * full {@link SEMANTIC_OPACITY_TOKENS} axis). Opacity is a separate contract from color — Tailwind
 * v4.3.2 has no `--opacity-*` theme namespace, so the values reach utilities through the shared
 * `_base/_opacity.css` `@utility` layer rather than `@theme inline` — but the CSS-side completeness
 * requirement is the same: a token the preset forgot to define compiles its `@utility` to an
 * unresolved `var()`. The `--hope-` namespace is shared, so it reuses the same `--hope-<token>:` regex.
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
