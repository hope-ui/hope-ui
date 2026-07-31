import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { SelectionMode } from "../../internal";
import type { CreateComboboxReturn } from "../combobox-root";
import {
  ComboboxHarness,
  type ComboboxHarnessProps,
  contentOf,
  FRUITS,
  nextFrame,
  triggerOf,
} from "./combobox-harness";

// The trigger is part of every tree here on purpose: the spared/excluded element that lets a
// *toggling* trigger coexist with modality is wired in this hook, and only observable against one.

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

describe("createComboboxContent", () => {
  it("is not mounted while closed, and reflects the shared presence while open", async () => {
    const closed = mountHarness();
    expect(contentOf(closed.container)).toBeNull();
    closed.dispose();

    const open = mountHarness({ options: { defaultOpen: true } });
    const content = contentOf(open.container) as HTMLElement;
    expect(content.getAttribute("data-presence")).toBeTruthy();
    // It is not the listbox — `role="listbox"` may only contain options and groups, so the card and
    // the list stay distinct parts (which is what leaves room for a Combobox `Empty` / `Status`).
    expect(content.hasAttribute("role")).toBe(false);
    expect(content.hasAttribute("aria-modal")).toBe(false);
    open.dispose();
  });

  it("dismisses on Escape and on an outside pointerdown, unless the matching toggle is off", async () => {
    const onEscape = mountHarness({ options: { defaultOpen: true, modal: false } });
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(contentOf(onEscape.container)).toBeNull());
    onEscape.dispose();

    const noEscape = mountHarness({
      options: { defaultOpen: true, modal: false, closeOnEscape: false },
    });
    await userEvent.keyboard("{Escape}");
    await nextFrame();
    expect(contentOf(noEscape.container)).toBeTruthy();
    noEscape.dispose();

    const outside = mountHarness({ options: { defaultOpen: true, modal: false } });
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await vi.waitFor(() => expect(contentOf(outside.container)).toBeNull());
    outside.dispose();

    const noOutside = mountHarness({
      options: { defaultOpen: true, modal: false, closeOnInteractOutside: false },
    });
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await nextFrame();
    expect(contentOf(noOutside.container)).toBeTruthy();
    noOutside.dispose();
  });

  it("closes when focus leaves for another control, unless closeOnFocusOutside is off", async () => {
    // Nothing traps focus here, so tabbing away must not leave an orphaned popup behind.
    const closing = mountHarness({
      options: { defaultOpen: true, modal: false },
      withOutsideButton: true,
    });
    (closing.container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    await vi.waitFor(() => expect(contentOf(closing.container)).toBeNull());
    closing.dispose();

    const staying = mountHarness({
      options: { defaultOpen: true, modal: false, closeOnFocusOutside: false },
      withOutsideButton: true,
    });
    (staying.container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    await nextFrame();
    expect(contentOf(staying.container)).toBeTruthy();
    staying.dispose();
  });

  it("keeps focus on the trigger, so opening never dismisses itself", async () => {
    // The focus-out listener is armed by default, and the trigger is `exclude`d — so the click that
    // opens the popup (and focuses the trigger) cannot read as focus landing outside.
    const { container, state, dispose } = mountHarness();
    expect(state().closeOnFocusOutside()).toBe(true);

    await userEvent.click(page.getByTestId("trigger"));
    await nextFrame();
    expect(contentOf(container)).toBeTruthy();
    expect(document.activeElement).toBe(triggerOf(container));
    dispose();
  });

  it("closes when the trigger is clicked while open, and STAYS closed — modality included", async () => {
    // The whole reason the trigger is both spared and excluded. Without the `exclude` the
    // capture-phase pointerdown dismisses and the trigger's own `click` reopens; without the `spare`
    // the trigger is `inert` by the time the second click arrives and never receives it at all.
    const { container, state, dispose } = mountHarness();

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeTruthy());
    expect(triggerOf(container).hasAttribute("inert")).toBe(false);

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());

    await nextFrame();
    expect(contentOf(container)).toBeNull();
    expect(state().open()).toBe(false);
    expect(triggerOf(container).getAttribute("aria-expanded")).toBe("false");
    dispose();
  });

  it("hides outside content and locks scroll while modal, and undoes both on close", async () => {
    const outside = document.createElement("div");
    outside.textContent = "outside";
    document.body.append(outside);

    const { container, state, dispose } = mountHarness();
    await userEvent.click(page.getByTestId("trigger"));
    await waitForPositioned(state);

    // Both mechanisms, deliberately: `aria-hidden` takes the page out of the accessibility tree,
    // `inert` takes it out of the focus order and hit testing. Neither alone suffices.
    expect(outside.getAttribute("aria-hidden")).toBe("true");
    expect(outside.hasAttribute("inert")).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
    // …and the popup itself is never inert, which is what a run before the target resolved would do.
    expect(contentOf(container)?.hasAttribute("inert")).toBe(false);

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    expect(outside.hasAttribute("inert")).toBe(false);
    expect(outside.hasAttribute("aria-hidden")).toBe(false);
    expect(document.body.style.overflow).toBe("");

    dispose();
    outside.remove();
  });

  it("does neither when modal is false", async () => {
    const outside = document.createElement("div");
    outside.textContent = "outside";
    document.body.append(outside);

    const { state, dispose } = mountHarness({ options: { defaultOpen: true, modal: false } });
    await waitForPositioned(state);
    expect(outside.hasAttribute("inert")).toBe(false);
    expect(outside.hasAttribute("aria-hidden")).toBe(false);
    expect(document.body.style.overflow).toBe("");

    dispose();
    outside.remove();
  });

  it("forwards the consumer's own attributes and handlers onto the card", async () => {
    const onPointerDown = vi.fn();
    const { container, dispose } = mountHarness({
      options: { defaultOpen: true },
      contentProps: { id: "fruit-card", title: "kept", lang: "fr", onPointerDown },
    });
    const content = contentOf(container) as HTMLElement;

    expect(content.id).toBe("fruit-card");
    expect(content.getAttribute("title")).toBe("kept");
    expect(content.getAttribute("lang")).toBe("fr");
    content.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    expect(onPointerDown).toHaveBeenCalledOnce();
    // The card's id is the consumer's business; `aria-controls` names the *listbox*, not this.
    expect(triggerOf(container).getAttribute("aria-controls")).not.toBe("fruit-card");
    dispose();
  });

  it("has no accessibility violations while open", async () => {
    const { container, state, dispose } = mountHarness({ options: { defaultOpen: true } });
    await waitForPositioned(state);
    await expectNoA11yViolations(container, {
      // Undecidable by construction: axe returns `aria-valid-attr-value` as *incomplete* for any
      // element carrying both `aria-haspopup` and `aria-controls`, without resolving the IDREF.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    dispose();
  });
});
