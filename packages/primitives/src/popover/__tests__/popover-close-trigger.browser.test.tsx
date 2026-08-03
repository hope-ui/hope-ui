import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createPopoverCloseTrigger } from "../popover-close-trigger";
import { createPopoverContent } from "../popover-content";
import { createPopoverPositioner } from "../popover-positioner";
import {
  type CreatePopoverOptions,
  type CreatePopoverReturn,
  createPopover,
} from "../popover-root";
import { createPopoverTitle } from "../popover-title";
import { createPopoverTrigger } from "../popover-trigger";

/** Clear of every edge, so neither `flip` nor `shift` has anything to react to. */
const TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "300px",
};

function PopupTitle(props: { state: CreatePopoverReturn }) {
  const title = createPopoverTitle(props.state, {});
  return <h2 {...title.props}>Popover title</h2>;
}

interface HarnessProps {
  options?: CreatePopoverOptions;
  closeProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  onReady?: (state: CreatePopoverReturn) => void;
}

function Harness(props: HarnessProps) {
  const state = createPopover(props.options);
  props.onReady?.(state);
  const trigger = createPopoverTrigger(state, {});
  const positioner = createPopoverPositioner(state, {});
  const content = createPopoverContent(state, {});
  const close = createPopoverCloseTrigger(state, props.closeProps ?? {});

  return (
    <>
      <button data-testid="trigger" style={TRIGGER_STYLE} {...trigger.props} ref={trigger.setRef}>
        open
      </button>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          <div data-testid="content" {...content.props} ref={content.setRef}>
            <PopupTitle state={state} />
            {/* `type` and the accessible name are the `CloseButton` component's job, not this
            hook's — so a headless consumer on a bare `<button>` supplies both, as here. */}
            <button type="button" aria-label="Close" data-testid="close" {...close.props}>
              ×
            </button>
          </div>
        </div>
      </Show>
    </>
  );
}

function mountHarness(props: HarnessProps = {}) {
  let state!: CreatePopoverReturn;
  const result = mount(() => <Harness {...props} onReady={(ready) => (state = ready)} />);
  return { ...result, state: () => state };
}

function elementOf(container: HTMLElement, testId: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (element === null) {
    throw new Error(`no element with data-testid="${testId}"`);
  }
  return element;
}

const OPEN: CreatePopoverOptions = { defaultOpen: true };

/** One frame is enough for a close that was going to happen to have happened. */
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe("createPopoverCloseTrigger", () => {
  it("closes the popover on click", async () => {
    const { container, state, dispose } = mountHarness({ options: OPEN });
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));

    await userEvent.click(page.getByTestId("close"));

    await vi.waitFor(() => expect(state().open()).toBe(false));
    expect(container.querySelector('[data-testid="content"]')).toBeNull();
    dispose();
  });

  it("runs the consumer's onClick first, so preventDefault cancels the close", async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { container, state, dispose } = mountHarness({ options: OPEN, closeProps: { onClick } });
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));

    await userEvent.click(page.getByTestId("close"));
    await nextFrame();

    expect(onClick).toHaveBeenCalledOnce();
    expect(state().open()).toBe(true);
    expect(container.querySelector('[data-testid="content"]')).toBeTruthy();
    dispose();
  });

  it("owns only the close handler — no type, no accessible name of its own", () => {
    // Deliberately minimal: `type="button"` and the localized label belong to the `CloseButton`
    // component that `Popover.CloseTrigger` renders, so each default has one owner. Asserted on a
    // bare `<button>` with the test supplying neither.
    let close!: ReturnType<typeof createPopoverCloseTrigger>;
    const { dispose } = mount(() => {
      const state = createPopover();
      close = createPopoverCloseTrigger(state, {});
      return null;
    });

    expect(close.props.type).toBeUndefined();
    expect(close.props["aria-label"]).toBeUndefined();
    dispose();
  });

  it("forwards the consumer's own attributes onto the element", () => {
    const { container, dispose } = mountHarness({
      options: OPEN,
      closeProps: { id: "custom-close", title: "kept", lang: "fr" },
    });
    const close = elementOf(container, "close");

    expect(close.id).toBe("custom-close");
    expect(close.getAttribute("title")).toBe("kept");
    expect(close.getAttribute("lang")).toBe("fr");
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, state, dispose } = mountHarness({ options: OPEN });

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
