import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { chips, FRUITS, field, nth, row, serializeRow, TagsInputRow } from "./tags-input-harness";

describe("createTagsInputList — the D1 shape", () => {
  it("renders role=toolbar over role=group chips, each with a real remove button", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    // The whole `D1` anatomy in one place: the row's role and live region, `tabindex="-1"` on every
    // chip (`D2`), the chip named from its own text, and the ✕'s two-id `aria-labelledby` pair.
    expect(serializeRow(container)).toMatchInlineSnapshot(`
      "<div aria-label="Tags" role="toolbar" aria-orientation="horizontal" aria-live="off" aria-relevant="additions" aria-atomic="false">
      <div id="chip-0" role="group" aria-label="Apple" tabindex="-1">
      <span id="chip-0-text">Apple</span>
      <button type="button" id="chip-0-delete" aria-label="Remove" aria-labelledby="chip-0-delete chip-0-text" tabindex="-1">
      <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      </svg>
      </button>
      </div>
      <div id="chip-1" role="group" aria-label="Banana" tabindex="-1">
      <span id="chip-1-text">Banana</span>
      <button type="button" id="chip-1-delete" aria-label="Remove" aria-labelledby="chip-1-delete chip-1-text" tabindex="-1">
      <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      </svg>
      </button>
      </div>
      <div id="chip-2" role="group" aria-label="Cherry" tabindex="-1">
      <span id="chip-2-text">Cherry</span>
      <button type="button" id="chip-2-delete" aria-label="Remove" aria-labelledby="chip-2-delete chip-2-text" tabindex="-1">
      <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      </svg>
      </button>
      </div>
      </div>"
    `);

    dispose();
  });

  it("passes axe on the toolbar > group > button nesting", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    // This is where axe, rather than an assertion, validates `D1`: an unnameable `role="group"`, a
    // ✕ whose `aria-labelledby` pointed at nothing, or a role this nesting does not allow would all
    // surface here and nowhere else.
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputList — the D9 live region", () => {
  it("starts off, so a value change from elsewhere cannot talk over the user", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const list = row(container);
    // Derived from focus state, never written by an effect — which is what makes the server's HTML
    // carry `off` too, the string Phase 8's round-trip gates on.
    expect(list.getAttribute("aria-live")).toBe("off");
    expect(list.getAttribute("aria-relevant")).toBe("additions");
    expect(list.getAttribute("aria-atomic")).toBe("false");
    expect(list.getAttribute("aria-orientation")).toBe("horizontal");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("turns polite while a chip holds focus and off again when focus leaves the widget", async () => {
    const { container, dispose } = mount(() => (
      <>
        <TagsInputRow options={{ defaultValue: FRUITS }} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </>
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));
    const list = row(container);

    nth(chips(container), 0).focus();
    await vi.waitFor(() => expect(list.getAttribute("aria-live")).toBe("polite"));

    (container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    await vi.waitFor(() => expect(list.getAttribute("aria-live")).toBe("off"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("stays polite when focus moves from a chip to the text field", async () => {
    // The field sits *outside* this element but inside the widget, so a containment-only check would
    // drop the region — and the chip highlight with it — every time a key handed focus back to it.
    // Turning it off from the field is the field part's own job (Phase 4).
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));
    const list = row(container);

    nth(chips(container), 0).focus();
    await vi.waitFor(() => expect(list.getAttribute("aria-live")).toBe("polite"));

    field(container).focus();
    await vi.waitFor(() => expect(document.activeElement).toBe(field(container)));
    // Long enough for the deferred focus-out decision to have run and, wrongly, flipped it.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(list.getAttribute("aria-live")).toBe("polite");

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputList — props", () => {
  it("forwards the native attributes it does not own onto the row element", async () => {
    // The `omit` list is hand-kept, so a renamed control prop can quietly start swallowing a
    // consumer's attributes with a green typecheck and a green suite. Assert them **on the element**.
    const { container, dispose } = mount(() => (
      <>
        <TagsInputRow
          options={{ defaultValue: FRUITS }}
          listProps={{
            id: "chip-row",
            "aria-label": "Selected fruit",
            "aria-describedby": "row-hint",
            title: "the chips",
            class: "row-class",
            style: { color: "rgb(1, 2, 3)" },
          }}
        />
        {/* A real target, so the forwarded IDREF is not a dangling one axe has to flag. */}
        <span id="row-hint">Press Delete to remove a tag</span>
      </>
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const list = row(container);
    expect(list.getAttribute("id")).toBe("chip-row");
    expect(list.getAttribute("aria-label")).toBe("Selected fruit");
    expect(list.getAttribute("aria-describedby")).toBe("row-hint");
    expect(list.getAttribute("title")).toBe("the chips");
    expect(list.classList.contains("row-class")).toBe(true);
    expect(list.style.color).toBe("rgb(1, 2, 3)");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("composes a consumer's focus handlers in front of its own", async () => {
    const onFocusIn = vi.fn();
    const onFocusOut = vi.fn();
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS }} listProps={{ onFocusIn, onFocusOut }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    nth(chips(container), 0).focus();
    await vi.waitFor(() => expect(onFocusIn).toHaveBeenCalledTimes(1));
    expect(row(container).getAttribute("aria-live")).toBe("polite");

    field(container).focus();
    await vi.waitFor(() => expect(onFocusOut).toHaveBeenCalledTimes(1));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("registers the row element as the widget's list element", async () => {
    // `setRef` has no directly observable effect in the DOM, so this pins it through the one thing
    // that reads the registered element in a browser: the dev warning that compares the direction
    // the keymap mirrors against with the direction the browser lays the row out in. No element
    // registered, no warning.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, dir: "rtl" }} dir="ltr" />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("[hope-ui] TagsInput")),
    );

    await expectNoA11yViolations(container);
    dispose();
    warn.mockRestore();
  });
});
