import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { CreateTagsInputReturn } from "../index";
import {
  activeLabels,
  chipLabels,
  chips,
  FRUITS,
  field,
  focusedChipLabel,
  nth,
  pressWithRepeat,
  TagsInputRow,
} from "./tags-input-harness";

/** Focus a chip the way a pointer would, and wait for the active index to catch up. */
async function focusChip(container: HTMLElement, index: number): Promise<HTMLElement> {
  const chip = nth(chips(container), index);
  chip.focus();
  await vi.waitFor(() => expect(document.activeElement).toBe(chip));
  return chip;
}

/** Dispatch a cancelable keydown and report whether the hook consumed it. */
function pressAndReadDefault(element: HTMLElement, key: string): boolean {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event.defaultPrevented;
}

describe("createTagsInputItem — attributes", () => {
  it("emits role=group named from its own text, plus the data-* state", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, isItemDisabled: (tag) => tag === "Cherry" }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const apple = nth(chips(container), 0);
    const cherry = nth(chips(container), 2);

    expect(apple.getAttribute("role")).toBe("group");
    expect(apple.getAttribute("aria-label")).toBe("Apple");
    expect(apple.hasAttribute("data-active")).toBe(false);
    expect(apple.hasAttribute("data-disabled")).toBe(false);
    expect(apple.hasAttribute("data-duplicate")).toBe(false);

    expect(cherry.getAttribute("aria-disabled")).toBe("true");
    expect(cherry.hasAttribute("data-disabled")).toBe(true);

    await focusChip(container, 0);
    await vi.waitFor(() => expect(activeLabels(container)).toEqual(["Apple"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("names itself from itemToLabel when the tag is not its own text", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{
          defaultValue: ["a@example.com"],
          itemToLabel: (tag) => tag.split("@")[0] as string,
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(1));

    expect(nth(chips(container), 0).getAttribute("aria-label")).toBe("a");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("drops the highlight when the widget loses focus, and paints it again on return", async () => {
    const { container, dispose } = mount(() => (
      <>
        <TagsInputRow options={{ defaultValue: FRUITS }} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </>
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 1);
    await vi.waitFor(() => expect(activeLabels(container)).toEqual(["Banana"]));

    (container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    // The chip stays the *active* one; what it stops being is the *painted* one, because
    // `data-active` is gated on the widget holding focus.
    await vi.waitFor(() => expect(activeLabels(container)).toEqual([]));

    await focusChip(container, 1);
    await vi.waitFor(() => expect(activeLabels(container)).toEqual(["Banana"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("marks the chip a rejected duplicate collided with", async () => {
    let state!: CreateTagsInputReturn<string>;
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS }} onReady={(s) => (state = s)} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    state.add("Banana");
    await vi.waitFor(() =>
      expect(nth(chips(container), 1).hasAttribute("data-duplicate")).toBe(true),
    );
    expect(nth(chips(container), 0).hasAttribute("data-duplicate")).toBe(false);

    state.clearDuplicate();
    await vi.waitFor(() =>
      expect(nth(chips(container), 1).hasAttribute("data-duplicate")).toBe(false),
    );

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputItem — D2, the single tab stop", () => {
  it("keeps every chip at tabindex=-1 and never consults the roving tab index", async () => {
    let tabIndexSpy!: ReturnType<typeof vi.spyOn>;
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS }}
        onReady={(state) => {
          // Installed before any chip renders: the item hook reads `state.focus` off this same
          // object, so a single call from anywhere in the family shows up here.
          tabIndexSpy = vi.spyOn(state.focus, "getItemTabIndex");
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const tabIndexes = () => chips(container).map((chip) => chip.getAttribute("tabindex"));
    expect(tabIndexes()).toEqual(["-1", "-1", "-1"]);

    await focusChip(container, 0);
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Banana"));

    // Still `-1` everywhere *after* navigation: a roving tab stop would have handed one chip a `0`
    // by now, and Tab would take one press per tag to cross the control.
    expect(tabIndexes()).toEqual(["-1", "-1", "-1"]);
    expect(tabIndexSpy).not.toHaveBeenCalled();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("ignores a consumer's tabindex rather than putting a chip in the tab order", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS }} itemProps={{ tabindex: 0 }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    expect(chips(container).map((chip) => chip.getAttribute("tabindex"))).toEqual([
      "-1",
      "-1",
      "-1",
    ]);
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputItem — arrow navigation", () => {
  it("moves between chips with ArrowLeft/ArrowRight in LTR", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 0);
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Banana"));

    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));

    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Banana"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("swaps Left/Right under RTL", async () => {
    const { container, dispose } = mount(() => (
      // `dir` on the wrapper too, so the keymap and the layout agree and the dev warning stays quiet.
      <TagsInputRow options={{ defaultValue: FRUITS, dir: "rtl" }} dir="rtl" />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 0);
    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Banana"));

    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Apple"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("returns to the text field past either end instead of wrapping", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 2);
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await focusChip(container, 0);
    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("jumps to the first and last chip with Home/End, in either direction", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, dir: "rtl" }} dir="rtl" />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 1);
    await userEvent.keyboard("{End}");
    // Home/End are logical, not directional, so RTL does not swap them.
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));

    await userEvent.keyboard("{Home}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Apple"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("skips disabled chips", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, isItemDisabled: (tag) => tag === "Banana" }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 0);
    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputItem — removal and the D10 keyboard path", () => {
  it("removes the focused chip on Backspace and hands focus to the survivor", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 1);
    await userEvent.keyboard("{Backspace}");

    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple", "Cherry"]));
    // Inherited from `createListFocus`'s re-homing, not re-derived here: the chip that slid into the
    // removed one's place takes focus, so the row is still keyboard-navigable.
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("removes the focused chip on Delete too", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 2);
    await userEvent.keyboard("{Delete}");

    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple", "Banana"]));
    // Nothing after it survived, so the walk falls back to the neighbor before it.
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Banana"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("keeps removing while the key auto-repeats", async () => {
    // A guard on `event.repeat` would break holding Backspace to clear a row, and would break it
    // silently — every single-press test above still passes.
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const first = await focusChip(container, 0);
    pressWithRepeat(first, "Delete");
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Banana", "Cherry"]));
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Banana"));

    pressWithRepeat(document.activeElement as HTMLElement, "Delete");
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Cherry"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("sends focus to the text field when the removed chip was the last one", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: ["Apple"] }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(1));

    await focusChip(container, 0);
    await userEvent.keyboard("{Backspace}");

    await vi.waitFor(() => expect(chips(container)).toHaveLength(0));
    // With no survivor, `createListFocus` has nowhere to re-home and the browser would drop focus to
    // `<body>` — so the field is peeked for before the removal and focused after it.
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("sends focus to the text field when only disabled chips would survive", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: ["Apple", "Banana"], isItemDisabled: (tag) => tag === "Banana" }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(2));

    await focusChip(container, 0);
    await userEvent.keyboard("{Delete}");

    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Banana"]));
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("refuses to remove a disabled chip", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, isItemDisabled: (tag) => tag === "Banana" }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const banana = await focusChip(container, 1);
    await userEvent.keyboard("{Delete}");
    await userEvent.keyboard("{Backspace}");

    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);
    expect(document.activeElement).toBe(banana);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("refuses to remove while the widget is read-only", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, readOnly: true }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 0);
    await userEvent.keyboard("{Delete}");

    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputItem — returning to the text field", () => {
  it("returns focus on Enter, and consumes the key so no form submits", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const apple = await focusChip(container, 0);
    expect(pressAndReadDefault(apple, "Enter")).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("returns focus on Escape but lets the key travel to an enclosing layer", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const apple = await focusChip(container, 0);
    // Escape has one meaning across the whole widget — it must still reach an enclosing Dialog —
    // so the chip returns focus *without* claiming the key.
    expect(pressAndReadDefault(apple, "Escape")).toBe(false);
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("hands a printable key back to the field, which types it", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await focusChip(container, 0);
    await userEvent.keyboard("d");

    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));
    // Focus moves during `keydown` and the key is not consumed, so the browser dispatches the text
    // insertion to the field — the character is not lost.
    await vi.waitFor(() => expect(field(container).value).toBe("d"));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputItem — props", () => {
  it("forwards the native attributes it does not own onto the chip element", async () => {
    // The `omit` list is hand-kept, so a renamed control prop can quietly start swallowing a
    // consumer's attributes with a green typecheck and a green suite. Assert them **on the element**.
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: ["Apple"] }}
        itemProps={{
          title: "a chip",
          class: "chip-class",
          style: { color: "rgb(4, 5, 6)" },
          "aria-roledescription": "tag",
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(1));

    const chip = nth(chips(container), 0);
    expect(chip.getAttribute("title")).toBe("a chip");
    expect(chip.classList.contains("chip-class")).toBe(true);
    expect(chip.style.color).toBe("rgb(4, 5, 6)");
    expect(chip.getAttribute("aria-roledescription")).toBe("tag");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("lets a consumer's aria-label and id win, and composes their key handler in front", async () => {
    const onKeyDown = vi.fn();
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: ["Apple"] }}
        itemProps={{ id: "my-chip", "aria-label": "Apple, a fruit", onKeyDown }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(1));

    const chip = nth(chips(container), 0);
    expect(chip.getAttribute("id")).toBe("my-chip");
    expect(chip.getAttribute("aria-label")).toBe("Apple, a fruit");

    chip.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onKeyDown).toHaveBeenCalled();

    await expectNoA11yViolations(container);
    dispose();
  });
});
