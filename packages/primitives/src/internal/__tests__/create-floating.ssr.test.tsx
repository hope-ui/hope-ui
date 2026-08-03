import { renderToStringAsync } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { createFloating, type SideOrLogical } from "../create-floating";

// An SSR test is only required of components, not of `internal/` primitives. This one exists
// anyway because `createFloating` is the first primitive here with a browser-targeted third-party
// package in its module graph: a module-scope `document`/`window` touch anywhere inside
// `@floating-ui/dom` throws at *import* time on a server, and nothing else in the suite would
// notice until production.

function Tip(props: { side?: SideOrLogical } = {}) {
  // No ref effect runs on the server, so both accessors stay `undefined` — which is exactly the
  // state a client's *first* render is in, before any measurement lands.
  const [anchor] = createSignal<HTMLElement>();
  const [floating] = createSignal<HTMLElement>();
  const { floatingStyles, side, isPositioned } = createFloating({
    active: () => true,
    anchor,
    floating,
    get side() {
      return props.side ?? "left";
    },
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

  it("seeds a logical side as if ltr, since there is no element to measure direction on", async () => {
    // `getComputedStyle` does not exist here, and the floating element does not either. The seed has
    // to pick something, and picking the `ltr` resolution keeps the server's bytes identical to the
    // client's *first* render — which is what hydration compares. The first real measurement then
    // replaces it with the direction-resolved side, exactly as it already does for a side that
    // `flip` overrides. Nothing is visible in between: `data-positioned` is false and the layer is
    // `visibility: hidden` until a measurement lands.
    const html = await renderToStringAsync(() => <Tip side="inline-start" />);
    expect(html).toContain('data-side="left"');
    expect(html).toContain('data-positioned="false"');
    expect(html).toContain("visibility:hidden");
  });
});
