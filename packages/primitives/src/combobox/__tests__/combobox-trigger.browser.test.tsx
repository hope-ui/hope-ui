import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { SelectionMode } from "../../internal";
import type { CreateComboboxReturn } from "../combobox-root";
import {
  activeLabel,
  ComboboxHarness,
  type ComboboxHarnessProps,
  contentOf,
  FRUITS,
  highlightedLabels,
  listOf,
  nextFrame,
  nth,
  optionsOf,
  selectedLabels,
  triggerOf,
  valuePartOf,
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

async function openWithKeyboard(container: Element, key: string) {
  triggerOf(container).focus();
  await userEvent.keyboard(key);
  await vi.waitFor(() => expect(contentOf(container)).toBeTruthy());
}

describe("createComboboxTrigger", () => {
  it("is the combobox: role, aria-haspopup, aria-expanded, and type=button", () => {
    const { container, dispose } = mountHarness();
    const trigger = triggerOf(container);

    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    // From `createButton`: a trigger inside a form must never accidentally submit it.
    expect(trigger.getAttribute("type")).toBe("button");
    dispose();
  });

  it("names the popup with aria-controls only while open", async () => {
    const { container, dispose } = mountHarness();
    const trigger = triggerOf(container);

    // A dangling IDREF while closed is an invalid attribute value on *every* closed Select on the
    // page, which is why the attribute is omitted rather than left pointing at nothing.
    expect(trigger.getAttribute("aria-controls")).toBeNull();

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeTruthy());
    expect(trigger.getAttribute("aria-controls")).toBe(listOf(container)?.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    expect(trigger.getAttribute("aria-controls")).toBeNull();
    dispose();
  });

  it("tracks the active option with aria-activedescendant, and NEVER focuses one", async () => {
    const { container, dispose } = mountHarness({ options: { selectionMode: "multiple" } });
    const trigger = triggerOf(container);
    await openWithKeyboard(container, "{ArrowDown}");

    await vi.waitFor(() => expect(activeLabel(container)).toBe("Apple"));
    await userEvent.keyboard("{ArrowDown}");
    expect(activeLabel(container)).toBe("Banana");
    expect(document.activeElement).toBe(trigger);

    // Options carry `tabindex="-1"`, which still leaves them *click*-focusable — so a click that
    // moved focus would break the pattern silently. `createComboboxList` cancels the mousedown.
    await userEvent.click(nth(optionsOf(container), 2));
    expect(document.activeElement).toBe(trigger);
    expect(optionsOf(container).every((option) => option !== document.activeElement)).toBe(true);
    dispose();
  });

  it("paints the highlight only while the widget holds focus", async () => {
    // Non-modal, and with focus-out dismissal off: modality would make the outside button `inert`
    // (so `.focus()` becomes a silent no-op), and focus-out dismissal would unmount the options —
    // either way the assertion below would pass for the wrong reason.
    const { container, dispose } = mountHarness({
      options: { modal: false, closeOnFocusOutside: false },
      withOutsideButton: true,
    });
    await openWithKeyboard(container, "{ArrowDown}");
    await vi.waitFor(() => expect(highlightedLabels(container)).toEqual(["Apple"]));

    // `data-active` means "highlighted *and* the widget is focused", and the trigger is the only
    // element the widget's focus ever lands on — so it is the only thing that can report the second
    // half.
    (container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    await nextFrame();
    expect(highlightedLabels(container)).toEqual([]);
    expect(activeLabel(container)).toBe("Apple");
    dispose();
  });

  it("opens on ArrowDown/ArrowUp/Alt+ArrowDown, and Alt+ArrowUp closes an open popup", async () => {
    const alt = mountHarness();
    await openWithKeyboard(alt.container, "{Alt>}{ArrowDown}{/Alt}");
    expect(alt.state().focusStrategy()).toBe("first");

    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await vi.waitFor(() => expect(contentOf(alt.container)).toBeNull());
    alt.dispose();

    const up = mountHarness();
    await openWithKeyboard(up.container, "{ArrowUp}");
    expect(up.state().focusStrategy()).toBe("last");
    up.dispose();
  });

  it("moves the highlight with the arrows, Home/End and the page keys while open", async () => {
    const { container, state, dispose } = mountHarness();
    await openWithKeyboard(container, "{ArrowDown}");
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));

    await userEvent.keyboard("{End}");
    expect(activeLabel(container)).toBe("Açaí");
    await userEvent.keyboard("{Home}");
    expect(activeLabel(container)).toBe("Apple");
    await userEvent.keyboard("{PageDown}");
    expect(activeLabel(container)).toBe("Açaí");
    await userEvent.keyboard("{PageUp}");
    expect(activeLabel(container)).toBe("Apple");
    await userEvent.keyboard("{ArrowUp}");
    // `wrap` is off by default, so the first option has nowhere to go.
    expect(activeLabel(container)).toBe("Apple");
    dispose();
  });

  it("selects with Enter — and the synthesized click does NOT reopen what it just closed", async () => {
    // On a native `<button>` the browser turns Enter into a `click`, which would re-enter the toggle.
    // Cancelling it in the keymap is what stops that; without it this test flaps open again.
    const { container, state, dispose } = mountHarness();
    await openWithKeyboard(container, "{Enter}");
    // The highlight-placing effect is gated on the first measurement, so an arrow pressed before it
    // lands would be overwritten by the entry strategy that effect applies.
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    expect(activeLabel(container)).toBe("Apple");

    await userEvent.keyboard("{ArrowDown}");
    expect(activeLabel(container)).toBe("Banana");

    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    await nextFrame();
    expect(contentOf(container)).toBeNull();
    expect(valuePartOf(container)?.textContent).toBe("Banana");
    dispose();
  });

  it("selects with Space, and opens on the selected option", async () => {
    const { container, state, dispose } = mountHarness({ options: { defaultValue: "Cherry" } });
    triggerOf(container).focus();

    await userEvent.keyboard(" ");
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    expect(state().focusStrategy()).toBe("selected");
    expect(activeLabel(container)).toBe("Cherry");

    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard(" ");
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    expect(state().value()).toBe("Date");
    dispose();
  });

  it("closes on Escape while open, and leaves a closed Escape for whatever encloses it", async () => {
    const onKeyDown = vi.fn();
    const { container, dispose } = mountHarness({ triggerProps: { onKeyDown } });
    await openWithKeyboard(container, "{ArrowDown}");

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    expect(document.activeElement).toBe(triggerOf(container));

    // Escape is not consumed while closed — a Select inside a Dialog must not swallow its key.
    onKeyDown.mockClear();
    await userEvent.keyboard("{Escape}");
    const event = onKeyDown.mock.calls[0]?.[0] as KeyboardEvent;
    expect(event.defaultPrevented).toBe(false);
    dispose();
  });

  it("routes typeahead to the highlight while open", async () => {
    const { container, state, dispose } = mountHarness();
    await openWithKeyboard(container, "{ArrowDown}");
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));

    await userEvent.keyboard("c");
    expect(activeLabel(container)).toBe("Cherry");
    // Highlight, not selection: the popup is open, so there is a row to point at.
    expect(selectedLabels(container)).toEqual([]);
    expect(contentOf(container)).toBeTruthy();
    dispose();
  });

  it("prepends the Value's id to aria-labelledby, keeping the consumer's own label", async () => {
    const withValue = mountHarness();
    await vi.waitFor(() =>
      expect(triggerOf(withValue.container).getAttribute("aria-labelledby")).toBeTruthy(),
    );
    const trigger = triggerOf(withValue.container);
    const ids = (trigger.getAttribute("aria-labelledby") as string).split(" ");
    // Value first, so a screen reader announces the selection before the field's label…
    expect(nth(ids, 0)).toBe(valuePartOf(withValue.container)?.id);
    // …and the trigger names *itself* too, because `aria-labelledby` outranks `aria-label` in the
    // accessible-name algorithm and the consumer's label would otherwise silently vanish.
    expect(nth(ids, 1)).toBe(trigger.id);
    withValue.dispose();

    const labelled = mountHarness({ triggerProps: { "aria-labelledby": "outer-label" } });
    await vi.waitFor(() =>
      expect(triggerOf(labelled.container).getAttribute("aria-labelledby")).toContain(
        "outer-label",
      ),
    );
    labelled.dispose();

    // With no Value mounted there is nothing to prepend, so the consumer's own labelling is
    // forwarded untouched rather than joined to a dangling id.
    const bare = mountHarness({ withoutValue: true });
    await nextFrame();
    expect(triggerOf(bare.container).hasAttribute("aria-labelledby")).toBe(false);
    expect(triggerOf(bare.container).getAttribute("aria-label")).toBe("Fruit");
    bare.dispose();
  });

  it("falls its id back to the state's, and publishes a consumer id up to the list", async () => {
    const generated = mountHarness();
    expect(triggerOf(generated.container).id).toBe(generated.state().triggerId());
    generated.dispose();

    const custom = mountHarness({ triggerProps: { id: "fruit-trigger" } });
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(custom.container)).toBeTruthy());
    expect(triggerOf(custom.container).id).toBe("fruit-trigger");
    // The list is labelled by the trigger, so a consumer id has to reach it.
    expect(listOf(custom.container)?.getAttribute("aria-labelledby")).toBe("fruit-trigger");
    custom.dispose();
  });

  it("runs the consumer's handlers first, and preventDefault cancels the whole keymap", async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const onKeyDown = vi.fn((event: KeyboardEvent) => event.preventDefault());
    const { container, dispose } = mountHarness({
      triggerProps: { onClick, onKeyDown, title: "kept", lang: "fr" },
    });

    await userEvent.click(page.getByTestId("trigger"));
    await nextFrame();
    expect(onClick).toHaveBeenCalledOnce();
    expect(contentOf(container)).toBeNull();

    triggerOf(container).focus();
    await userEvent.keyboard("{ArrowDown}");
    await nextFrame();
    expect(onKeyDown).toHaveBeenCalled();
    expect(contentOf(container)).toBeNull();

    // …and the attributes the hook does not consume land on the element.
    expect(triggerOf(container).getAttribute("title")).toBe("kept");
    expect(triggerOf(container).getAttribute("lang")).toBe("fr");
    dispose();
  });

  it("keeps role=combobox on a non-native render target, and reflects disabled", async () => {
    const nonNative = mountHarness({
      triggerAs: "div",
      triggerProps: { nativeButton: false },
    });
    const trigger = triggerOf(nonNative.container);
    // `createButton` would say `role="button"`; this element *is* the combobox, whatever tag it is.
    expect(trigger.getAttribute("role")).toBe("combobox");
    expect(trigger.getAttribute("tabindex")).toBe("0");
    expect(trigger.hasAttribute("type")).toBe(false);

    // …and the keymap still reaches it: `createButton` composes the same chain on any element.
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(contentOf(nonNative.container)).toBeTruthy());
    nonNative.dispose();

    const disabled = mountHarness({ options: { disabled: true } });
    expect(triggerOf(disabled.container).hasAttribute("disabled")).toBe(true);
    expect(triggerOf(disabled.container).hasAttribute("data-disabled")).toBe(true);
    disabled.dispose();
  });

  it("has no accessibility violations, closed and open", async () => {
    const closed = mountHarness();
    await expectNoA11yViolations(closed.container);
    closed.dispose();

    const open = mountHarness({ options: { defaultOpen: true } });
    await vi.waitFor(() => expect(open.state().floating.isPositioned()).toBe(true));
    await expectNoA11yViolations(open.container, {
      // Not a markup problem: axe cannot decide `aria-valid-attr-value` for ANY element that
      // carries both `aria-haspopup` and `aria-controls` — it never resolves the IDREF, because a
      // popup may be added on demand. The closed assertion above runs strict, and the
      // "aria-controls names the popup only while open" test pins the IDREF itself.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    open.dispose();
  });
});
