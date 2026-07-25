import { renderToStringAsync } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { createFloating } from "../create-floating";

// `internal/` primitives are exempt from the SSR Definition-of-Done item — that one is
// components-only. This file exists anyway because `createFloating` is the first `internal/`
// primitive with a third-party, browser-targeted package in its module graph: a module-scope
// `document`/`window` touch anywhere in `@floating-ui/dom` throws at *import* time under a
// SolidStart server, and nothing else in the suite would notice until production.

function Tip() {
  // No ref effect runs on the server, so both accessors stay `undefined` — which is exactly the
  // state a client's *first* render is in, before any measurement lands.
  const [anchor] = createSignal<HTMLElement>();
  const [floating] = createSignal<HTMLElement>();
  const { floatingStyles, side, isPositioned } = createFloating({
    active: () => true,
    anchor,
    floating,
    side: "left",
  });

  return (
    <div data-side={side()} data-positioned={String(isPositioned())} style={floatingStyles()}>
      tip
    </div>
  );
}

describe("createFloating on the server", () => {
  it("emits the pre-positioned style, with nothing measured", async () => {
    const html = await renderToStringAsync(() => <Tip />);

    expect(html).toContain("position:absolute");
    expect(html).toContain("visibility:hidden");
    expect(html).toContain('data-positioned="false"');
    // `computePosition`/`autoUpdate` are reached from effect bodies alone, and effects never run
    // under `renderToStringAsync` — so neither the translate nor the retina `will-change` hint of
    // the post-measurement branch can appear. Same branch, same bytes as the client's first render.
    expect(html).not.toContain("translate(");
    expect(html).not.toContain("will-change");
  });

  it("seeds the resolved side from the option, so data-side is right on the first paint", async () => {
    const html = await renderToStringAsync(() => <Tip />);
    expect(html).toContain('data-side="left"');
  });
});
