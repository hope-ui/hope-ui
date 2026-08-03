import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { type CreatePopoverContentProps, createPopoverContent } from "../popover-content";
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

/** Its own component, so the registration's cleanup is scoped to the title's unmount rather than the
 * popup's — the reason this hook must be called from the title's own owner scope. */
function PopupTitle(props: {
  state: CreatePopoverReturn;
  titleProps?: JSX.HTMLAttributes<HTMLHeadingElement>;
}) {
  const title = createPopoverTitle(props.state, props.titleProps ?? {});
  return (
    <h2 data-testid="title" {...title.props}>
      Popover title
    </h2>
  );
}

interface HarnessProps {
  options?: CreatePopoverOptions;
  contentProps?: CreatePopoverContentProps;
  titleProps?: JSX.HTMLAttributes<HTMLHeadingElement>;
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
        open
      </button>
      <Show when={positioner.mounted()}>
        <div data-testid="positioner" {...positioner.props} ref={positioner.setRef}>
          <div data-testid="content" {...content.props} ref={content.setRef}>
            <PopupTitle state={state} titleProps={props.titleProps} />
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

describe("createPopoverTitle", () => {
  it("gives the popup its accessible name: a generated id, registered and pointed at", async () => {
    // The other half of `popover-content.browser.test.tsx`'s labelling test, which could only assert
    // the consumer's own value because no Title was mounted there.
    const { container, state, dispose } = mountHarness({ options: OPEN });
    const title = elementOf(container, "title");

    expect(title.id).toBeTruthy();
    await vi.waitFor(() => expect(state().titleId()).toBe(title.id));
    expect(elementOf(container, "content").getAttribute("aria-labelledby")).toBe(title.id);
    dispose();
  });

  it("uses a consumer id and registers that one instead", async () => {
    // An unset id has to resolve to the generated one, or the popup ends up with no accessible name
    // at all — an axe `aria-dialog-name` violation on a `role="dialog"` surface.
    const { container, state, dispose } = mountHarness({
      options: OPEN,
      titleProps: { id: "custom-title" },
    });

    expect(elementOf(container, "title").id).toBe("custom-title");
    await vi.waitFor(() => expect(state().titleId()).toBe("custom-title"));
    expect(elementOf(container, "content").getAttribute("aria-labelledby")).toBe("custom-title");
    dispose();
  });

  it("does not overwrite an aria-labelledby the consumer put on the content", async () => {
    const { container, state, dispose } = mountHarness({
      options: OPEN,
      contentProps: { "aria-labelledby": "elsewhere" },
    });

    // The title still registers; the content's own value simply outranks it, because the internal
    // getter is a `??` fallback rather than an overwrite.
    await vi.waitFor(() => expect(state().titleId()).toBe(elementOf(container, "title").id));
    expect(elementOf(container, "content").getAttribute("aria-labelledby")).toBe("elsewhere");
    dispose();
  });

  it("forwards the consumer's own attributes onto the element", () => {
    const { container, dispose } = mountHarness({
      options: OPEN,
      titleProps: { title: "kept", lang: "fr" },
    });
    const title = elementOf(container, "title");

    expect(title.getAttribute("title")).toBe("kept");
    expect(title.getAttribute("lang")).toBe("fr");
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
