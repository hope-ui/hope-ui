import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { type CreateFocusScopeReturn, createFocusScope } from "../create-focus-scope";

interface Scopes {
  outer: CreateFocusScopeReturn;
  inner: CreateFocusScopeReturn;
}

/**
 * Two scopes over **sibling** containers, not nested ones. That is the shape this registry exists
 * for: a `Popover` portaled out of the `Dialog` it was opened in, whose card is not inside the
 * dialog's container and so cannot be reached by `container.contains` at all. Nesting them in the
 * DOM would make every assertion below pass for the wrong reason.
 *
 * Both containers are mounted unconditionally and only `active` is flipped, so a test can choose
 * the activation order independently of the mount order — which is the ordering the stack claims to
 * use. `createFocusScope` for the inner layer is injectable so the cross-copy test can hand it a
 * second module instance of this primitive.
 */
function ScopeLayers(props: {
  outerActive?: boolean;
  innerActive?: boolean;
  createInner?: typeof createFocusScope;
  onReady?: (scopes: Scopes) => void;
}) {
  const [outerRef, setOuterRef] = createSignal<HTMLDivElement>();
  const [innerRef, setInnerRef] = createSignal<HTMLDivElement>();
  const createInnerScope = props.createInner ?? createFocusScope;

  const outer = createFocusScope({ active: () => props.outerActive !== false, ref: outerRef });
  const inner = createInnerScope({ active: () => props.innerActive === true, ref: innerRef });
  props.onReady?.({ outer, inner });

  return (
    <div>
      <button type="button" data-testid="outside">
        Outside
      </button>
      <div data-testid="outer" ref={setOuterRef}>
        <button type="button" data-testid="inside-outer">
          Inside outer
        </button>
      </div>
      <div data-testid="inner" ref={setInnerRef}>
        <button type="button" data-testid="inside-inner">
          Inside inner
        </button>
      </div>
    </div>
  );
}

const el = (testId: string) => page.getByTestId(testId).element() as HTMLElement;

/**
 * Registration happens in an effect body, so it is not in place when `mount()` returns. Every test
 * below opens by waiting on a **positive** answer — which is also the control its negatives are
 * paired with: once the predicate has said `true` once, the flush is done and a `false` elsewhere
 * is an answer rather than a race.
 */
const waitForScope = (contains: () => boolean) => vi.waitFor(() => expect(contains()).toBe(true));

describe("createFocusScope", () => {
  it("covers its own container's subtree, and nothing outside it", async () => {
    let scopes!: Scopes;
    const { dispose } = mount(() => <ScopeLayers onReady={(value) => (scopes = value)} />);

    await waitForScope(() => scopes.outer.containsSelfOrAbove(el("inside-outer")));

    expect(scopes.outer.containsSelfOrAbove(el("outside"))).toBe(false);
    // The inner scope's container is mounted but its scope is inactive, so it is not "above"
    // anything — being in the page is not being in the chain.
    expect(scopes.outer.containsSelfOrAbove(el("inside-inner"))).toBe(false);
    expect(scopes.outer.containsSelfOrAbove(null)).toBe(false);

    dispose();
  });

  it("sees into a scope registered above it", async () => {
    let scopes!: Scopes;
    const { dispose } = mount(() => (
      <ScopeLayers innerActive onReady={(value) => (scopes = value)} />
    ));

    // The whole point of the registry: the container above is neither inside this one nor known to
    // it, and it only exists once the layer above opens.
    await waitForScope(() => scopes.outer.containsSelfOrAbove(el("inside-inner")));

    expect(scopes.outer.containsSelfOrAbove(el("outside"))).toBe(false);
    dispose();
  });

  it("does not see into a scope registered below it", async () => {
    let scopes!: Scopes;
    const { dispose } = mount(() => (
      <ScopeLayers innerActive onReady={(value) => (scopes = value)} />
    ));

    await waitForScope(() => scopes.inner.containsSelfOrAbove(el("inside-inner")));

    // Deliberately asymmetric. The layer underneath must tolerate focus in the layer above it; the
    // layer above must still treat focus falling back down into the dialog as focus it has lost,
    // or a Popover could never close by Tabbing away.
    expect(scopes.inner.containsSelfOrAbove(el("inside-outer"))).toBe(false);
    dispose();
  });

  it("orders scopes by activation, not by creation", async () => {
    let scopes!: Scopes;
    const [outerActive, setOuterActive] = createSignal(false);
    const { dispose } = mount(() => (
      <ScopeLayers outerActive={outerActive()} innerActive onReady={(value) => (scopes = value)} />
    ));

    // The "outer" scope is created first and activated last, so it is the one on top. A stack
    // ordered by creation — or by mount — would answer the other way round.
    await waitForScope(() => scopes.inner.containsSelfOrAbove(el("inside-inner")));
    flush(() => setOuterActive(true));

    await waitForScope(() => scopes.inner.containsSelfOrAbove(el("inside-outer")));
    expect(scopes.outer.containsSelfOrAbove(el("inside-inner"))).toBe(false);
    dispose();
  });

  it("drops out of the scopes below it when it deactivates", async () => {
    let scopes!: Scopes;
    const [innerActive, setInnerActive] = createSignal(true);
    const { dispose } = mount(() => (
      <ScopeLayers innerActive={innerActive()} onReady={(value) => (scopes = value)} />
    ));

    await waitForScope(() => scopes.outer.containsSelfOrAbove(el("inside-inner")));

    flush(() => setInnerActive(false));

    expect(scopes.outer.containsSelfOrAbove(el("inside-inner"))).toBe(false);
    // The control: deactivating the layer above changes nothing about the layer below, which is
    // what lets a Dialog resume trapping focus the moment its Popover closes.
    expect(scopes.outer.containsSelfOrAbove(el("inside-outer"))).toBe(true);
    dispose();
  });

  it("answers false for everything while it holds no registration", async () => {
    let scopes!: Scopes;
    const [outerActive, setOuterActive] = createSignal(false);
    const { dispose } = mount(() => (
      <ScopeLayers outerActive={outerActive()} innerActive onReady={(value) => (scopes = value)} />
    ));

    // An unregistered scope has no container to compare against and nothing above it, so it cannot
    // answer — including about its own subtree. Consumers compose it with the same `active`/`ref`
    // as whatever consults it, so the window never opens in practice; this pins the contract.
    await waitForScope(() => scopes.inner.containsSelfOrAbove(el("inside-inner")));
    expect(scopes.outer.containsSelfOrAbove(el("inside-outer"))).toBe(false);

    flush(() => setOuterActive(true));
    expect(scopes.outer.containsSelfOrAbove(el("inside-outer"))).toBe(true);
    dispose();
  });

  it("shares its scope stack with a separate module instance of itself", async () => {
    // The reason the stack lives on `document` rather than at module scope, and the same argument
    // `create-dismissable.browser.test.tsx` and `create-scroll-lock.browser.test.tsx` make for
    // theirs: nothing guarantees a consumer has one installed copy of `@hope-ui/primitives`. With
    // two module-scope stacks, a `Popover` from copy B would be invisible to a `Dialog` from copy
    // A, whose focus trap would go straight back to yanking focus out of it.
    const copy: typeof import("../create-focus-scope") = await import(
      // @ts-expect-error — Vite serves `?instance=2` as a distinct module instance, which is
      // the whole point here; TypeScript only sees an unresolvable specifier.
      "../create-focus-scope?instance=2"
    );
    expect(copy.createFocusScope).not.toBe(createFocusScope);

    let scopes!: Scopes;
    const { dispose } = mount(() => (
      <ScopeLayers
        innerActive
        createInner={copy.createFocusScope}
        onReady={(value) => (scopes = value)}
      />
    ));

    await waitForScope(() => scopes.outer.containsSelfOrAbove(el("inside-inner")));

    expect(scopes.outer.containsSelfOrAbove(el("outside"))).toBe(false);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <ScopeLayers innerActive />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
