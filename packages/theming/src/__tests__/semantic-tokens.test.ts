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

  it("is the full 143-token vocabulary", () => {
    expect(SEMANTIC_COLOR_TOKENS).toHaveLength(143);
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
    // The `inverted` variant's own fill ladder + on-content (the swap of solid, on dedicated tokens).
    has("primary-inverted");
    has("primary-inverted-hovered");
    has("primary-inverted-pressed");
    has("on-primary-inverted");
    has("warning-inverted");
    has("on-warning-inverted");
    // Role content color + link ladder (renamed `on-{role}-soft` → `{role}-emphasis`).
    has("primary-emphasis");
    has("warning-emphasis");
    has("primary-link-hovered");
    has("primary-link-pressed");
    // Two-tier role border, complete across all 6 roles: `-line` (strong) + `-subtle-line` (soft).
    has("primary-line");
    has("warning-line");
    has("neutral-line");
    has("primary-subtle-line");
    has("neutral-subtle-line");
    has("success-subtle-line");
    has("info-subtle-line");
    has("warning-subtle-line");
    has("danger-subtle-line");
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
    // Surface-adaptive interaction wash (currentColor-derived).
    has("surface-adaptive-hovered");
    has("surface-adaptive-pressed");
  });

  it("carries the two-tier role border across all 6 roles (`-line` strong + `-subtle-line` soft)", () => {
    for (const role of ["primary", "neutral", "success", "info", "warning", "danger"]) {
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).toContain(`${role}-line`);
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).toContain(`${role}-subtle-line`);
    }
  });

  it("carries the full `inverted` variant family across all 6 roles (fill ladder + on-content)", () => {
    for (const role of ["primary", "neutral", "success", "info", "warning", "danger"]) {
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).toContain(`${role}-inverted`);
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).toContain(`${role}-inverted-hovered`);
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).toContain(`${role}-inverted-pressed`);
      expect(SEMANTIC_COLOR_TOKENS as readonly string[]).toContain(`on-${role}-inverted`);
    }
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
