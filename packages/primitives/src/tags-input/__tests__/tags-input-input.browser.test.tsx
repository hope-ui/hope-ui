import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { TagsInputRejection } from "../index";
import {
  activeLabels,
  chipLabels,
  chips,
  endComposition,
  FRUITS,
  field,
  focusedChipLabel,
  NO_TAGS,
  nth,
  pasteText,
  pressWithKeyCode,
  row,
  startComposition,
  TagsInputRow,
  typeInto,
} from "./tags-input-harness";

/** Dispatch a cancelable keydown and report whether the hook consumed it. */
function pressAndReadDefault(element: HTMLElement, key: string): boolean {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event.defaultPrevented;
}

/** Focus the field and put the caret at `offset`, collapsed. */
function caretAt(input: HTMLInputElement, offset: number): void {
  input.focus();
  input.setSelectionRange(offset, offset);
}

describe("createTagsInputInput — attributes", () => {
  it("emits a text field carrying the D7 pass-throughs", async () => {
    const { container, dispose } = mount(() => (
      <>
        <TagsInputRow
          options={{
            defaultValue: FRUITS,
            invalid: true,
            readOnly: true,
            "aria-describedby": "field-hint",
          }}
        />
        {/* A real target, so the forwarded IDREF is not a dangling one axe has to flag. */}
        <span id="field-hint">Separate tags with a comma</span>
      </>
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    expect(input.getAttribute("type")).toBe("text");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe("field-hint");
    expect(input.hasAttribute("readonly")).toBe(true);
    // `required` is deliberately absent: the field is empty the moment a tag is committed, so a
    // native `required` here would block every submit of a form that already holds three tags. `D6`
    // puts it on a clipped control whose value tracks the tag list instead.
    expect(input.hasAttribute("required")).toBe(false);
    // The browser's own text machinery, off — autocorrect rewriting a half-typed address is silent.
    expect(input.getAttribute("autocomplete")).toBe("off");
    expect(input.getAttribute("spellcheck")).toBe("false");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("marks the field disabled from the widget's own disabled state", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, disabled: true }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    expect(field(container).disabled).toBe(true);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("forwards the native attributes it does not own onto the field", async () => {
    // The `omit` list is hand-kept, so a renamed control prop can quietly start swallowing a
    // consumer's attributes with a green typecheck and a green suite. Assert them **on the element**.
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS }}
        inputProps={{
          id: "the-field",
          name: "tag-draft",
          placeholder: "Add a fruit",
          title: "the field",
          class: "field-class",
          maxlength: 40,
          style: { color: "rgb(7, 8, 9)" },
        }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    expect(input.getAttribute("id")).toBe("the-field");
    expect(input.getAttribute("name")).toBe("tag-draft");
    expect(input.getAttribute("placeholder")).toBe("Add a fruit");
    expect(input.getAttribute("title")).toBe("the field");
    expect(input.getAttribute("maxlength")).toBe("40");
    expect(input.classList.contains("field-class")).toBe(true);
    expect(input.style.color).toBe("rgb(7, 8, 9)");

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — D5: Enter and the enclosing form", () => {
  it("commits the draft on Enter and cancels the key", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    typeInto(input, "Date");
    await userEvent.keyboard("{Enter}");

    await vi.waitFor(() =>
      expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry", "Date"]),
    );
    await vi.waitFor(() => expect(input.value).toBe(""));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves Enter on an empty field unbound, so the enclosing form still submits", async () => {
    // The failure mode this pins is silent: a `preventDefault()` here breaks form submission for
    // every consumer, and no assertion about tags would ever notice.
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const { container, dispose } = mount(() => (
      <form onSubmit={onSubmit}>
        <TagsInputRow options={{ defaultValue: FRUITS }} />
        <button type="submit">Save</button>
      </form>
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    input.focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    // …and Enter *with* text commits instead, so the same key never does both.
    typeInto(input, "Date");
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(chipLabels(container)).toContain("Date"));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — D5: the IME guard returns first", () => {
  it("does not commit the candidate when Enter confirms a composition", async () => {
    // A CJK candidate confirmation arrives as `Enter`. Committing on it turns a half-typed word into
    // a tag, and no test that types ASCII can ever catch the regression.
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS }} />
    ));
    const input = field(container);

    input.focus();
    startComposition(input, "にほん");
    await userEvent.keyboard("{Enter}");
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(chips(container)).toHaveLength(0);
    expect(input.value).toBe("にほん");

    // Once the session ends, the very same key commits.
    endComposition(input);
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["にほん"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("does not commit when the key arrives with the legacy keyCode 229", async () => {
    // The second channel: Safari and older WebKit report an IME-consumed key as `keyCode === 229`
    // while `isComposing()` has not flipped. Base UI checks the same value in `ComboboxInput.tsx`.
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS }} />
    ));
    const input = field(container);

    typeInto(input, "にほん");
    expect(pressWithKeyCode(input, "Enter", 229)).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(chips(container)).toHaveLength(0);
    expect(input.value).toBe("にほん");

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — the delimiter key", () => {
  it("commits on the delimiter character and never types it", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS }} />
    ));
    const input = field(container);

    typeInto(input, "Apple");
    await userEvent.keyboard(",");

    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple"]));
    // The delimiter is a commit key, never literal text.
    await vi.waitFor(() => expect(input.value).toBe(""));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("reads the delimiter back from the root rather than hard-coding a comma", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS, delimiter: ";" }} />
    ));
    const input = field(container);

    typeInto(input, "a,b");
    await userEvent.keyboard(";");
    // The comma is now an ordinary character inside one tag, and `;` is what splits.
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["a,b"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("swallows the delimiter on an empty field without reporting a rejection", async () => {
    // Nothing was typed, so there is nothing to commit and nothing to complain about — a stray comma
    // just disappears rather than firing `onReject("empty")` once per keypress.
    const onReject = vi.fn();
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS, onReject }} />
    ));
    const input = field(container);

    input.focus();
    await userEvent.keyboard(",,");
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(input.value).toBe("");
    expect(onReject).not.toHaveBeenCalled();

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — Backspace on an empty field", () => {
  it("removes the last chip in one step", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    field(container).focus();
    await userEvent.keyboard("{Backspace}");
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple", "Banana"]));

    // One step, not highlight-then-delete: only the one-step form exists upstream.
    await userEvent.keyboard("{Backspace}");
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves Backspace alone while the field has text", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    typeInto(input, "Da");
    expect(pressAndReadDefault(input, "Backspace")).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("refuses to remove a disabled last chip", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, isItemDisabled: (tag) => tag === "Cherry" }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    field(container).focus();
    await userEvent.keyboard("{Backspace}");
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — the arrow bridge into the chip row", () => {
  it("lands on the last chip from a caret at position 0", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    caretAt(field(container), 0);
    await userEvent.keyboard("{ArrowLeft}");

    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));
    await vi.waitFor(() => expect(activeLabels(container)).toEqual(["Cherry"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("skips a disabled tail chip on the way in", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, isItemDisabled: (tag) => tag === "Cherry" }} />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    caretAt(field(container), 0);
    await userEvent.keyboard("{ArrowLeft}");

    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Banana"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("moves the caret instead when the caret is not at position 0", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    typeInto(input, "Date");
    caretAt(input, 4);
    await userEvent.keyboard("{ArrowLeft}");

    await vi.waitFor(() => expect(input.selectionStart).toBe(3));
    expect(document.activeElement).toBe(input);
    expect(focusedChipLabel(container)).toBeNull();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("does nothing at caret 0 with no tags", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS }} />
    ));
    const input = field(container);

    caretAt(input, 0);
    expect(pressAndReadDefault(input, "ArrowLeft")).toBe(false);
    expect(document.activeElement).toBe(input);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("bridges with ArrowRight under RTL, and leaves ArrowLeft as a caret key", async () => {
    // The bridge arrow is the one that moves the caret toward the *start of the text*, which flips
    // with the reading direction — the same flip `createListNavigation` applies inside the row.
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: FRUITS, dir: "rtl" }} dir="rtl" />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    caretAt(input, 0);
    expect(pressAndReadDefault(input, "ArrowLeft")).toBe(false);
    expect(document.activeElement).toBe(input);

    await userEvent.keyboard("{ArrowRight}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — paste", () => {
  it("splits a paste on the delimiter and commits every part", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS }} />
    ));
    const input = field(container);

    input.focus();
    pasteText(input, "Apple, Banana ,Cherry");

    // `parse` is the single normalization seam, so the surrounding whitespace is trimmed by the same
    // function that runs on typing.
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]));
    await vi.waitFor(() => expect(input.value).toBe(""));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("splices the paste into the draft at the caret", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS }} />
    ));
    const input = field(container);

    typeInto(input, "Ap");
    caretAt(input, 2);
    pasteText(input, "ple,Banana");

    // The same tags the user would have got by typing it, rather than "Ap" being silently dropped.
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple", "Banana"]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("partial-accepts up to max, hands the remainder back, and reports one overflow", async () => {
    const rejections: TagsInputRejection[] = [];
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS, max: 4, onReject: (r) => rejections.push(r) }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));
    const input = field(container);

    input.focus();
    pasteText(input, "Date,Elderberry,Fig");

    // All-or-nothing would throw away a 20-address paste over one overflow.
    await vi.waitFor(() =>
      expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry", "Date"]),
    );
    // The remainder is back in the field, re-joined by the delimiter, so the user sees exactly what
    // did not fit and can act on it.
    await vi.waitFor(() => expect(input.value).toBe("Elderberry,Fig"));
    // **Once**, with the whole tail — a paste that overflows is one overflow, not one rejection per
    // tag the user lost.
    expect(rejections).toEqual([{ reason: "max", text: "Elderberry,Fig" }]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves a paste with no text on the clipboard to the browser", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow options={{ defaultValue: NO_TAGS }} />
    ));
    const input = field(container);

    input.focus();
    const clipboardData = new DataTransfer();
    const event = new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true });
    input.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(chips(container)).toHaveLength(0);

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — the focus-within pair", () => {
  it("turns the live region polite on focus and off once focus leaves the widget", async () => {
    // The half `createTagsInputList` cannot see: the row only observes focus crossing *its own*
    // boundary, so focus leaving the field for good is a transition it has no event for.
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

    field(container).focus();
    await vi.waitFor(() => expect(list.getAttribute("aria-live")).toBe("polite"));

    (container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    await vi.waitFor(() => expect(list.getAttribute("aria-live")).toBe("off"));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves no chip painting data-active once focus is gone", async () => {
    const { container, dispose } = mount(() => (
      <>
        <TagsInputRow options={{ defaultValue: FRUITS }} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </>
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    caretAt(field(container), 0);
    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(activeLabels(container)).toEqual(["Cherry"]));

    (container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    await vi.waitFor(() => expect(activeLabels(container)).toEqual([]));

    await expectNoA11yViolations(container);
    dispose();
  });

  it("stays focused while focus moves from the field into the chip row", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));
    const list = row(container);

    caretAt(field(container), 0);
    await vi.waitFor(() => expect(list.getAttribute("aria-live")).toBe("polite"));

    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));
    // Long enough for the deferred focus-out decision to have run and, wrongly, flipped it.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(list.getAttribute("aria-live")).toBe("polite");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("drops the chip highlight when focus arrives back at the field", async () => {
    // Tabbing away from a chip and back lands on the field — the widget's single tab stop — and a
    // chip still painting `data-active` there would be a highlight no arrow key relates to, with
    // Backspace-on-empty then refusing to remove anything.
    const { container, dispose } = mount(() => (
      <>
        <TagsInputRow options={{ defaultValue: FRUITS }} />
        <button type="button" data-testid="outside">
          outside
        </button>
      </>
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    nth(chips(container), 1).focus();
    await vi.waitFor(() => expect(activeLabels(container)).toEqual(["Banana"]));

    (container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    field(container).focus();
    await vi.waitFor(() => expect(activeLabels(container)).toEqual([]));

    await userEvent.keyboard("{Backspace}");
    await vi.waitFor(() => expect(chipLabels(container)).toEqual(["Apple", "Banana"]));

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — blurBehavior", () => {
  async function blurAway(container: HTMLElement): Promise<void> {
    (container.querySelector('[data-testid="outside"]') as HTMLButtonElement).focus();
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  function Widget(props: {
    blurBehavior?: "keep" | "add" | "clear";
    onReject?: (rejection: TagsInputRejection) => void;
  }) {
    return (
      <>
        <TagsInputRow
          options={{ defaultValue: FRUITS, onReject: props.onReject }}
          inputProps={{ blurBehavior: props.blurBehavior }}
        />
        <button type="button" data-testid="outside">
          outside
        </button>
      </>
    );
  }

  it("keeps the draft by default", async () => {
    const { container, dispose } = mount(() => <Widget />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    typeInto(field(container), "Date");
    await blurAway(container);

    expect(field(container).value).toBe("Date");
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("commits the draft with blurBehavior=add", async () => {
    const { container, dispose } = mount(() => <Widget blurBehavior="add" />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    typeInto(field(container), "Date");
    await blurAway(container);

    await vi.waitFor(() => expect(chipLabels(container)).toContain("Date"));
    expect(field(container).value).toBe("");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("discards the draft with blurBehavior=clear", async () => {
    const { container, dispose } = mount(() => <Widget blurBehavior="clear" />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    typeInto(field(container), "Date");
    await blurAway(container);

    await vi.waitFor(() => expect(field(container).value).toBe(""));
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("never fires when the blur only moved focus inside the widget", async () => {
    // The reason `"keep"` is the default is that this can go wrong: clicking a chip's ✕ blurs the
    // field, and `"add"` would commit a half-typed draft as a side effect of deleting a *different*
    // tag. The ✕ cancels its `pointerdown` so focus never actually moves — but blur-commit must not
    // depend on that, so this exercises the arrow path, where focus really does leave the field.
    const { container, dispose } = mount(() => <Widget blurBehavior="add" />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    typeInto(input, "Date");
    caretAt(input, 0);
    await userEvent.keyboard("{ArrowLeft}");
    await vi.waitFor(() => expect(focusedChipLabel(container)).toBe("Cherry"));
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);
    expect(input.value).toBe("Date");

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — D4's duplicate flash", () => {
  it("marks the colliding chip and clears the mark on the next input event", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));
    const input = field(container);

    typeInto(input, "Banana");
    await userEvent.keyboard("{Enter}");

    await vi.waitFor(() =>
      expect(nth(chips(container), 1).hasAttribute("data-duplicate")).toBe(true),
    );
    // Dropped rather than kept: the value is already on screen as a chip.
    await vi.waitFor(() => expect(input.value).toBe(""));
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    // The input part is the only thing that ends the flash, and it does it on **every** input event.
    typeInto(input, "B");
    await vi.waitFor(() =>
      expect(nth(chips(container), 1).hasAttribute("data-duplicate")).toBe(false),
    );

    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createTagsInputInput — the keys it deliberately leaves alone", () => {
  it("does not claim Escape, Home, End or Delete", async () => {
    const { container, dispose } = mount(() => <TagsInputRow options={{ defaultValue: FRUITS }} />);
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    typeInto(input, "Date");

    // Escape must reach an enclosing Dialog — the one Escape rule this whole widget shares. Home/End
    // and Delete are the field's own caret keys.
    for (const key of ["Escape", "Home", "End", "Delete"]) {
      expect(pressAndReadDefault(input, key)).toBe(false);
    }
    expect(input.value).toBe("Date");
    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("composes a consumer's onKeyDown in front of its own, so preventDefault cancels the map", async () => {
    const { container, dispose } = mount(() => (
      <TagsInputRow
        options={{ defaultValue: FRUITS }}
        inputProps={{ onKeyDown: (event) => event.preventDefault() }}
      />
    ));
    await vi.waitFor(() => expect(chips(container)).toHaveLength(3));

    const input = field(container);
    typeInto(input, "Date");
    await userEvent.keyboard("{Enter}");
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(chipLabels(container)).toEqual(["Apple", "Banana", "Cherry"]);

    await expectNoA11yViolations(container);
    dispose();
  });
});
