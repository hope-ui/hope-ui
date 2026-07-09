import axe from "axe-core";

/**
 * Runs axe-core against a mounted container and throws with a readable summary if any
 * violation is found. Every component's browser test should call this at least once so
 * a baseline a11y check happens by default, not as an opt-in.
 */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container);

  if (results.violations.length > 0) {
    const summary = results.violations
      .map((violation) => `- [${violation.impact}] ${violation.id}: ${violation.help}`)
      .join("\n");
    throw new Error(`axe-core found ${results.violations.length} violation(s):\n${summary}`);
  }
}
