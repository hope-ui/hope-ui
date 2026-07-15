import { isPreset, renderPresetStyle, SEMANTIC_COLOR_TOKENS } from "@hope-ui/theming";
import { assertSemanticTokenConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { hope } from "..";

// hope authors its token values in TypeScript (`hopeTokens` in ../index.ts), not CSS, so its
// completeness is asserted against the CSS the preset *renders* rather than a hand-written file.
// `renderPresetStyle` emits a `--hope-<token>:` declaration for every color token, so running the
// conformance kit over that output proves every semantic token is present AND exercises the render
// path. A missing token would compile every referencing utility to an unresolved `var(--hope-…)`.
const renderedCss = renderPresetStyle(hope.tokens, hope.darkMode);

describe("@hope-ui/presets/hope", () => {
  it("defines every semantic color token (rendered from its TS token palette)", () => {
    assertSemanticTokenConformance(renderedCss);
  });

  it("is a valid preset that authors its full palette in TS (emits a token <style>)", () => {
    expect(isPreset(hope)).toBe(true);
    // The closed `ColorTokenKey` union already blocks typos; this guards *completeness* — that no
    // token was omitted from the palette.
    expect(Object.keys(hope.tokens.colors ?? {})).toHaveLength(SEMANTIC_COLOR_TOKENS.length);
    expect(hope.tokens.radii?.base).toBeDefined();
    // Non-empty tokens → the provider leaves its zero-DOM branch and inlines this <style>.
    expect(renderedCss).not.toBe("");
  });
});
