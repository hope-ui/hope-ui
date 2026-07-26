import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal, Show } from "solid-js";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { createHideOutside, keepVisible, TOP_LAYER_ATTRIBUTE } from "../create-hide-outside";

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
      {/* Already in the page when the layer opens, so only the initial walk can spare it. */}
      <div data-testid="pre-marked" {...{ [TOP_LAYER_ATTRIBUTE]: "" }}>
        third-party top layer
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
  if (element === null) {
    throw new Error(`no [data-testid="${testId}"] in container`);
  }
  return element;
}

function attributesOf(element: Element) {
  return {
    ariaHidden: element.getAttribute("aria-hidden"),
    inert: element.hasAttribute("inert"),
  };
}

function marks(container: HTMLElement, testId: string) {
  return attributesOf(get(container, testId));
}

const VISIBLE = { ariaHidden: null, inert: false };
const HIDDEN = { ariaHidden: "true", inert: true };

/**
 * A detached `<body>`-child-to-be, as a portaled layer is. Not appended here: the tests below
 * append a spared element and a control **in the same task**, so both land in one
 * `MutationObserver` batch and waiting for the control to be hidden proves the observer has
 * already decided about the other one. Otherwise a "still visible" assertion could pass simply
 * by running before the observer did.
 */
function bodyChild(testId: string): HTMLElement {
  const element = document.createElement("div");
  element.dataset.testid = testId;
  onTestFinished(() => element.remove());
  return element;
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

  it("lets only the innermost layer observe, so keepVisible into the top spares from all of them", async () => {
    // The Popover-in-Dialog case in miniature. `keepVisible` only ever touches the topmost
    // layer's spared set, so a still-observing outer layer would hide the element anyway — which
    // makes "the spared element survived" the assertion that proves the outer one disconnected.
    const [outer, setOuter] = createSignal(false);
    const [inner, setInner] = createSignal(false);
    const { container, dispose } = mount(() => <NestedHarness outer={outer} inner={inner} />);

    setOuter(true);
    await vi.waitFor(() => expect(marks(container, "background").inert).toBe(true));
    setInner(true);
    await vi.waitFor(() => expect(marks(container, "outer").inert).toBe(true));

    const spared = bodyChild("spared");
    const control = bodyChild("control");
    const undo = keepVisible(spared);
    expect(undo, "keepVisible found no open layer to spare into").toBeTypeOf("function");

    document.body.append(spared, control);
    await vi.waitFor(() => expect(attributesOf(control)).toEqual(HIDDEN));
    expect(attributesOf(spared)).toEqual(VISIBLE);

    // Sparing an element spares its subtree, which is the whole reason `Popover` registers its
    // positioner rather than its card.
    const late = document.createElement("div");
    spared.append(late);
    await vi.waitFor(() => expect(attributesOf(control)).toEqual(HIDDEN));
    expect(attributesOf(late)).toEqual(VISIBLE);

    dispose();
  });

  it("stops sparing once keepVisible's undo runs", async () => {
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    const spared = bodyChild("spared");
    const control = bodyChild("control");
    const undo = keepVisible(spared);
    document.body.append(spared, control);
    await vi.waitFor(() => expect(attributesOf(control)).toEqual(HIDDEN));
    expect(attributesOf(spared)).toEqual(VISIBLE);

    // Re-added *after* the undo — the same element the layer spared a moment ago, now an
    // ordinary new `<body>` child. Nothing re-walks on undo, so re-adding is what makes the
    // observer decide about it again.
    undo?.();
    spared.remove();
    document.body.append(spared);
    await vi.waitFor(() => expect(attributesOf(spared)).toEqual(HIDDEN));

    dispose();
  });

  it("returns no undo from keepVisible when there is no layer, or the element is already spared", async () => {
    const orphan = bodyChild("orphan");
    expect(keepVisible(orphan), "an empty stack has nothing to spare into").toBeUndefined();

    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);
    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    expect(keepVisible(orphan)).toBeTypeOf("function");
    // Idempotent: a second registration must not hand out an undo that revokes the first one's.
    expect(keepVisible(orphan)).toBeUndefined();

    dispose();
  });

  it("spares a marked element that was already in the page when the layer opened", async () => {
    // The initial walk's half of `data-hope-ui-top-layer`, and the ordering `keepVisible` cannot
    // reach: a modal opening *above* a layer that is already up.
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));
    expect(marks(container, "pre-marked")).toEqual(VISIBLE);

    dispose();
  });

  it("spares a marked element added while the layer is open, with no registration", async () => {
    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    const marked = bodyChild("marked");
    marked.setAttribute(TOP_LAYER_ATTRIBUTE, "");
    const control = bodyChild("control");
    document.body.append(marked, control);

    await vi.waitFor(() => expect(attributesOf(control)).toEqual(HIDDEN));
    expect(attributesOf(marked)).toEqual(VISIBLE);

    // The observer folds a marked node into its spared set, so its subtree keeps being spared —
    // a toast root stays usable, not just present.
    const toast = document.createElement("div");
    marked.append(toast);
    await vi.waitFor(() => expect(attributesOf(control)).toEqual(HIDDEN));
    expect(attributesOf(toast)).toEqual(VISIBLE);

    dispose();
  });

  it("keeps the still-open layer observing when layers close out of order", async () => {
    // React Aria's splice branch: the layer that leaves is not the one on top, so nothing is
    // popped and nothing is restarted — whoever is topmost is already observing.
    const [outer, setOuter] = createSignal(false);
    const [inner, setInner] = createSignal(false);
    const { container, dispose } = mount(() => <NestedHarness outer={outer} inner={inner} />);

    setOuter(true);
    await vi.waitFor(() => expect(marks(container, "background").inert).toBe(true));
    setInner(true);
    await vi.waitFor(() => expect(marks(container, "outer").inert).toBe(true));

    setOuter(false);
    await vi.waitFor(() => expect(marks(container, "inner")).toEqual(VISIBLE));
    // The inner layer still needs the background hidden, and still has to notice new content.
    expect(marks(container, "background")).toEqual(HIDDEN);
    const late = bodyChild("late");
    document.body.append(late);
    await vi.waitFor(() => expect(attributesOf(late)).toEqual(HIDDEN));

    setInner(false);
    await vi.waitFor(() => expect(marks(container, "background")).toEqual(VISIBLE));
    expect(attributesOf(late)).toEqual(VISIBLE);

    dispose();
  });

  it("shares its layer stack with a separate module instance of itself", async () => {
    // The reason the stack lives on `document` rather than at module scope, and the same
    // argument `create-scroll-lock.browser.test.tsx` makes for its ref count: nothing guarantees
    // a consumer has one installed copy of `@hope-ui/primitives`. Two module-scope stacks and a
    // `Popover` from copy B could never spare itself from a `Dialog` from copy A — it would
    // register into an empty stack and be marked inert anyway.
    const copy: typeof import("../create-hide-outside") = await import(
      // @ts-expect-error — Vite serves `?instance=2` as a distinct module instance, which is
      // the whole point here; TypeScript only sees an unresolvable specifier.
      "../create-hide-outside?instance=2"
    );
    expect(copy.createHideOutside).not.toBe(createHideOutside);
    expect(copy.keepVisible).not.toBe(keepVisible);

    const [active, setActive] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness active={active} />);

    setActive(true);
    await vi.waitFor(() => expect(marks(container, "sibling").inert).toBe(true));

    const spared = bodyChild("spared");
    const control = bodyChild("control");
    const undo = copy.keepVisible(spared);
    expect(undo, "the other copy saw an empty stack").toBeTypeOf("function");

    document.body.append(spared, control);
    await vi.waitFor(() => expect(attributesOf(control)).toEqual(HIDDEN));
    expect(attributesOf(spared)).toEqual(VISIBLE);

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
