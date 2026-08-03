import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
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
  listOf,
  nextFrame,
  nth,
  optionsOf,
  triggerOf,
} from "./combobox-harness";

/** Short enough that most of the options are out of view — the clipped case scroll-into-view is for. */
const CLIPPED_LIST: JSX.CSSProperties = { height: "40px", "overflow-y": "auto" };

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

async function openHarness(props: Partial<ComboboxHarnessProps<string>> = {}) {
  const harness = mountHarness({ ...props, options: { defaultOpen: true, ...props.options } });
  await vi.waitFor(() => expect(harness.state().floating.isPositioned()).toBe(true));
  return harness;
}

describe("createComboboxList", () => {
  it("is the listbox: role, orientation, and multiselectable only when it is", async () => {
    const single = await openHarness();
    const list = listOf(single.container) as HTMLElement;
    expect(list.getAttribute("role")).toBe("listbox");
    expect(list.getAttribute("aria-orientation")).toBe("vertical");
    expect(list.hasAttribute("aria-multiselectable")).toBe(false);
    single.dispose();

    const multiple = await openHarness({ options: { selectionMode: "multiple" } });
    expect(listOf(multiple.container)?.getAttribute("aria-multiselectable")).toBe("true");
    multiple.dispose();
  });

  it("carries NONE of `rootProps`' focus-owner props", async () => {
    // `state.list.rootProps` is the standalone binding, where the container *is* the focus owner.
    // Spreading it here would add a second tab stop inside a popup only reachable because the
    // trigger kept focus, a second competing keymap, and a second `aria-activedescendant`.
    const { container, state, dispose } = await openHarness();
    const list = listOf(container) as HTMLElement;

    expect(list.hasAttribute("tabindex")).toBe(false);
    expect(list.hasAttribute("aria-activedescendant")).toBe(false);
    // The attribute belongs on the element that actually holds DOM focus.
    expect(triggerOf(container).hasAttribute("aria-activedescendant")).toBe(true);

    // A keydown that reaches the list directly moves nothing — there is no second keymap on it.
    const before = state().list.focus.activeIndex();
    list.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: false }));
    await nextFrame();
    expect(state().list.focus.activeIndex()).toBe(before);
    dispose();
  });

  it("is what aria-controls names, with a consumer id published up", async () => {
    const generated = await openHarness();
    const list = listOf(generated.container) as HTMLElement;
    expect(list.id).toBe(generated.state().popupId());
    expect(triggerOf(generated.container).getAttribute("aria-controls")).toBe(list.id);
    generated.dispose();

    const custom = await openHarness({ listProps: { id: "fruit-listbox" } });
    expect(listOf(custom.container)?.id).toBe("fruit-listbox");
    await vi.waitFor(() =>
      expect(triggerOf(custom.container).getAttribute("aria-controls")).toBe("fruit-listbox"),
    );
    expect(custom.state().popupId()).toBe("fruit-listbox");
    custom.dispose();
  });

  it("is labelled by the trigger, and a consumer's own aria-labelledby wins", async () => {
    // `role="listbox"` with no accessible name is an axe `aria-input-field-name` violation, and
    // there is no Label part — so it borrows the name of the element the popup belongs to.
    const fallback = await openHarness();
    expect(listOf(fallback.container)?.getAttribute("aria-labelledby")).toBe(
      triggerOf(fallback.container).id,
    );
    fallback.dispose();

    const custom = await openHarness({ listProps: { "aria-labelledby": "outer-label" } });
    expect(listOf(custom.container)?.getAttribute("aria-labelledby")).toBe("outer-label");
    custom.dispose();
  });

  it("SCROLLS a mounted-but-clipped option into view when the highlight reaches it", async () => {
    // Nothing moves DOM focus in activedescendant mode, so nothing scrolls a clipped row into view
    // unless the option source is asked to explicitly. Moving focus per option would have hidden it.
    const { container, state, dispose } = await openHarness({ listProps: { style: CLIPPED_LIST } });
    const list = listOf(container) as HTMLElement;
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);

    triggerOf(container).focus();
    await userEvent.keyboard("{End}");
    expect(activeLabel(container)).toBe("Açaí");
    await vi.waitFor(() => expect(list.scrollTop).toBeGreaterThan(0));

    await userEvent.keyboard("{Home}");
    await vi.waitFor(() => expect(list.scrollTop).toBe(0));
    expect(state().list.focus.activeIndex()).toBe(0);
    dispose();
  });

  it("does NOT scroll when the pointer moves the highlight", async () => {
    // The row is already under the cursor, so scrolling to it would slide the list and hand the
    // highlight to whatever ends up beneath the pointer.
    const { container, state, dispose } = await openHarness({ listProps: { style: CLIPPED_LIST } });
    const list = listOf(container) as HTMLElement;
    expect(list.scrollTop).toBe(0);

    nth(optionsOf(container), 4).dispatchEvent(
      new PointerEvent("pointermove", { bubbles: true, clientX: 7, clientY: 9 }),
    );
    await nextFrame();

    expect(state().list.focus.activeIndex()).toBe(4);
    expect(list.scrollTop).toBe(0);
    dispose();
  });

  it("keeps DOM focus on the trigger when the list is pressed", async () => {
    // Options carry `tabindex="-1"`, which still makes them click-focusable, so a mousedown that
    // ran its default would blur the trigger — dropping the highlight's paint gate and handing DOM
    // focus to an element the pattern says never has it.
    const { container, dispose } = await openHarness({ options: { selectionMode: "multiple" } });
    triggerOf(container).focus();

    await userEvent.click(nth(optionsOf(container), 2));
    expect(document.activeElement).toBe(triggerOf(container));

    const list = listOf(container) as HTMLElement;
    const mousedown = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    list.dispatchEvent(mousedown);
    expect(mousedown.defaultPrevented).toBe(true);
    dispose();
  });

  it("lets the consumer's own mousedown cancel the focus guard", async () => {
    const onMouseDown = vi.fn((event: MouseEvent) => event.preventDefault());
    const { container, dispose } = await openHarness({ listProps: { onMouseDown } });

    listOf(container)?.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    expect(onMouseDown).toHaveBeenCalledOnce();
    dispose();
  });

  it("forwards the consumer's own attributes", async () => {
    const { container, dispose } = await openHarness({
      listProps: { title: "kept", lang: "fr" },
    });
    const list = listOf(container) as HTMLElement;

    expect(list.getAttribute("title")).toBe("kept");
    expect(list.getAttribute("lang")).toBe("fr");

    dispose();
  });

  it("registers itself as the scroll container, and clears it when the popup closes", async () => {
    const { container, state, dispose } = mountHarness();
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(listOf(container)).toBeTruthy());

    // The list, not the content and not the trigger, is what `scrollIndexIntoView` scrolls.
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    // Reopening re-registers the scroll container, so a second session scrolls too.
    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(state().floating.isPositioned()).toBe(true));
    triggerOf(container).focus();
    await userEvent.keyboard("{End}");
    expect(activeLabel(container)).toBe("Açaí");
    dispose();
  });

  it("has no accessibility violations while open", async () => {
    const { container, dispose } = await openHarness();
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
