import { describe, expect, it } from "vitest";
import {
  SEMANTIC_COLOR_TOKENS,
  SEMANTIC_OPACITY_TOKENS,
  type SemanticColorToken,
  type SemanticOpacityToken,
} from "../semantic-tokens";

describe("SEMANTIC_COLOR_TOKENS", () => {
  it("has no duplicate token names", () => {
    expect(new Set(SEMANTIC_COLOR_TOKENS).size).toBe(SEMANTIC_COLOR_TOKENS.length);
  });

  it("is the full 110-token vocabulary", () => {
    expect(SEMANTIC_COLOR_TOKENS).toHaveLength(110);
  });

  it("includes the surfaces, text ramp, on-state, role ladders, borders, collections and systemic tokens", () => {
    const has = (t: SemanticColorToken) => expect(SEMANTIC_COLOR_TOKENS).toContain(t);
    // Surfaces incl. the raised interaction ladder.
    has("surface");
    has("surface-raised");
    has("surface-raised-hovered");
    has("surface-raised-pressed");
    has("surface-inverse");
    // Text ramp + on-state.
    has("foreground");
    has("foreground-muted");
    has("on-inverse");
    has("on-active");
    has("on-selected");
    // Role fills + the full per-variant interaction ladder (renamed `-hover` → `-hovered`).
    has("primary");
    has("primary-hovered");
    has("primary-pressed");
    has("danger-hovered");
    has("danger-soft");
    has("danger-soft-hovered");
    has("danger-soft-pressed");
    has("primary-outline-hovered");
    has("primary-outline-pressed");
    has("primary-ghost-hovered");
    has("primary-ghost-pressed");
    // Role content color + link ladder (renamed `on-{role}-soft` → `{role}-emphasis`).
    has("primary-emphasis");
    has("warning-emphasis");
    has("primary-link-hovered");
    has("primary-link-pressed");
    // Outline border tint (renamed `{role}-outline` → `{role}-line`); chromatic only.
    has("primary-line");
    has("warning-line");
    // On-solid-fill content.
    has("on-primary");
    has("on-danger");
    // Neutral borders (renamed `subtle-outline`/`strong-outline` → `subtle`/`strong`).
    has("subtle");
    has("strong");
    // Collection-state fills.
    has("active");
    has("selected");
    // Systemic (incl. the focus halo). No disabled *fill* token — disabled dims via the opacity axis.
    has("focus");
    has("focus-halo");
    has("scrim");
  });

  it("has no `-line` token for neutral (its outline border uses `border-strong`)", () => {
    expect(SEMANTIC_COLOR_TOKENS as readonly string[]).not.toContain("neutral-line");
  });

  it("has no `disabled` fill token (a disabled control dims via the `opacity-disabled` axis)", () => {
    expect(SEMANTIC_COLOR_TOKENS as readonly string[]).not.toContain("disabled");
    // The disabled *label text* keeps its ramp token, though.
    expect(SEMANTIC_COLOR_TOKENS as readonly string[]).toContain("foreground-disabled");
  });

  it("dropped the context-encoded and reused tokens the redesign removed", () => {
    for (const gone of [
      "on-primary-soft",
      "on-danger-soft",
      "primary-hover",
      "danger-hover",
      "primary-outline",
      "warning-outline",
      "neutral-outline",
      "subtle-outline",
      "strong-outline",
      "disabled-outline",
    ]) {
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).not.toContain(gone);
    }
  });

  it("never names a token after a Tailwind property (no text-text / border-border / ring-ring)", () => {
    for (const property of ["text", "bg", "border", "ring", "outline", "fill", "stroke"]) {
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).not.toContain(property);
    }
  });
});

describe("SEMANTIC_OPACITY_TOKENS", () => {
  it("has no duplicate token names", () => {
    expect(new Set(SEMANTIC_OPACITY_TOKENS).size).toBe(SEMANTIC_OPACITY_TOKENS.length);
  });

  it("is the two-token opacity axis", () => {
    const has = (t: SemanticOpacityToken) => expect(SEMANTIC_OPACITY_TOKENS).toContain(t);
    has("opacity-disabled");
    has("opacity-loading");
    expect(SEMANTIC_OPACITY_TOKENS).toHaveLength(2);
  });

  it("keeps the opacity axis disjoint from the color vocabulary", () => {
    const colors = new Set<string>(SEMANTIC_COLOR_TOKENS);
    for (const token of SEMANTIC_OPACITY_TOKENS) {
      expect(colors.has(token)).toBe(false);
    }
  });
});
