import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { createScrollLock } from "../create-scroll-lock";

function TestHarness(props: { active: () => boolean }) {
  createScrollLock({ active: props.active });
  return <div data-testid="harness">content</div>;
}

/** Same harness, but driven by a `createScrollLock` from a different module instance. */
function CopyTestHarness(props: { active: () => boolean; create: typeof createScrollLock }) {
  props.create({ active: props.active });
  return <div data-testid="harness-copy">content</div>;
}

/*
 * ── Why a gutter exists here at all ─────────────────────────────────────────────────────────────
 * `createScrollLock` only writes padding when `window.innerWidth - document.documentElement
 * .clientWidth` is positive — a classic scrollbar's gutter. That measured 0 until the browser
 * project stopped passing Playwright's default `--hide-scrollbars`
 * (`vitest.config.ts` → `ignoreDefaultArgs`), which every headless launch used to add; overlay
 * scrollbars were never the cause. With the arg dropped the headless *shell* build CI installs
 * draws a real 15px gutter, so the compensation arithmetic is reachable and asserted below.
 *
 * `gutterOf` re-measures per test rather than hard-coding 15: the width is a platform detail, and
 * the assertions only care that the lock adds *exactly what collapsed* to the edge the text ends on.
 */

/**
 * Makes the document overflow so `<body>`'s overflow — which propagates to the viewport in HTML —
 * actually draws a scrollbar, and reports the gutter that the lock will have to compensate.
 */
function withOverflowingDocument() {
  const spacer = document.createElement("div");
  spacer.style.height = "3000px";
  document.body.append(spacer);

  return {
    gutter: window.innerWidth - document.documentElement.clientWidth,
    removeSpacer: () => spacer.remove(),
  };
}

describe("createScrollLock", () => {
  afterEach(() => {
    document.body.style.overflow = "";
    document.body.style.paddingInlineEnd = "";
    document.documentElement.dir = "";
  });

  it("sets body overflow to hidden while active", () => {
    const [active] = createSignal(true);
    const { dispose } = mount(() => <TestHarness active={active} />);

    expect(document.body.style.overflow).toBe("hidden");
    dispose();
  });

  it("restores the previous overflow value on deactivation", () => {
    document.body.style.overflow = "scroll";
    const [active, setActive] = createSignal(true);
    const { dispose } = mount(() => <TestHarness active={active} />);

    expect(document.body.style.overflow).toBe("hidden");

    flush(() => setActive(false));
    expect(document.body.style.overflow).toBe("scroll");
    dispose();
  });

  it("only unlocks once every concurrent lock has deactivated", () => {
    const [activeA, setActiveA] = createSignal(true);
    const [activeB, setActiveB] = createSignal(true);
    const { dispose: disposeA } = mount(() => <TestHarness active={activeA} />);
    const { dispose: disposeB } = mount(() => <TestHarness active={activeB} />);

    expect(document.body.style.overflow).toBe("hidden");

    flush(() => setActiveA(false));
    expect(document.body.style.overflow).toBe("hidden");

    flush(() => setActiveB(false));
    expect(document.body.style.overflow).toBe("");

    disposeA();
    disposeB();
  });

  it("shares its ref count with a separate module instance of itself", async () => {
    // The reason the count lives on `document.body` rather than at module scope: nothing
    // guarantees a consumer has only one installed copy of `@hope-ui/primitives`, and two
    // module-scope counters would each believe they own the body's styles. A `?instance=2`
    // query makes Vite serve this module a second time, which is as close to "two copies in
    // node_modules" as a single test run can get.
    const copy: typeof import("../create-scroll-lock") = await import(
      // @ts-expect-error — Vite serves `?instance=2` as a distinct module instance, which is
      // the whole point here; TypeScript only sees an unresolvable specifier.
      "../create-scroll-lock?instance=2"
    );
    expect(copy.createScrollLock).not.toBe(createScrollLock);

    document.body.style.overflow = "scroll";
    const [activeA, setActiveA] = createSignal(true);
    const [activeB, setActiveB] = createSignal(true);

    const { dispose: disposeA } = mount(() => <TestHarness active={activeA} />);
    const { dispose: disposeB } = mount(() => (
      <CopyTestHarness active={activeB} create={copy.createScrollLock} />
    ));

    expect(document.body.style.overflow).toBe("hidden");

    flush(() => setActiveA(false));
    expect(document.body.style.overflow).toBe("hidden"); // the other copy still holds a lock

    flush(() => setActiveB(false));
    expect(document.body.style.overflow).toBe("scroll"); // and it restores the real snapshot

    disposeA();
    disposeB();
  });

  it("snapshots and restores the body's INLINE-END padding, not its physical right padding", () => {
    document.body.style.paddingInlineEnd = "10px";

    const [active, setActive] = createSignal(true);
    const { dispose } = mount(() => <TestHarness active={active} />);

    // Stand in for the compensation write the gutter-less environment skips: whatever the lock owns
    // while held, it must hand back on release.
    document.body.style.paddingInlineEnd = "99px";

    flush(() => setActive(false));
    expect(document.body.style.paddingInlineEnd).toBe("10px");
    // A `padding-right` implementation snapshots and clears a property nobody set, leaving the
    // logical one stuck at 99px.
    expect(document.body.style.paddingRight).toBe("");

    dispose();
  });

  it("restores through a property that resolves to the LEFT edge under RTL", () => {
    // Why logical at all: an RTL engine puts the viewport scrollbar on the left, so physical
    // compensation would pad the edge that did *not* lose the scrollbar — the layout shift this
    // code exists to absorb, doubled, in every RTL locale.
    document.documentElement.dir = "rtl";
    document.body.style.paddingInlineEnd = "12px";

    const [active, setActive] = createSignal(true);
    const { dispose } = mount(() => <TestHarness active={active} />);

    document.body.style.paddingInlineEnd = "99px";
    flush(() => setActive(false));

    const restored = window.getComputedStyle(document.body);
    expect(Number.parseFloat(restored.paddingLeft)).toBe(12);
    expect(Number.parseFloat(restored.paddingRight)).toBe(0);

    dispose();
  });

  it("compensates the collapsing gutter with an equal padding-inline-end", () => {
    const { gutter, removeSpacer } = withOverflowingDocument();
    // The environment guard. With `--hide-scrollbars` back in the launch args this is 0, the
    // `scrollbarWidth > 0` branch never runs, and every assertion below would pass vacuously.
    expect(gutter).toBeGreaterThan(0);

    const [active, setActive] = createSignal(true);
    const { dispose } = mount(() => <TestHarness active={active} />);

    expect(Number.parseFloat(document.body.style.paddingInlineEnd)).toBe(gutter);

    flush(() => setActive(false));
    expect(document.body.style.paddingInlineEnd).toBe("");

    dispose();
    removeSpacer();
  });

  it("adds the gutter to the body's existing padding instead of replacing it", () => {
    document.body.style.paddingInlineEnd = "10px";
    const { gutter, removeSpacer } = withOverflowingDocument();
    expect(gutter).toBeGreaterThan(0);

    const [active, setActive] = createSignal(true);
    const { dispose } = mount(() => <TestHarness active={active} />);

    expect(Number.parseFloat(document.body.style.paddingInlineEnd)).toBe(10 + gutter);

    flush(() => setActive(false));
    expect(document.body.style.paddingInlineEnd).toBe("10px");

    dispose();
    removeSpacer();
  });

  it("compensates the RIGHT edge under LTR", () => {
    document.documentElement.dir = "ltr";
    const { gutter, removeSpacer } = withOverflowingDocument();
    expect(gutter).toBeGreaterThan(0);

    const [active] = createSignal(true);
    const { dispose } = mount(() => <TestHarness active={active} />);

    const held = window.getComputedStyle(document.body);
    expect(Number.parseFloat(held.paddingRight)).toBe(gutter);
    expect(Number.parseFloat(held.paddingLeft)).toBe(0);

    dispose();
    removeSpacer();
  });

  it("compensates the LEFT edge under RTL, where the viewport scrollbar actually was", () => {
    document.documentElement.dir = "rtl";
    const { gutter, removeSpacer } = withOverflowingDocument();
    expect(gutter).toBeGreaterThan(0);

    const [active] = createSignal(true);
    const { dispose } = mount(() => <TestHarness active={active} />);

    // A `padding-right` implementation pads the edge that never held the scrollbar: the page keeps
    // the width the collapsing gutter freed *and* gains the compensation — the shift, doubled.
    const held = window.getComputedStyle(document.body);
    expect(Number.parseFloat(held.paddingLeft)).toBe(gutter);
    expect(Number.parseFloat(held.paddingRight)).toBe(0);

    dispose();
    removeSpacer();
  });

  it("has no baseline accessibility violations", async () => {
    const [active] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness active={active} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
