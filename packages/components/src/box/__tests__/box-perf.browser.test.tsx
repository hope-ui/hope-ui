import { renderElement } from "@hope-ui/primitives/utils";
import { css } from "@hope-ui/styled-system/css";
import { render } from "@solidjs/web";
import { For } from "solid-js";
import { describe, it } from "vitest";
import { Box } from "../box";

// OPT-IN benchmark — skipped by default so it never slows the normal browser suite / CI. Run it
// with the VITE_BENCH flag set:
//
//   VITE_BENCH=1 pnpm exec vitest run --project=browser \
//     packages/components/src/box/__tests__/box-perf.browser.test.tsx --reporter=verbose
//
// (`--reporter=verbose` is what surfaces the printed table; the default reporter hides it.)
//
// Micro-benchmark isolating the COST OF THE STYLE-PROPS CEREMONY in renderStyled — the
// `Object.keys().filter(isCssProperty)` split, the `omit`, the `merge` + the `css()`/`cx()` class
// getter — versus a normal SolidJS component that does none of that.
//
// Four variants, each rendering N identical-shaped `<div class="…">text</div>` trees:
//   1. plain-static  : `<div class="p_1 …">` literal — the floor: static template clone, no css(),
//                       no ceremony, no spread. The cheapest a Solid component can be.
//   2. plain-css     : `<div class={css({...})}>` — a *normal* Panda component: pays css() but has
//                       NONE of the style-props ceremony and still uses a static template.
//   3. render-element: `renderElement({as:"div", props:{class: css({...})}})` — the polymorphism
//                       path (`<Dynamic {...spread}>`) with a PRECOMPUTED class: pays Dynamic+spread
//                       (which EVERY hope-ui component pays) but NOT the style-props split.
//   4. box           : `<Box p bg rounded>` — the full renderStyled ceremony.
//
// Decomposition of the deltas:
//   (plain-static → plain-css)      = css()'s own cost (paid by ANY Panda component)
//   (plain-css    → render-element) = Dynamic + spread + renderElement (polymorphism infra;
//                                     already paid by Button, every Dialog part, etc.)
//   (render-element → box)          = the STYLE-PROPS CEREMONY alone — exactly the pasted code:
//                                     Object.keys().filter(isCssProperty) + omit + merge + getter.
//
// Rendered into a DETACHED container (never appended) so we measure JS + DOM construction, not
// layout/paint. Not part of the correctness suite — see the summary the test prints.

// Only run under VITE_BENCH — read defensively so it typechecks without `vite/client` types.
const BENCH = Boolean(
  (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_BENCH,
);

const N = 10_000;
const TIMED_RUNS = 5;
const PAD = ["0", "1", "2", "4", "8"] as const; // vary p per box so css() does real per-call work

const indices = Array.from({ length: N }, (_, i) => i);
const padOf = (i: number): string => PAD[i % PAD.length] ?? "0";

/** Render `component` into a detached container N times via `<For>`, return elapsed ms. */
function timeOnce(component: (i: number) => ReturnType<typeof Box>): number {
  const container = document.createElement("div");
  const start = performance.now();
  const dispose = render(() => <For each={indices}>{(i) => component(i)}</For>, container);
  const elapsed = performance.now() - start;
  dispose();
  return elapsed;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const hi = sorted[mid] ?? 0;
  const lo = sorted[mid - 1] ?? hi;
  return sorted.length % 2 ? hi : (lo + hi) / 2;
}

/** One warm-up (JIT + prime css() cache) then TIMED_RUNS timed, reported as median. */
function measure(component: (i: number) => ReturnType<typeof Box>): number {
  timeOnce(component); // warm-up, discarded
  const runs = Array.from({ length: TIMED_RUNS }, () => timeOnce(component));
  return median(runs);
}

describe("Box style-props ceremony — performance", () => {
  it.runIf(BENCH)(`renders ${N} boxes; prints the ceremony overhead`, () => {
    const plainStatic = measure((i) => (
      <div class={`p_${padOf(i)} bg_primary rounded_lg`}>content</div>
    ));

    const plainCss = measure((i) => (
      <div class={css({ p: padOf(i), bg: "primary", rounded: "lg" })}>content</div>
    ));

    const renderElementPlain = measure((i) =>
      renderElement({
        as: "div",
        props: { class: css({ p: padOf(i), bg: "primary", rounded: "lg" }), children: "content" },
      }),
    );

    const box = measure((i) => (
      <Box p={padOf(i)} bg="primary" rounded="lg">
        content
      </Box>
    ));

    const nsPerBox = (ms: number) => Math.round((ms * 1e6) / N);
    const cssMs = plainCss - plainStatic;
    const dynamicMs = renderElementPlain - plainCss;
    const ceremonyMs = box - renderElementPlain;

    console.log(`
┌─ Box style-props ceremony benchmark ─ N=${N}/render, median of ${TIMED_RUNS} runs ─┐
  plain-static  (floor: static <div>, no css) : ${plainStatic.toFixed(2)} ms  (${nsPerBox(plainStatic)} ns/box)
  plain-css     (normal Panda, static <div>)  : ${plainCss.toFixed(2)} ms  (${nsPerBox(plainCss)} ns/box)
  render-element(Dynamic+spread, precomp cls) : ${renderElementPlain.toFixed(2)} ms  (${nsPerBox(renderElementPlain)} ns/box)
  Box           (renderStyled, full ceremony) : ${box.toFixed(2)} ms  (${nsPerBox(box)} ns/box)
  ──────────────────────────────────────────────────────────────────────
  css() cost         (static → css)           : ${cssMs.toFixed(2)} ms  (${nsPerBox(cssMs)} ns/box)
  Dynamic+spread     (css → render-element)   : ${dynamicMs.toFixed(2)} ms  (${nsPerBox(dynamicMs)} ns/box)
  STYLE-PROPS CEREMONY (render-element → Box) : ${ceremonyMs.toFixed(2)} ms  (${nsPerBox(ceremonyMs)} ns/box)
  ── the pasted code is ${((ceremonyMs / box) * 100).toFixed(1)}% of Box's render time ──
└──────────────────────────────────────────────────────────────────────┘`);
  });
});
