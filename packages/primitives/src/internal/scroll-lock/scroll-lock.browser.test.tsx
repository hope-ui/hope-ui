import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { createScrollLock } from "./scroll-lock";

function TestHarness(props: { active: () => boolean }) {
  createScrollLock({ active: props.active });
  return <div data-testid="harness">content</div>;
}

/** Same harness, but driven by a `createScrollLock` from a different module instance. */
function CopyTestHarness(props: { active: () => boolean; create: typeof createScrollLock }) {
  props.create({ active: props.active });
  return <div data-testid="harness-copy">content</div>;
}

describe("createScrollLock", () => {
  afterEach(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
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
    // @ts-expect-error — Vite serves `?instance=2` as a distinct module instance, which is
    // the whole point here; TypeScript only sees an unresolvable specifier.
    const copy: typeof import("./scroll-lock") = await import("./scroll-lock?instance=2");
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

  it("has no baseline accessibility violations", async () => {
    const [active] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness active={active} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
