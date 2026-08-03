import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { type CreatePopoverContentProps, createPopoverContent } from "../popover-content";
import { createPopoverDescription } from "../popover-description";
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

/** Present in every tree: `role="dialog"` with no accessible name is an axe `aria-dialog-name`
 * violation, so the popup is labelled even when this file is about the description. */
function PopupTitle(props: { state: CreatePopoverReturn }) {
  const title = createPopoverTitle(props.state, {});
  return <h2 {...title.props}>Popover title</h2>;
}

/** Its own component, so `createRegisteredId`'s cleanup is scoped to the description's unmount. */
function PopupDescription(props: {
  state: CreatePopoverReturn;
  descriptionProps?: JSX.HTMLAttributes<HTMLParagraphElement>;
}) {
  const description = createPopoverDescription(props.state, props.descriptionProps ?? {});
  return (
    <p data-testid="description" {...description.props}>
      Body copy
    </p>
  );
}

interface HarnessProps {
  options?: CreatePopoverOptions;
  contentProps?: CreatePopoverContentProps;
  descriptionProps?: JSX.HTMLAttributes<HTMLParagraphElement>;
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
            <PopupTitle state={state} />
            <PopupDescription state={state} descriptionProps={props.descriptionProps} />
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

describe("createPopoverDescription", () => {
  it("registers a generated id, and the popup's aria-describedby points at it", async () => {
    const { container, state, dispose } = mountHarness({ options: OPEN });
    const description = elementOf(container, "description");

    expect(description.id).toBeTruthy();
    await vi.waitFor(() => expect(state().descriptionId()).toBe(description.id));
    expect(elementOf(container, "content").getAttribute("aria-describedby")).toBe(description.id);
    dispose();
  });

  it("uses a consumer id and registers that one instead", async () => {
    const { container, state, dispose } = mountHarness({
      options: OPEN,
      descriptionProps: { id: "custom-description" },
    });

    expect(elementOf(container, "description").id).toBe("custom-description");
    await vi.waitFor(() => expect(state().descriptionId()).toBe("custom-description"));
    expect(elementOf(container, "content").getAttribute("aria-describedby")).toBe(
      "custom-description",
    );
    dispose();
  });

  it("does not overwrite an aria-describedby the consumer put on the content", async () => {
    const { container, state, dispose } = mountHarness({
      options: OPEN,
      contentProps: { "aria-describedby": "elsewhere" },
    });

    await vi.waitFor(() =>
      expect(state().descriptionId()).toBe(elementOf(container, "description").id),
    );
    expect(elementOf(container, "content").getAttribute("aria-describedby")).toBe("elsewhere");
    dispose();
  });

  it("forwards the consumer's own attributes onto the element", () => {
    const { container, dispose } = mountHarness({
      options: OPEN,
      descriptionProps: { title: "kept", lang: "fr" },
    });
    const description = elementOf(container, "description");

    expect(description.getAttribute("title")).toBe("kept");
    expect(description.getAttribute("lang")).toBe("fr");
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
