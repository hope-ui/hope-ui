import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vitest";
import { createScrollLock } from "./scroll-lock";

function TestHarness(props: { active: () => boolean }) {
  createScrollLock({ active: props.active });
  return <div data-testid="harness">content</div>;
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

  it("has no baseline accessibility violations", async () => {
    const [active] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness active={active} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
