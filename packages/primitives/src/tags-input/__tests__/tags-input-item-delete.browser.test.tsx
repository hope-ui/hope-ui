import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  chipLabels,
  chips,
  deleteButtons,
  FRUITS,
  field,
  focusedChipLabel,
  nth,
  TagsInputRow,
} from "./tags-input-harness";

describe("createTagsInputItemDelete — the D1 name", () => {
  it("computes an accessible name of 'Remove <tag>' from the two-id pair", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    // Read off the accessibility tree — the browser's own name computation resolving
    // `aria-labelledby="<own id> <text id>"` — rather than reconstructed from the two ids. The
    // self-reference is not followed recursively, so it falls through to this button's `aria-label`
    // ("Remove") and the second id contributes the chip's text ("Apple").
    await expect
      .element(page.getByRole("button", { name: "Remove Apple", exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Remove Banana", exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Remove Cherry", exact: true }))
      .toBeInTheDocument();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("localizes only the verb, so nothing is interpolated or pluralized", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: ["Apple"] }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(1));

    const button = nth(deleteButtons(container), 0);
    expect(button.getAttribute("aria-label")).toBe("Remove");
    expect(button.getAttribute("aria-labelledby")).toBe(
      `${button.id} ${nth(chips(container), 0).querySelector("span")?.id}`,
    );

    await expectNoA11yViolations(container);
    dispose();
  });

  it("stays out of the tab order and renders a real button", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    for (const button of deleteButtons(container)) {
      // `D2`: the text field is the widget's single tab stop.
      expect(button.getAttribute("tabindex")).toBe("-1");
      expect(button.tagName).toBe("BUTTON");
      // Never `type="submit"` — a chip's ✕ inside a form must not submit it.
      expect(button.getAttribute("type")).toBe("button");
    }

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputItemDelete — the D10 pointer path", () => {
  it("removes the tag and leaves focus in the text field, yanking nothing", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    field(container).focus();
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await userEvent.click(nth(deleteButtons(container), 0));

    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Banana", "Cherry"]));
    // The opposite of the keyboard path: clearing the active index first makes the re-homing effect
    // return early, so no surviving chip steals focus while the user expects to keep typing.
    expect(focusedChipLabel(container)).toBeNull();
    expect(document.activeElement).toBe(field(container));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("brings focus back from a chip to the field when its neighbour's ✕ is clicked", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    nth(chips(container), 2).focus();
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));

    await userEvent.click(nth(deleteButtons(container), 0));

    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Banana", "Cherry"]));
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("never lets the press move DOM focus onto the button itself", async () => {
    // `pointerdown` is cancelled, so the button that is about to be destroyed never holds focus and
    // the browser never drops focus to `<body>` for a frame.
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    field(container).focus();
    const button = nth(deleteButtons(container), 1);
    let focusedDuringPress: Element | null = null;
    button.addEventListener("pointerup", () => {
      focusedDuringPress = document.activeElement;
    });

    await userEvent.click(button);

    expect(focusedDuringPress).toBe(field(container));
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple", "Cherry"]));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputItemDelete — disabled", () => {
  it("disables the ✕ of a disabled chip and removes nothing when it is clicked", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, isItemDisabled: (tag) => tag === "Banana" }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const buttons = deleteButtons(container);
    expect(nth(buttons, 0).disabled).toBe(false);
    expect(nth(buttons, 1).disabled).toBe(true);
    expect(nth(buttons, 1).hasAttribute("data-disabled")).toBe(true);

    nth(buttons, 1).click();
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("disables every ✕ while the widget is read-only", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, readOnly: true }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    expect(deleteButtons(container).map((button) => button.disabled)).toEqual([true, true, true]);

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputItemDelete — props", () => {
  it("forwards the native attributes it does not own onto the button", async () => {
    // The `omit` list is hand-kept, so a renamed control prop can quietly start swallowing a
    // consumer's attributes with a green typecheck and a green suite. Assert them **on the element**.
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: ["Apple"] }}
        deleteProps={{
          title: "remove it",
          class: "delete-class",
          style: { color: "rgb(9, 8, 7)" },
          "data-testid": "chip-delete",
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(1));

    const button = nth(deleteButtons(container), 0);
    expect(button.getAttribute("title")).toBe("remove it");
    expect(button.classList.contains("delete-class")).toBe(true);
    expect(button.style.color).toBe("rgb(9, 8, 7)");
    expect(button.getAttribute("data-testid")).toBe("chip-delete");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("lets a consumer's aria-label win and cancel the removal from their own onClick", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS }}
        deleteProps={{
          "aria-label": "Delete",
          onClick: (event) => event.preventDefault(),
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    expect(nth(deleteButtons(container), 0).getAttribute("aria-label")).toBe("Delete");

    await userEvent.click(nth(deleteButtons(container), 0));
    // `composeEventHandlers` runs the consumer first and stops on `preventDefault()`, so their
    // handler is a real cancel channel over the built-in removal.
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });
});
