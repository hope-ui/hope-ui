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
 * ── What the two tests below can and cannot reach ───────────────────────────────────────────────
 * `createScrollLock` only writes padding when `window.innerWidth - document.documentElement
 * .clientWidth` is positive — a classic scrollbar's gutter. **That is structurally 0 in this
 * project**, twice over: Chromium's headless shell uses overlay scrollbars (measured: `innerWidth`
 * 414 against a `clientWidth` of 414, with the document overflowing at `scrollHeight` 2688 vs
 * `clientHeight` 896), and `documentElement.clientWidth` returns the *viewport* rather than the
 * element's own box, so narrowing `<html>` cannot fake it either.
 *
 * So the arithmetic (`current + scrollbarWidth`) has no browser coverage here. What these pin is
 * the part that actually regressed and *is* observable without a gutter: **which property the lock
 * snapshots and restores through**. A `padding-right` implementation snapshots and restores a
 * different property than the one under test, so it fails the round-trip below.
 */

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

  it("has no baseline accessibility violations", async () => {
    const [active] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness active={active} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
