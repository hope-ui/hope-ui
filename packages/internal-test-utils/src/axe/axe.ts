import axe from "axe-core";

export interface A11yCheckOptions {
  /**
   * axe rule ids whose `incomplete` results this call accepts. Every entry needs a comment at the call
   * site explaining why that rule cannot be judged there: an accepted `incomplete` is a documented
   * gap, not a check that passed.
   */
  allowIncomplete?: readonly string[];
}

function summarize(results: readonly axe.Result[]): string {
  return results
    .map((result) => {
      const targets = result.nodes
        .map((node) => node.target.join(" "))
        .slice(0, 3)
        .join(", ");
      return `- [${result.impact ?? "needs review"}] ${result.id}: ${result.help}\n    ${targets}`;
    })
    .join("\n");
}

/**
 * Runs axe-core against a mounted container and throws with a readable summary on any violation.
 * Every component's browser test should call it at least once, so a baseline a11y check is the
 * default rather than an opt-in.
 *
 * It fails on axe's `incomplete` results too — rules axe ran but could not decide, and flags for a
 * human. Those are easy to drop on the floor; the whole browser suite reports zero of them today, so
 * treating them as failures costs nothing and catches the first one that appears.
 *
 * Where axe genuinely cannot judge a rule in a headless test (`color-contrast` against a background it
 * can't resolve is the usual one), name that rule in `allowIncomplete` with a reason at the call site,
 * rather than silencing the whole category.
 */
export async function expectNoA11yViolations(
  container: Element,
  options: A11yCheckOptions = {},
): Promise<void> {
  const results = await axe.run(container);

  if (results.violations.length > 0) {
    throw new Error(
      `axe-core found ${results.violations.length} violation(s):\n${summarize(results.violations)}`,
    );
  }

  const allowed = new Set(options.allowIncomplete ?? []);
  const unreviewed = results.incomplete.filter((result) => !allowed.has(result.id));

  if (unreviewed.length > 0) {
    throw new Error(
      `axe-core found ${unreviewed.length} incomplete check(s) — rules it could not decide, ` +
        `which need a human:\n${summarize(unreviewed)}\n\n` +
        "Fix the markup, or pass `{ allowIncomplete: [ruleId] }` with a comment saying why " +
        "axe cannot judge it here. See axe.md.",
    );
  }
}
