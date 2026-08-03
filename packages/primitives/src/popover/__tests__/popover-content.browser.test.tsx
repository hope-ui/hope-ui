import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { type CreatePopoverContentProps, createPopoverContent } from "../popover-content";
import { createPopoverPositioner } from "../popover-positioner";
import {
  type CreatePopoverOptions,
  type CreatePopoverReturn,
  createPopover,
} from "../popover-root";
import { createPopoverTrigger } from "../popover-trigger";

// Every tree here includes the trigger on purpose. `createPopoverContent` is what exempts it from
// dismissal, and that exemption — the reason a *toggling* trigger works at all — is only observable
// against a real trigger.

const TITLE_ID = "popover-content-title";

/** Clear of every edge, so neither `flip` nor `shift` has anything to react to. */
const TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "300px",
};

interface HarnessProps {
  options?: CreatePopoverOptions;
  contentProps?: CreatePopoverContentProps;
  /** Renders a focusable control inside the popup, so Tab has somewhere to start from. */
  withInnerButton?: boolean;
  /** Renders a focusable control *after* the popup, so Tab has somewhere to leave to. */
  withOutsideButton?: boolean;
  /** Extra markup inside the popup, after `withInnerButton`'s control. */
  extraContent?: () => JSX.Element;
  onReady?: (state: CreatePopoverReturn) => void;
}

function Harness(props: HarnessProps) {
  const state = createPopover(props.options);
  props.onReady?.(state);
  const trigger = createPopoverTrigger(state, {});
  const positioner = createPopoverPositioner(state, {});
  const content = createPopoverContent(state, props.contentProps ?? {});

  return (
    <>
      <button data-testid="trigger" style={TRIGGER_STYLE} {...trigger.props} ref={trigger.setRef}>
        Open
      </button>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          <div data-testid="content" {...content.props} ref={content.setRef}>
            <h2 id={TITLE_ID}>Popover title</h2>
            <p id="popover-content-description">Body copy</p>
            {props.withInnerButton ? (
              <button type="button" data-testid="inner">
                inner
              </button>
            ) : null}
            {props.extraContent?.()}
          </div>
        </div>
      </Show>
      {props.withOutsideButton ? (
        <button type="button" data-testid="outside">
          outside
        </button>
      ) : null}
    </>
  );
}

function mountHarness(props: HarnessProps = {}) {
  let state!: CreatePopoverReturn;
  const result = mount(() => <Harness {...props} onReady={(ready) => (state = ready)} />);
  return { ...result, state: () => state };
}

const contentOf = (container: Element) =>
  container.querySelector('[data-testid="content"]') as HTMLElement | null;
const triggerOf = (container: Element) =>
  container.querySelector('[data-testid="trigger"]') as HTMLButtonElement;

/** A popup labelled by its own Title, which `role="dialog"` needs to have an accessible name. */
const LABELLED: CreatePopoverContentProps = { "aria-labelledby": TITLE_ID };
const OPEN: CreatePopoverOptions = { defaultOpen: true };

/** One frame is enough for a dismissal that was going to happen to have happened. */
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe("createPopoverContent", () => {
  it("is not mounted while closed, and mounts with the state's role while open", () => {
    const closed = mountHarness({ contentProps: LABELLED });
    expect(contentOf(closed.container)).toBeNull();
    closed.dispose();

    const open = mountHarness({ options: OPEN, contentProps: LABELLED });
    const content = contentOf(open.container) as HTMLElement;
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("data-presence")).toBeTruthy();
    open.dispose();
  });

  it("honors role=alertdialog, and never sets aria-modal", () => {
    // The layer is non-modal, so the attribute is *absent* — not `"false"`, which would claim the
    // popup is a dialog that deliberately isn't modal rather than one that never was.
    const { container, dispose } = mountHarness({
      options: { ...OPEN, role: "alertdialog" },
      contentProps: LABELLED,
    });
    const content = contentOf(container) as HTMLElement;

    expect(content.getAttribute("role")).toBe("alertdialog");
    expect(content.hasAttribute("aria-modal")).toBe(false);
    dispose();
  });

  it("mirrors the resolved placement as data-side / data-align", async () => {
    const { container, state, dispose } = mountHarness({
      options: { ...OPEN, side: "top", align: "start", flip: false, shift: false },
      contentProps: LABELLED,
    });

    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    const content = contentOf(container) as HTMLElement;
    expect(content.getAttribute("data-side")).toBe("top");
    expect(content.getAttribute("data-align")).toBe("start");
    dispose();
  });

  it("falls back id / aria-labelledby / aria-describedby to the registered state, consumer wins", async () => {
    const generated = mountHarness({ options: OPEN, contentProps: LABELLED });
    // With no Title mounted the internal fallback resolves to `undefined`, and the consumer's own
    // `aria-labelledby` has to survive that — a getter that returned `undefined` unconditionally
    // would strip it, and the popup would lose its accessible name.
    expect(contentOf(generated.container)?.getAttribute("aria-labelledby")).toBe(TITLE_ID);
    expect(contentOf(generated.container)?.id).toBe(generated.state().popupId());
    generated.dispose();

    const custom = mountHarness({
      options: OPEN,
      contentProps: {
        ...LABELLED,
        id: "custom-popup",
        "aria-describedby": "popover-content-description",
      },
    });
    expect(contentOf(custom.container)?.id).toBe("custom-popup");
    expect(contentOf(custom.container)?.getAttribute("aria-describedby")).toBe(
      "popover-content-description",
    );
    // …and a consumer id is published up, so the trigger's `aria-controls` names the element that
    // actually exists rather than the generated fallback.
    await vi.waitFor(() =>
      expect(triggerOf(custom.container).getAttribute("aria-controls")).toBe("custom-popup"),
    );
    custom.dispose();
  });

  it("focuses into the popup on open, and restores focus to the trigger on close", async () => {
    const { container, dispose } = mountHarness({
      contentProps: LABELLED,
      withInnerButton: true,
    });
    const trigger = triggerOf(container);

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(container.querySelector('[data-testid="inner"]')),
    );

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(document.activeElement).toBe(trigger));
    dispose();
  });

  it("focuses initialFocus over the first focusable descendant, and never spreads it as an attribute", async () => {
    let target!: HTMLButtonElement;
    const { container, dispose } = mountHarness({
      options: OPEN,
      contentProps: {
        ...LABELLED,
        // Read lazily by the autofocus effect after mount, so `target` — assigned by the ref
        // below during that same mount — is resolved by the time focus is applied.
        initialFocus: () => target,
      },
      // Rendered *before* `target`, so "first focusable descendant" and "initialFocus" are
      // different elements and the assertion can tell them apart.
      withInnerButton: true,
      extraContent: () => (
        <button type="button" data-testid="target" ref={target}>
          target
        </button>
      ),
    });

    await vi.waitFor(() => expect(document.activeElement).toBe(target));
    // `initialFocus` is a control prop, never an attribute on the surface.
    expect(contentOf(container)?.hasAttribute("initialfocus")).toBe(false);
    dispose();
  });

  it("does NOT dismiss itself while opening, with closeOnFocusOutside at its default", async () => {
    // The reopen race. Autofocus's `.focus()` dispatches `focusin` synchronously, and because
    // `createAutoFocus` is created *before* `createDismissable`, that lands before the dismissal
    // listener attaches — otherwise the layer would dismiss itself on reopen. The listener's own
    // containment check is the second, independent guard, covering the cold-open path.
    const { container, state, dispose } = mountHarness({
      contentProps: LABELLED,
      withInnerButton: true,
    });
    expect(state().closeOnFocusOutside()).toBe(true);

    await userEvent.click(page.getByTestId("trigger"));
    await nextFrame();
    expect(contentOf(container)).toBeTruthy();
    expect(state().open()).toBe(true);
    dispose();
  });

  it("closes when the trigger is clicked while open, and STAYS closed", async () => {
    // The whole reason the trigger is excluded from dismissal: without it the capture-phase
    // pointerdown dismisses and the trigger's own `click` reopens, so the popover could never be
    // closed by the control that opened it.
    const { container, state, dispose } = mountHarness({
      contentProps: LABELLED,
      withInnerButton: true,
    });

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeTruthy());

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());

    await nextFrame();
    expect(contentOf(container)).toBeNull();
    expect(state().open()).toBe(false);
    expect(triggerOf(container).getAttribute("aria-expanded")).toBe("false");
    dispose();
  });

  it("closes when Tab moves focus out, and stays open when Shift+Tab lands back on the trigger", async () => {
    const { container, state, dispose } = mountHarness({
      contentProps: LABELLED,
      withInnerButton: true,
      withOutsideButton: true,
    });

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(container.querySelector('[data-testid="inner"]')),
    );

    // Shift+Tab from the popup's first focusable lands on the trigger, which is excluded — so the
    // layer stays open and `aria-expanded` stays truthful about it.
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await nextFrame();
    expect(document.activeElement).toBe(triggerOf(container));
    expect(state().open()).toBe(true);
    expect(triggerOf(container).getAttribute("aria-expanded")).toBe("true");

    // Tab forward twice — back into the popup, then out of it entirely — and the layer closes.
    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Tab}");
    await vi.waitFor(() => expect(state().open()).toBe(false));
    dispose();
  });

  it("does NOT close on focus-out when closeOnFocusOutside is false", async () => {
    const { container, state, dispose } = mountHarness({
      options: { closeOnFocusOutside: false },
      contentProps: LABELLED,
      withInnerButton: true,
      withOutsideButton: true,
    });

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(container.querySelector('[data-testid="inner"]')),
    );

    (container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    await nextFrame();
    expect(state().open()).toBe(true);
    dispose();
  });

  it("dismisses on Escape and on an outside pointerdown, unless the matching toggle is off", async () => {
    const onEscape = mountHarness({ options: OPEN, contentProps: LABELLED });
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(contentOf(onEscape.container)).toBeNull());
    onEscape.dispose();

    const noEscape = mountHarness({
      options: { ...OPEN, closeOnEscape: false },
      contentProps: LABELLED,
    });
    await userEvent.keyboard("{Escape}");
    await nextFrame();
    expect(contentOf(noEscape.container)).toBeTruthy();
    noEscape.dispose();

    const outside = mountHarness({ options: OPEN, contentProps: LABELLED });
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await vi.waitFor(() => expect(contentOf(outside.container)).toBeNull());
    outside.dispose();

    const noOutside = mountHarness({
      options: { ...OPEN, closeOnInteractOutside: false },
      contentProps: LABELLED,
    });
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await nextFrame();
    expect(contentOf(noOutside.container)).toBeTruthy();
    noOutside.dispose();
  });

  it("forwards the consumer's own attributes and handlers onto the element", async () => {
    const onPointerDown = vi.fn();
    const { container, dispose } = mountHarness({
      options: OPEN,
      contentProps: { ...LABELLED, title: "kept", lang: "fr", onPointerDown },
    });
    const content = contentOf(container) as HTMLElement;

    expect(content.getAttribute("title")).toBe("kept");
    expect(content.getAttribute("lang")).toBe("fr");
    content.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDown).toHaveBeenCalledOnce();
    dispose();
  });

  it("has no baseline accessibility violations while open", async () => {
    const { container, state, dispose } = mountHarness({
      options: OPEN,
      contentProps: LABELLED,
      withInnerButton: true,
    });

    // After the first measurement, deliberately: axe would otherwise inspect the pre-positioned
    // `visibility: hidden` intermediate and return an `incomplete` nobody can act on.
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    await expectNoA11yViolations(container, {
      // Not a markup problem: axe cannot decide `aria-valid-attr-value` for ANY element that
      // carries both `aria-haspopup` and `aria-controls` — it never resolves the IDREF, because a
      // popup may be added on demand. The IDREF itself is pinned in
      // `popover-trigger.browser.test.tsx`.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
  });
});
