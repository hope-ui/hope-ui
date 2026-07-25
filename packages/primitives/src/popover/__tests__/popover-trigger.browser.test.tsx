import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  type CreatePopoverOptions,
  type CreatePopoverReturn,
  createPopover,
} from "../popover-root";
import { createPopoverTrigger } from "../popover-trigger";

// A browser test, like the rest of the family: `createPopover` owns `createPresence` (effects + rAF)
// and `createFloating` (`getComputedStyle`, `computePosition`), neither of which exists in the node
// environment.

interface HarnessProps {
  onClick?: (event: MouseEvent) => void;
  options?: CreatePopoverOptions;
  /** Renders a real element carrying the popup id, so `aria-controls` resolves to a valid IDREF. */
  withPopup?: boolean;
  onReady?: (state: CreatePopoverReturn) => void;
}

function Harness(props: HarnessProps) {
  const state = createPopover(props.options);
  props.onReady?.(state);
  const trigger = createPopoverTrigger(state, { onClick: props.onClick });

  return (
    <>
      <button data-testid="trigger" {...trigger.props} ref={trigger.setRef}>
        Open
      </button>
      {/* Given an accessible name, because `role="dialog"` without one is an axe
      `aria-dialog-name` violation — and real content, because an empty box has no height and axe
      reports `aria-controls` pointing at an invisible element as an *incomplete*
      `aria-valid-attr-value`, which `expectNoA11yViolations` also fails on. */}
      {props.withPopup && state.open() ? (
        <div id={state.popupId()} role="dialog" aria-label="Popover" data-testid="popup">
          Popover content
        </div>
      ) : null}
    </>
  );
}

function mountHarness(props: HarnessProps = {}) {
  let state!: CreatePopoverReturn;
  const result = mount(() => <Harness {...props} onReady={(ready) => (state = ready)} />);
  return { ...result, state: () => state };
}

const triggerOf = (container: Element) =>
  container.querySelector('[data-testid="trigger"]') as HTMLButtonElement;

describe("createPopoverTrigger", () => {
  it("defaults type=button and advertises the popup with aria-haspopup", () => {
    const { container, dispose } = mountHarness();
    const trigger = triggerOf(container);

    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    dispose();
  });

  it("keeps aria-haspopup=dialog for role=alertdialog", () => {
    // ARIA defines no `alertdialog` token for `aria-haspopup` — `dialog` is the only legal value
    // for both of `createPopover`'s roles.
    const { container, dispose } = mountHarness({ options: { role: "alertdialog" } });
    expect(triggerOf(container).getAttribute("aria-haspopup")).toBe("dialog");
    dispose();
  });

  it("TOGGLES on click, where Dialog's trigger only ever opens", async () => {
    const { container, dispose } = mountHarness();
    const trigger = triggerOf(container);

    await userEvent.click(page.getByTestId("trigger"));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await userEvent.click(page.getByTestId("trigger"));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    dispose();
  });

  it("names the popup with aria-controls only while open", async () => {
    const { container, dispose } = mountHarness({ withPopup: true });
    const trigger = triggerOf(container);

    // A dangling IDREF while closed is an invalid attribute value (axe `aria-valid-attr-value`),
    // which is why the attribute is omitted rather than left pointing at nothing.
    expect(trigger.getAttribute("aria-controls")).toBeNull();

    await userEvent.click(page.getByTestId("trigger"));
    const popup = container.querySelector('[data-testid="popup"]') as HTMLElement;
    expect(trigger.getAttribute("aria-controls")).toBe(popup.id);

    await userEvent.click(page.getByTestId("trigger"));
    expect(trigger.getAttribute("aria-controls")).toBeNull();
    dispose();
  });

  it("runs the consumer's onClick first, and preventDefault cancels the toggle", async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { container, dispose } = mountHarness({ onClick });
    const trigger = triggerOf(container);

    await userEvent.click(page.getByTestId("trigger"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    dispose();
  });

  it("registers its element as the anchor and the sole dismiss exclusion", () => {
    const { container, state, dispose } = mountHarness();
    const trigger = triggerOf(container);

    // Both halves of what the trigger element is for: `createFloating` positions against it until a
    // `Popover.Anchor` overrides it, and `createDismissable` must not count it as "outside".
    expect(state().triggerElement()).toBe(trigger);
    expect(state().anchorElement()).toBe(trigger);
    expect(state().dismissExclusions()).toEqual([trigger]);
    dispose();
  });

  it("has no accessibility violations, closed and open", async () => {
    const { container, dispose } = mountHarness({ withPopup: true });
    await expectNoA11yViolations(container);

    await userEvent.click(page.getByTestId("trigger"));
    await expectNoA11yViolations(container, {
      // Undecidable by construction, not a markup problem: axe returns `aria-valid-attr-value` as
      // *incomplete* for **any** element carrying both `aria-haspopup` and `aria-controls`, without
      // ever resolving the IDREF (`ariaValidAttrValueEvaluate`'s `controlsWithinPopup` pre-check) —
      // a popup may be added on demand, so it defers to a human. The closed assertion above runs
      // strict, and "aria-controls names the popup only while open" pins the IDREF itself.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
  });
});
