import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createHideOutside, type SelectionMode } from "../../internal";
import type { CreateComboboxReturn } from "../combobox-root";
import {
  ComboboxHarness,
  type ComboboxHarnessProps,
  contentOf,
  FRUITS,
  nextFrame,
  positionerOf,
  triggerOf,
} from "./combobox-harness";

function mountHarness(props: Partial<ComboboxHarnessProps<string>> = {}) {
  let state!: CreateComboboxReturn<string, SelectionMode>;
  const result = mount(() => (
    <ComboboxHarness
      values={FRUITS}
      {...props}
      onReady={(ready) => {
        state = ready;
        props.onReady?.(ready);
      }}
    />
  ));
  return { ...result, state: () => state };
}

async function waitForPositioned(state: () => CreateComboboxReturn<string, SelectionMode>) {
  await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
}

describe("createComboboxPositioner", () => {
  it("is not mounted while closed, and carries the resolved placement while open", async () => {
    const closed = mountHarness();
    expect(positionerOf(closed.container)).toBeNull();
    closed.dispose();

    const open = mountHarness({
      options: { defaultOpen: true, side: "top", align: "start", flip: false, shift: false },
    });
    await waitForPositioned(open.state);

    const positioner = positionerOf(open.container) as HTMLElement;
    expect(positioner.getAttribute("data-side")).toBe("top");
    expect(positioner.getAttribute("data-align")).toBe("start");
    expect(positioner.getAttribute("data-presence")).toBeTruthy();
    open.dispose();
  });

  it("publishes the four --anchor-*/--available-* properties, and only after a measurement", async () => {
    // `--anchor-width` is not a nicety for a combobox: it is how the popup matches the trigger's
    // width, and `--available-height` is what caps the list so it scrolls instead of overflowing.
    const { container, state, dispose } = mountHarness({ options: { defaultOpen: true } });
    await waitForPositioned(state);

    const positioner = positionerOf(container) as HTMLElement;
    const triggerWidth = triggerOf(container).getBoundingClientRect().width;
    // The measurement reports whole pixels, so this is "the trigger's width", not an exact rect.
    const anchorWidth = Number.parseFloat(positioner.style.getPropertyValue("--anchor-width"));
    expect(Math.abs(anchorWidth - triggerWidth)).toBeLessThan(1);
    expect(positioner.style.getPropertyValue("--anchor-height")).toBeTruthy();
    expect(positioner.style.getPropertyValue("--available-width")).toBeTruthy();
    expect(positioner.style.getPropertyValue("--available-height")).toBeTruthy();
    // Unprefixed on purpose: the names describe the anchor, not the component, and
    // `Popover.Positioner` publishes the same four.
    expect(positioner.style.getPropertyValue("--hope-anchor-width")).toBe("");
    dispose();
  });

  it("emits nothing before the first measurement, rather than a 0px placeholder", async () => {
    // A real `0px` would collapse whatever reads it; an absent property leaves
    // `width: var(--anchor-width)` invalid, so the browser drops that one declaration and the
    // element keeps its natural size. It is also what keeps server and first client render identical.
    let state!: CreateComboboxReturn<string, SelectionMode>;
    const { container, dispose } = mount(() => (
      <ComboboxHarness values={FRUITS} onReady={(ready) => (state = ready)} />
    ));

    await userEvent.click(page.getByTestId("trigger"));
    const positioner = await vi.waitFor(() => {
      const element = positionerOf(container);
      expect(element).toBeTruthy();
      return element as HTMLElement;
    });
    if (!state.floating.isPositioned()) {
      expect(positioner.style.getPropertyValue("--anchor-width")).toBe("");
      expect(positioner.style.visibility).toBe("hidden");
    }

    await waitForPositioned(() => state);
    expect(positioner.style.getPropertyValue("--anchor-width")).not.toBe("");
    dispose();
  });

  it("merges a consumer's object style OVER the kernel's, and drops a string one with a warning", async () => {
    const merged = mountHarness({
      options: { defaultOpen: true },
      positionerProps: { style: { "z-index": 50 } },
    });
    await waitForPositioned(merged.state);
    const positioner = positionerOf(merged.container) as HTMLElement;
    // Consumer last, so their `z-index` survives…
    expect(positioner.style.zIndex).toBe("50");
    // …without losing the computed position, which has to win or the popup paints at 0,0.
    expect(positioner.style.position).toBeTruthy();
    merged.dispose();

    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const dropped = mountHarness({
      options: { defaultOpen: true },
      positionerProps: { style: "z-index: 50" },
    });
    await waitForPositioned(dropped.state);
    // A string `style` has no merge seam, so it is dropped — and dropping it *silently* is how a
    // consumer spends an afternoon on a style that never applied.
    expect((positionerOf(dropped.container) as HTMLElement).style.zIndex).toBe("");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("createComboboxPositioner"));
    dropped.dispose();
    warn.mockRestore();
  });

  it("stays visible inside an enclosing hide-outside layer", async () => {
    // A Select opened inside a modal Dialog appears *after* the modal, so the modal's observer would
    // hide it — leaving a popup that paints on top, undimmed and legible, yet `inert`: out of the
    // accessibility tree and transparent to clicks. `createKeepVisible` registers the positioner into
    // the enclosing layer's exempt set, which covers its whole subtree.
    function EnclosingModal(): JSX.Element {
      const [ref, setRef] = createSignal<HTMLElement>();
      createHideOutside({ active: () => true, target: ref, spare: () => [] });
      return (
        <div ref={setRef} data-testid="modal">
          modal
        </div>
      );
    }

    let state!: CreateComboboxReturn<string, SelectionMode>;
    const { container, dispose } = mount(() => (
      <>
        <EnclosingModal />
        <ComboboxHarness values={FRUITS} onReady={(ready) => (state = ready)} />
      </>
    ));

    // The trigger sits outside the enclosing layer, so it *is* hidden — that is the modal working.
    await vi.waitFor(() => expect(triggerOf(container).hasAttribute("inert")).toBe(true));

    state.setOpen(true);
    await waitForPositioned(() => state);
    await nextFrame();

    const positioner = positionerOf(container) as HTMLElement;
    expect(positioner.hasAttribute("inert")).toBe(false);
    expect(positioner.hasAttribute("aria-hidden")).toBe(false);
    expect(contentOf(container)?.hasAttribute("inert")).toBe(false);
    dispose();
  });

  it("forwards the consumer's own attributes, and keeps the presence gate shared with the content", async () => {
    const { container, state, dispose } = mountHarness({
      options: { defaultOpen: true },
      positionerProps: { title: "kept", lang: "fr" },
    });
    await waitForPositioned(state);

    const positioner = positionerOf(container) as HTMLElement;
    expect(positioner.getAttribute("title")).toBe("kept");
    expect(positioner.getAttribute("lang")).toBe("fr");
    // One presence for both parts: the positioner cannot unmount out from under the card it wraps.
    expect(positioner.getAttribute("data-presence")).toBe(
      contentOf(container)?.getAttribute("data-presence"),
    );
    expect(state().contentPresence.mounted()).toBe(true);
    dispose();
  });

  it("has no accessibility violations while open", async () => {
    const { container, state, dispose } = mountHarness({ options: { defaultOpen: true } });
    await waitForPositioned(state);
    await expectNoA11yViolations(container, {
      // Not a markup problem: axe cannot decide `aria-valid-attr-value` for ANY element that
      // carries both `aria-haspopup` and `aria-controls` — it never resolves the IDREF, because a
      // popup may be added on demand. The IDREF itself is pinned in
      // `combobox-trigger.browser.test.tsx`.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
  });
});
