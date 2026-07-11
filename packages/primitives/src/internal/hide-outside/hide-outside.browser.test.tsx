import { expectNoA11yViolations, mount } from "@enara-ui/internal-test-utils";
import { type Accessor, createSignal, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createHideOutside } from "./hide-outside";

/**
 * The target carries `role="dialog"`/`aria-modal` because that's how the primitive is
 * actually used, and because axe-core's `aria-hidden-focus` rule keys off an open modal.
 */
function TestHarness(props: {
  active: Accessor<boolean>;
  spare?: Accessor<Element[]>;
  renderTarget?: boolean;
}) {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  createHideOutside({ active: props.active, target: ref, spare: props.spare });

  return (
    <div data-testid="wrapper">
      <p data-testid="sibling">
        Background{" "}
        <button type="button" data-testid="background-button">
          Background button
        </button>
      </p>
      <span data-testid="pre-hidden" aria-hidden="true">
        decorative
      </span>
      <div data-testid="pre-inert" inert>
        already inert
      </div>
      <Show when={props.renderTarget ?? true}>
        <div data-testid="target" ref={setRef} role="dialog" aria-modal="true" aria-label="Layer">
          <button type="button" data-testid="inside">
            Inside
          </button>
        </div>
      </Show>
    </div>
  );
}

/** Two layers over the same background, to exercise the per-element ref count. */
function NestedHarness(props: { outer: Accessor<boolean>; inner: Accessor<boolean> }) {
  const [outerRef, setOuterRef] = createSignal<HTMLDivElement>();
  const [innerRef, setInnerRef] = createSignal<HTMLDivElement>();
  createHideOutside({ active: props.outer, target: outerRef });
  createHideOutside({ active: props.inner, target: innerRef });

  return (
    <div>
      <p data-testid="background">Background</p>
      <div data-testid="outer" ref={setOuterRef} role="dialog" aria-modal="true" aria-label="Outer">
        Outer
      </div>
      <div data-testid="inner" ref={setInnerRef} role="dialog" aria-modal="true" aria-label="Inner">
        Inner
      </div>
    </div>
  );
}

function get(container: HTMLElement, testId: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (element === null) throw new Error(`no [data-testid="${testId}"] in container`);
  return element;
}

function marks(container: HTMLElement, testId: string) {
  const element = get(container, testId);
  return {
    ariaHidden: element.getAttribute("aria-hidden"),
    inert: element.hasAttribute("inert"),
  };
}

/** What a real mouse click at the centre of `element` would hit. `inert` retargets it. */
function topmostElementOver(element: Element): Element | null {
  const rect = element.getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

describe("createHideOutside", () => {
  it("marks the target's siblings aria-hidden and inert, but not the target, its ancestors, or its contents", async () => {
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    expect(marks(container, "sibling")).toEqual({ ariaHidden: null, inert: false });

    setActive(true);
    await vi.waitFor(() =>
      expect(marks(container, "sibling")).toEqual({
        ariaHidden: "true",
        inert: true,
      }),
    );

    // Ancestors are spared, so the walk can reach the target at all.
    expect(marks(container, "wrapper")).toEqual({ ariaHidden: null, inert: false });
    expect(container.getAttribute("aria-hidden")).toBeNull();
    expect(container.hasAttribute("inert")).toBe(false);
    // The target and everything inside it stay reachable.
    expect(marks(container, "target")).toEqual({ ariaHidden: null, inert: false });
    expect(marks(container, "inside")).toEqual({ ariaHidden: null, inert: false });

    dispose();
  });

  it("takes hidden content out of the focus order and out of hit testing", async () => {
    // What `aria-hidden` alone cannot do, and the reason `inert` is applied alongside it.
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    const background = get(container, "background-button");
    background.focus();
    expect(document.activeElement).toBe(background);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    background.focus();
    expect(document.activeElement).not.toBe(background);
    expect(topmostElementOver(background)).not.toBe(background);

    dispose();
  });

  it("does nothing at all until the target resolves", async () => {
    // The guard that matters most. A run without the target hides the target, `inert` blurs
    // whatever a focus trap just focused inside it, and focus lands on `<body>` for good.
    const [active] = createSignal(true);
    const [renderTarget, setRenderTarget] = createSignal(false);
    const { container, dispose } = mount(() => (
      <TestHarness active={active} renderTarget={renderTarget()} />
    ));

    await vi.waitFor(() =>
      expect(marks(container, "sibling")).toEqual({ ariaHidden: null, inert: false }),
    );

    setRenderTarget(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));
    expect(marks(container, "target")).toEqual({ ariaHidden: null, inert: false });

    dispose();
  });

  it("spares the elements passed in `spare`", async () => {
    // `Dialog` spares its `ModalBackdrop` (an inert backdrop is transparent to hit testing,
    // so it would stop blocking the pointer) and the consumer's visible backdrop.
    const [active, setActive] = createSignal(false);
    const [spared, setSpared] = createSignal<Element[]>([]);
    const { container, dispose } = mount(() => <TestHarness active={active} spare={spared} />);

    setSpared([get(container, "sibling")]);
    setActive(true);

    await vi.waitFor(() => expect(marks(container, "pre-hidden").inert).toBe(true));
    expect(marks(container, "sibling")).toEqual({ ariaHidden: null, inert: false });

    dispose();
  });

  it("restores both attributes on deactivation", async () => {
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    setActive(false);
    await vi.waitFor(() =>
      expect(marks(container, "sibling")).toEqual({
        ariaHidden: null,
        inert: false,
      }),
    );

    dispose();
  });

  it("restores a pre-existing aria-hidden or inert rather than clearing it", async () => {
    // A decorative element the consumer hid, or a subtree they made inert themselves, must
    // stay that way after the layer closes. Losing it is the bug a naive `removeAttribute`
    // on cleanup would introduce.
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    expect(marks(container, "pre-hidden")).toEqual({ ariaHidden: "true", inert: false });
    expect(marks(container, "pre-inert")).toEqual({ ariaHidden: null, inert: true });

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    setActive(false);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(false));

    expect(marks(container, "pre-hidden")).toEqual({ ariaHidden: "true", inert: false });
    expect(marks(container, "pre-inert")).toEqual({ ariaHidden: null, inert: true });

    dispose();
  });

  it("hides elements added to the page while active", async () => {
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    const late = document.createElement("div");
    late.dataset.testid = "late";
    get(container, "wrapper").append(late);

    await vi.waitFor(() =>
      expect(marks(container, "late")).toEqual({
        ariaHidden: "true",
        inert: true,
      }),
    );

    dispose();
  });

  it("does not hide elements added inside the target while active", async () => {
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    const late = document.createElement("div");
    late.dataset.testid = "late-inside";
    get(container, "target").append(late);

    // Give the observer a chance to get it wrong.
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));
    expect(marks(container, "late-inside")).toEqual({ ariaHidden: null, inert: false });

    dispose();
  });

  it("ref-counts across nested layers, so an inner cleanup leaves the outer's hiding intact", async () => {
    const [outer, setOuter] = createSignal(false);
    const [inner, setInner] = createSignal(false);
    const { container, dispose } = mount(() => <NestedHarness outer={outer} inner={inner} />);

    setOuter(true);
    await vi.waitFor(() => expect(marks(container, "background").inert).toBe(true));
    expect(marks(container, "inner").inert).toBe(true); // hidden by the outer layer

    setInner(true);
    await vi.waitFor(() => expect(marks(container, "outer").inert).toBe(true));
    expect(marks(container, "background").inert).toBe(true); // now hidden by both layers

    setInner(false);
    await vi.waitFor(() => expect(marks(container, "outer").inert).toBe(false));
    // The outer layer still needs it hidden — the inner layer's cleanup must not win.
    expect(marks(container, "background")).toEqual({ ariaHidden: "true", inert: true });

    setOuter(false);
    await vi.waitFor(() =>
      expect(marks(container, "background")).toEqual({
        ariaHidden: null,
        inert: false,
      }),
    );

    dispose();
  });

  it("has no baseline accessibility violations while active", async () => {
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));
    await expectNoA11yViolations(container);

    dispose();
  });
});
