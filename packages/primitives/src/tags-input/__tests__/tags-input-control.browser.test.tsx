import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  chips,
  control,
  deleteButtons,
  FRUITS,
  field,
  nth,
  TagsInputRow,
} from "./tags-input-harness";

/**
 * A press that lands on the element it is dispatched on. Real hit testing is the browser's job; what
 * this hook decides is what to do once a press has a target, so the target is set explicitly.
 * Returns whether the shell claimed the press.
 */
function pressOn(element: Element): boolean {
  const event = new PointerEvent("pointerdown", { bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event.defaultPrevented;
}

describe("createTagsInputControl — click anywhere focuses the field", () => {
  it("claims a press that lands on the shell itself and focuses the field", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    // The shell is padding around a field narrower than it: without this, a click on that padding
    // lands on a `<div>` and focus goes nowhere.
    expect(pressOn(control(container))).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves a press in the field alone, so the caret lands where the user aimed", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    // Cancelling this press would move the caret to the end of whatever the user just clicked into.
    expect(pressOn(field(container))).toBe(false);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("does not steal a real click on a chip's ✕", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const cherry = nth(chips(container), 2);
    cherry.focus();
    await vi.waitFor(() => expect(document.activeElement).toBe(cherry));

    let focusedDuringPress: Element | null = null;
    const button = nth(deleteButtons(container), 0);
    button.addEventListener("pointerup", () => {
      focusedDuringPress = document.activeElement;
    });

    await userEvent.click(button);

    // The ✕ cancels its own `pointerdown` to keep focus where it was; the shell must not undo that by
    // dragging focus into the field mid-press. `D10`'s own re-focus still runs afterwards, off `click`.
    expect(focusedDuringPress).toBe(cherry);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(2));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("does not steal a real click on a chip", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await userEvent.click(nth(chips(container), 1));

    // `D2` makes a chip pointer-focusable, which is why the bail matches `[tabindex]` unqualified
    // where Base UI writes `[tabindex]:not([tabindex="-1"])` — the narrower selector would pull focus
    // straight back out of the chip the user just clicked.
    await vi.waitFor(() => expect(document.activeElement).toBe(nth(chips(container), 1)));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputControl — the disabled and read-only splits", () => {
  it("cancels the press but focuses nothing while disabled", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, disabled: true }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    expect(pressOn(control(container))).toBe(true);
    expect(document.activeElement).not.toBe(field(container));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("still focuses the field while read-only", async () => {
    // A deliberate divergence from Base UI's `handleInputPress`, which returns early on `readOnly`. A
    // read-only field is focusable and its text selectable by definition — that is the whole
    // difference from `disabled` — and there is no popup here for the press to have opened.
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, readOnly: true }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    expect(pressOn(control(container))).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputControl — state and props", () => {
  it("emits the widget's data-* state", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, readOnly: true, invalid: true }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const shell = control(container);
    expect(shell.hasAttribute("data-disabled")).toBe(false);
    expect(shell.getAttribute("data-readonly")).toBe("");
    expect(shell.getAttribute("data-invalid")).toBe("");
    expect(shell.hasAttribute("data-focus")).toBe(false);

    field(container).focus();
    // The widget's flag, not this element's `:focus-within` — it survives the frame in which a chip
    // is destroyed and focus is re-homed, so the ring does not blink on every removal.
    await vi.waitFor(() => expect(shell.getAttribute("data-focus")).toBe(""));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("forwards the native attributes it does not own onto the shell", async () => {
    // The `omit` list is hand-kept, so a renamed control prop can quietly start swallowing a
    // consumer's attributes with a green typecheck and a green suite. Assert them **on the element**.
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS }}
        controlProps={{
          id: "shell",
          title: "the control",
          class: "shell-class",
          style: { color: "rgb(4, 5, 6)" },
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const shell = control(container);
    expect(shell.getAttribute("id")).toBe("shell");
    expect(shell.getAttribute("title")).toBe("the control");
    expect(shell.classList.contains("shell-class")).toBe(true);
    expect(shell.style.color).toBe("rgb(4, 5, 6)");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("composes a consumer's onPointerDown in front of its own, so preventDefault cancels it", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS }}
        controlProps={{ onPointerDown: (event) => event.preventDefault() }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    pressOn(control(container));
    expect(document.activeElement).not.toBe(field(container));

    await expectNoA11yViolations(container);
    dispose();
  });
});
