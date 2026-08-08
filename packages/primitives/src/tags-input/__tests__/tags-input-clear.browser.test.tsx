import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  chipLabels,
  chips,
  clearButton,
  FRUITS,
  field,
  NO_TAGS,
  nth,
  TagsInputRow,
  typeInto,
} from "./tags-input-harness";

describe("createTagsInputClear — the button", () => {
  it("announces the localized clear label and stays out of the tab order", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS }} withClear />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const button = clearButton(container);
    // A glyph-only button has no accessible name of its own (axe `button-name`), so the label is not
    // optional. `D12` wrote these strings rather than porting React Aria's.
    expect(button.getAttribute("aria-label")).toBe("Clear all tags");
    expect(button.getAttribute("type")).toBe("button");
    // `D2`: the field is the widget's single tab stop, so Tab crosses the whole control in one press.
    expect(button.getAttribute("tabindex")).toBe("-1");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("forwards the native attributes it does not own, and composes onClick in front of its own", async () => {
    const onClick = vi.fn();
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS }}
        withClear
        clearProps={{ id: "wipe", title: "clear", class: "clear-class", onClick }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const button = clearButton(container);
    expect(button.getAttribute("id")).toBe("wipe");
    expect(button.getAttribute("title")).toBe("clear");
    expect(button.classList.contains("clear-class")).toBe(true);

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(0));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputClear — clearing", () => {
  it("removes every tag and leaves focus in the field", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS }} withClear />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await userEvent.click(clearButton(container));

    await vi.waitFor(() => expect(chips(container)).toHaveLength(0));
    // `D10`'s pointer ordering: the field is where typing continues, and clearing the active index
    // before the mutation is what stops the re-homing effect from yanking focus onto a survivor.
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("keeps disabled tags, which are not individually removable either", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS, isItemDisabled: (tag) => tag === "Banana" }}
        withClear
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await userEvent.click(clearButton(container));

    // A Clear that took them would be the one way to delete a tag the widget says cannot be deleted.
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Banana"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves the draft text alone — the consumer's onClick is the seam for that", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS }} withClear />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    typeInto(field(container), "Date");
    await userEvent.click(clearButton(container));

    await vi.waitFor(() => expect(chips(container)).toHaveLength(0));
    expect(field(container).value).toBe("Date");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("never lets the press move DOM focus onto the button itself", async () => {
    // `pointerdown` is cancelled, so the press never lands on a button that is about to become
    // disabled and the browser never drops focus to `<body>` for a frame.
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS }} withClear />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    field(container).focus();
    const button = clearButton(container);
    let focusedDuringPress: Element | null = null;
    button.addEventListener("pointerup", () => {
      focusedDuringPress = document.activeElement;
    });

    await userEvent.click(button);

    expect(focusedDuringPress).toBe(field(container));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(0));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputClear — when there is nothing to clear", () => {
  it("is disabled on an empty tag list", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS }} withClear />
    ));

    expect(clearButton(container).disabled).toBe(true);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("is disabled when every remaining tag is disabled", async () => {
    // "Nothing to clear" is about *removable* tags, not about the list being empty.
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, isItemDisabled: () => true }} withClear />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    expect(clearButton(container).disabled).toBe(true);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("becomes disabled once the last removable tag is gone", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS }} withClear />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const button = clearButton(container);
    expect(button.disabled).toBe(false);

    await userEvent.click(button);
    await vi.waitFor(() => expect(button.disabled).toBe(true));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("is disabled while the widget is disabled or read-only", async () => {
    const { container, dispose } = mount(() => (
      <>
        <TagsInputRow options={{ defaultValue: FRUITS, disabled: true }} withClear />
        <TagsInputRow options={{ defaultValue: FRUITS, readOnly: true }} withClear />
      </>
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(6));

    const buttons = [...container.querySelectorAll<HTMLButtonElement>('[data-testid="clear"]')];
    expect(nth(buttons, 0).disabled).toBe(true);
    expect(nth(buttons, 1).disabled).toBe(true);

    await expectNoA11yViolations(container);
    dispose();
  });
});
