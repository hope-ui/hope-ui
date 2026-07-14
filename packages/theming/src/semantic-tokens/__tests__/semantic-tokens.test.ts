import { describe, expect, it } from "vitest";
import { SEMANTIC_COLOR_TOKENS, type SemanticColorToken } from "../semantic-tokens";

describe("SEMANTIC_COLOR_TOKENS", () => {
  it("has no duplicate token names", () => {
    expect(new Set(SEMANTIC_COLOR_TOKENS).size).toBe(SEMANTIC_COLOR_TOKENS.length);
  });

  it("includes the core surfaces, text ramp, on-colors, roles, borders and systemic tokens", () => {
    const has = (t: SemanticColorToken) => expect(SEMANTIC_COLOR_TOKENS).toContain(t);
    has("surface");
    has("surface-inverse");
    has("foreground");
    has("foreground-muted");
    has("on-primary");
    has("on-danger-soft");
    has("on-inverse");
    has("primary");
    has("primary-hover");
    has("danger-hover");
    has("danger-soft");
    has("primary-outline");
    has("warning-outline");
    has("subtle");
    has("strong");
    has("focus");
    has("scrim");
  });

  it("never names a token after a Tailwind property (no text-text / border-border / ring-ring)", () => {
    for (const property of ["text", "bg", "border", "ring", "outline", "fill", "stroke"]) {
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).not.toContain(property);
    }
  });
});
