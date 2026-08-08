import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { chips, deleteButtons, FRUITS, nth, TagsInputRow } from "./tags-input-harness";

function texts(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="group"] span')];
}

describe("createTagsInputItemText", () => {
  it("owns the id the ✕ points at, one per chip", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const ids = texts(container).map((text) => text.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(3);

    // The pair is the whole `D1` mechanism: whatever id this part generates is the one the ✕'s
    // second `aria-labelledby` token names, with no context and no prop between them.
    deleteButtons(container).forEach((button, index) => {
      expect(button.getAttribute("aria-labelledby")).toBe(`${button.id} ${nth(ids, index)}`);
    });

    await expectNoA11yViolations(container);
    dispose();
  });

  it("renders the tag's display text, from itemToLabel when there is one", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{
          defaultValue: ["a@example.com", "b@example.com"],
          itemToLabel: (tag) => tag.split("@")[0] as string,
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(2));

    expect(texts(container).map((text) => text.textContent)).toEqual(["a", "b"]);
    await expectNoA11yViolations(container);
    dispose();
  });

  it("drops a consumer's id rather than leaving the ✕ pointing at nothing", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: ["Apple"] }} textProps={{ id: "my-text" }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(1));

    const text = nth(texts(container), 0);
    const button = nth(deleteButtons(container), 0);
    expect(text.id).not.toBe("my-text");
    // Honoring the consumer's id would leave this pair naming an element that no longer exists, and
    // the button would silently announce just "Remove".
    expect(button.getAttribute("aria-labelledby")).toBe(`${button.id} ${text.id}`);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("forwards every other native attribute onto the text element", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: ["Apple"] }}
        textProps={{
          title: "the tag",
          class: "text-class",
          style: { color: "rgb(7, 8, 9)" },
          "data-testid": "chip-text",
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(1));

    const text = nth(texts(container), 0);
    expect(text.getAttribute("title")).toBe("the tag");
    expect(text.classList.contains("text-class")).toBe(true);
    expect(text.style.color).toBe("rgb(7, 8, 9)");
    expect(text.getAttribute("data-testid")).toBe("chip-text");

    await expectNoA11yViolations(container);
    dispose();
  });
});
