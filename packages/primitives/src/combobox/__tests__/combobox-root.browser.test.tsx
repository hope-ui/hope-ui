import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
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
  nextFrame,
  nth,
  optionsOf,
  selectedLabels,
  triggerOf,
} from "./combobox-harness";

// A browser test, like the rest of the family: `createCombobox` drives `requestAnimationFrame`,
// `getComputedStyle` and a real layout measurement, none of which exist in the node environment.

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

/** The popup is `visibility: hidden` until the first measurement lands, and so the highlight-placing
 *  effect is gated on the same signal. */
async function waitForPositioned(state: () => CreateComboboxReturn<string, SelectionMode>) {
  await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
}

describe("createCombobox", () => {
  it("mounts nothing until open, and composes the listbox in activedescendant mode", async () => {
    const { container, state, dispose } = mountHarness();

    // Nothing renders until open: tabbing a form with ten Selects must not mount ten option lists.
    // Only affordable because the options are data, not elements…
    expect(contentOf(container)).toBeNull();
    expect(optionsOf(container)).toHaveLength(0);
    // …which is also why the option set exists while closed, for closed-trigger typeahead to read.
    expect(state().list.focus.items()).toHaveLength(FRUITS.length);
    expect(state().list.focusMode()).toBe("activedescendant");

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeTruthy());
    expect(optionsOf(container)).toHaveLength(FRUITS.length);
    dispose();
  });

  it("honors a controlled open state and reports every request through onOpenChange", async () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn((next: boolean) => setOpen(next));
    const { container, dispose } = mountHarness({
      options: {
        get open() {
          return open();
        },
        onOpenChange,
      },
    });

    await userEvent.click(page.getByTestId("trigger"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await vi.waitFor(() => expect(contentOf(container)).toBeTruthy());

    await userEvent.click(page.getByTestId("trigger"));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    dispose();
  });

  it("refuses to open an empty collection unless allowsEmptyCollection", async () => {
    // Answerable only because the options are data: a source registered from mounted DOM elements is
    // *always* empty before opening, so this guard could never have been written against one.
    const onOpenChange = vi.fn();
    const guarded = mountHarness({ values: [], options: { onOpenChange } });
    await userEvent.click(page.getByTestId("trigger"));
    await nextFrame();
    expect(contentOf(guarded.container)).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    guarded.dispose();

    const allowed = mountHarness({ values: [], options: { allowsEmptyCollection: true } });
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(allowed.container)).toBeTruthy());
    allowed.dispose();
  });

  it("hands the consumer a SCALAR value in single mode, and an array in multiple", async () => {
    const single = vi.fn();
    const one = mountHarness({ options: { onChange: single } });
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(one.container)).toBeTruthy());
    await userEvent.click(nth(optionsOf(one.container), 1));

    // A single Select must not hand back `["Banana"]`…
    expect(single).toHaveBeenCalledWith("Banana");
    expect(one.state().value()).toBe("Banana");
    // …while the listbox underneath keeps its plain `V[]` untouched.
    expect(one.state().list.value()).toEqual(["Banana"]);
    one.dispose();

    const multiple = vi.fn();
    const many = mountHarness({
      options: { selectionMode: "multiple", onChange: multiple },
    });
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(many.container)).toBeTruthy());
    await userEvent.click(nth(optionsOf(many.container), 0));
    await userEvent.click(nth(optionsOf(many.container), 2));

    expect(multiple).toHaveBeenLastCalledWith(["Apple", "Cherry"]);
    expect(many.state().value()).toEqual(["Apple", "Cherry"]);
    many.dispose();
  });

  it("adapts a controlled scalar value in, and reads null as nothing selected", async () => {
    const [fruit, setFruit] = createSignal<string | null>("Cherry");
    const { container, state, dispose } = mountHarness({
      options: {
        defaultOpen: true,
        get value() {
          return fruit();
        },
      },
    });
    await waitForPositioned(state);

    expect(selectedLabels(container)).toEqual(["Cherry"]);

    flush(() => setFruit(null));
    expect(selectedLabels(container)).toEqual([]);
    expect(state().value()).toBeNull();
    dispose();
  });

  it("closes on select in single mode, stays open in multiple, and obeys an explicit override", async () => {
    const closing = mountHarness();
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(closing.container)).toBeTruthy());
    await userEvent.click(nth(optionsOf(closing.container), 1));
    await vi.waitFor(() => expect(contentOf(closing.container)).toBeNull());
    closing.dispose();

    const staying = mountHarness({ options: { selectionMode: "multiple" } });
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(staying.container)).toBeTruthy());
    await userEvent.click(nth(optionsOf(staying.container), 1));
    await nextFrame();
    expect(contentOf(staying.container)).toBeTruthy();
    staying.dispose();

    const pinned = mountHarness({ options: { shouldCloseOnSelect: false } });
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(pinned.container)).toBeTruthy());
    await userEvent.click(nth(optionsOf(pinned.container), 1));
    await nextFrame();
    expect(contentOf(pinned.container)).toBeTruthy();
    expect(selectedLabels(pinned.container)).toEqual(["Banana"]);
    pinned.dispose();
  });

  it("re-selecting the option that is already selected still closes the popup", async () => {
    // `createControllableState` notifies on every *request*, not only on a changed value — which is
    // what makes wrapping `onChange` a reliable place to hang close-on-select.
    const { container, dispose } = mountHarness({ options: { defaultValue: "Banana" } });

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeTruthy());
    await userEvent.click(nth(optionsOf(container), 1));
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    dispose();
  });

  it("applies the entry strategy once the popup is positioned — selected, first, last", async () => {
    const selected = mountHarness({ options: { defaultValue: "Cherry" } });
    await userEvent.click(page.getByTestId("trigger"));
    await waitForPositioned(selected.state);
    // A pointer open lands on the selected option, not on the first.
    expect(activeLabel(selected.container)).toBe("Cherry");
    selected.dispose();

    const first = mountHarness({ options: { defaultValue: "Cherry" } });
    triggerOf(first.container).focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitForPositioned(first.state);
    expect(activeLabel(first.container)).toBe("Apple");
    first.dispose();

    const last = mountHarness({ options: { defaultValue: "Cherry" } });
    triggerOf(last.container).focus();
    await userEvent.keyboard("{ArrowUp}");
    await waitForPositioned(last.state);
    expect(activeLabel(last.container)).toBe("Açaí");
    last.dispose();
  });

  it("drops the highlight on close, so reopening applies its own strategy", async () => {
    const { container, state, dispose } = mountHarness();
    triggerOf(container).focus();

    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await waitForPositioned(state);
    expect(activeLabel(container)).toBe("Banana");

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    expect(state().list.focus.activeIndex()).toBe(-1);
    dispose();
  });

  it("TYPEAHEAD WHILE CLOSED SELECTS, without ever opening the popup", async () => {
    // Native `<select>` behavior: with the popup shut there is no row to highlight, so a typeahead
    // match selects outright. Possible only because the options exist as data while closed.
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    const { container, state, dispose } = mountHarness({ options: { onChange, onOpenChange } });

    triggerOf(container).focus();
    await userEvent.keyboard("b");

    expect(onChange).toHaveBeenCalledWith("Banana");
    expect(state().value()).toBe("Banana");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(contentOf(container)).toBeNull();
    dispose();
  });

  it("closed typeahead folds diacritics — `acai` matches `Açaí`", async () => {
    // Typeahead compares with `Intl.Collator`'s `sensitivity: "base"`, which folds diacritics *and*
    // case — `toLowerCase()` folds only case.
    const { container, state, dispose } = mountHarness();
    triggerOf(container).focus();

    await userEvent.keyboard("acai");
    expect(state().value()).toBe("Açaí");
    expect(contentOf(container)).toBeNull();
    dispose();
  });

  it("closed typeahead only HIGHLIGHTS in multiple mode", async () => {
    // Toggling per keystroke would make a repeated letter select and immediately deselect, so
    // multiple mode only moves the highlight and applies it on the next open.
    const { container, state, dispose } = mountHarness({
      options: { selectionMode: "multiple" },
    });
    triggerOf(container).focus();

    await userEvent.keyboard("c");
    expect(state().value()).toEqual([]);
    expect(state().list.focus.activeIndex()).toBe(2);
    // …with no dangling IDREF: the option it would name is not mounted while the popup is closed.
    expect(triggerOf(container).hasAttribute("aria-activedescendant")).toBe(false);
    dispose();
  });

  it("locks scroll and hides outside content only when modal", async () => {
    const outside = document.createElement("div");
    outside.textContent = "outside";
    document.body.append(outside);

    const modal = mountHarness({ options: { defaultOpen: true } });
    await waitForPositioned(modal.state);
    expect(document.body.style.overflow).toBe("hidden");
    expect(outside.hasAttribute("inert")).toBe(true);
    expect(outside.getAttribute("aria-hidden")).toBe("true");
    // The trigger is exempt from both, or it would lose focus, the pointer, and toggle-to-close.
    expect(triggerOf(modal.container).hasAttribute("inert")).toBe(false);
    modal.dispose();

    // …and unmounting puts the page back, rather than leaving it locked and inert.
    expect(document.body.style.overflow).toBe("");
    expect(outside.hasAttribute("inert")).toBe(false);

    const plain = mountHarness({ options: { defaultOpen: true, modal: false } });
    await waitForPositioned(plain.state);
    expect(document.body.style.overflow).toBe("");
    expect(outside.hasAttribute("inert")).toBe(false);
    plain.dispose();

    outside.remove();
  });

  it("has no accessibility violations, closed and open", async () => {
    const closed = mountHarness();
    await expectNoA11yViolations(closed.container);
    closed.dispose();

    const open = mountHarness({ options: { defaultOpen: true } });
    // After the first measurement, deliberately: axe would otherwise inspect the pre-positioned
    // `visibility: hidden` intermediate and return an `incomplete` nobody can act on.
    await waitForPositioned(open.state);
    await expectNoA11yViolations(open.container, {
      // Not a markup problem: axe cannot decide `aria-valid-attr-value` for ANY element that
      // carries both `aria-haspopup` and `aria-controls` — it never resolves the IDREF, because a
      // popup may be added on demand. The IDREF itself is pinned in
      // `combobox-trigger.browser.test.tsx`.
      allowIncomplete: ["aria-valid-attr-value"],
    });
    open.dispose();
  });
});
