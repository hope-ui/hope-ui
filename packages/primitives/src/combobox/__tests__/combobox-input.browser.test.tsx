import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  activeLabelForInput,
  ComboboxInputHarness,
  FRUITS,
  inputOf,
  listOf,
  nextFrame,
  optionsOf,
  selectedLabels,
} from "./combobox-harness";

// `createComboboxInput` is Combobox's focus owner: the same `role="combobox"` and popup ARIA
// `createComboboxTrigger` puts on Select's `<button>`, on an `<input>` — no button behavior, no
// typeahead, and a keymap that differs on every row where a text field and a button disagree. Those
// rows are what this file pins.

function mountInput(tree: () => ReturnType<typeof ComboboxInputHarness>) {
  const mounted = mount(tree);
  onTestFinished(mounted.dispose);
  return mounted;
}

/** Writes through the native setter + one `input` event — one tick, the way `Combobox.Root` sees it. */
function typeInto(input: HTMLInputElement, text: string): void {
  input.focus();
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set as (
    this: HTMLInputElement,
    value: string,
  ) => void;
  setter.call(input, text);
  input.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

describe("createComboboxInput — ARIA", () => {
  it("puts the combobox pattern on the input", async () => {
    const { container, dispose } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.type).toBe("text");
    // ARIA 1.2 gives `role="combobox"` an implicit `aria-haspopup="listbox"`, so repeating it is
    // noise. The chevron `<button>` implies nothing and carries an explicit one.
    expect(input.hasAttribute("aria-haspopup")).toBe(false);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("switches off the browser's own suggestion machinery", () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    expect(input.getAttribute("autocomplete")).toBe("off");
    expect(input.getAttribute("autocorrect")).toBe("off");
    expect(input.getAttribute("autocapitalize")).toBe("none");
    // `spellcheck` is an *enumerated* attribute: a JS `false` serializes to an absent attribute,
    // which then inherits back on. The effective property is what matters.
    expect(input.getAttribute("spellcheck")).toBe("false");
    expect(input.spellcheck).toBe(false);
  });

  it("defers all four to a consumer's own value", () => {
    const { container } = mountInput(() => (
      <ComboboxInputHarness
        values={FRUITS}
        inputProps={{ autocomplete: "email", spellcheck: true, type: "search" }}
      />
    ));
    const input = inputOf(container);

    expect(input.getAttribute("autocomplete")).toBe("email");
    expect(input.spellcheck).toBe(true);
    expect(input.type).toBe("search");
  });

  it("gates `aria-controls` and `aria-activedescendant` on the popup being mounted", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    // An IDREF naming an element that is not in the DOM is an axe `aria-valid-attr-value` violation,
    // on every closed Combobox on the page.
    expect(input.hasAttribute("aria-controls")).toBe(false);
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);

    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());
    expect(input.getAttribute("aria-controls")).toBe(listOf(container)?.id);
    expect(
      document.getElementById(input.getAttribute("aria-activedescendant") as string),
    ).not.toBeNull();

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("false"));
    expect(input.hasAttribute("aria-controls")).toBe(false);
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  });
});

describe("createComboboxInput — the keymap", () => {
  it("opens on the first option with ArrowDown and the last with ArrowUp", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(activeLabelForInput(container)).toBe("Apple"));

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("false"));

    await userEvent.keyboard("{ArrowUp}");
    await vi.waitFor(() => expect(activeLabelForInput(container)).toBe("Açaí"));
  });

  it("moves the highlight without moving DOM focus", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await vi.waitFor(() => expect(activeLabelForInput(container)).toBe("Banana"));
    expect(document.activeElement).toBe(input);
    for (const option of optionsOf(container)) {
      expect(option).not.toBe(document.activeElement);
    }
  });

  it("leaves Space and every printable key to the field — there is no typeahead", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("b n");
    // On the button trigger `b` starts a typeahead buffer and Space opens the popup. Here both type:
    // the input *is* the search affordance, and a hidden second buffer racing the visible one is the
    // bug this prevents.
    expect(input.value).toBe("b n");
    expect(activeLabelForInput(container)).toBeUndefined();
  });

  it("leaves Home/End/PageUp/PageDown to the caret while closed", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    typeInto(input, "banana");
    input.setSelectionRange(6, 6);
    const home = new KeyboardEvent("keydown", { key: "Home", bubbles: true, cancelable: true });
    input.dispatchEvent(home);
    // Not consumed while closed: jump-to-start has to keep working in a field the user is editing.
    expect(home.defaultPrevented).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("takes Home/End over once the popup is open", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());

    await userEvent.keyboard("{End}");
    await vi.waitFor(() => expect(activeLabelForInput(container)).toBe("Açaí"));
    await userEvent.keyboard("{Home}");
    await vi.waitFor(() => expect(activeLabelForInput(container)).toBe("Apple"));
  });

  it("drops the highlight on ArrowLeft/ArrowRight without eating the caret move", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(activeLabelForInput(container)).toBe("Apple"));

    const left = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      bubbles: true,
      cancelable: true,
    });
    input.dispatchEvent(left);
    // Moving the caret means the user is editing text again. An option that stayed highlighted is
    // one Enter away from being committed by mistake — but the caret still has to move.
    expect(left.defaultPrevented).toBe(false);
    await vi.waitFor(() => expect(activeLabelForInput(container)).toBeUndefined());
  });

  it("commits on Enter and closes, and preventDefaults only while open", async () => {
    const commit = vi.fn();
    const { container } = mountInput(() => (
      <ComboboxInputHarness values={FRUITS} onCommit={commit} />
    ));
    const input = inputOf(container);

    input.focus();
    const closed = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    input.dispatchEvent(closed);
    // A closed combobox in a form must still submit it. (The button trigger must always cancel
    // Enter instead, because a native `<button>` synthesizes a `click` from it.)
    expect(closed.defaultPrevented).toBe(false);
    expect(commit).not.toHaveBeenCalled();

    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());
    const open = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    input.dispatchEvent(open);
    expect(open.defaultPrevented).toBe(true);
    expect(commit).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("false"));
  });

  it("commits on Tab and lets focus leave", async () => {
    const commit = vi.fn();
    const { container } = mountInput(() => (
      <ComboboxInputHarness values={FRUITS} onCommit={commit} withOutsideButton />
    ));
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());

    await userEvent.tab();
    expect(commit).toHaveBeenCalled();
    // No `preventDefault`: focus has to actually leave.
    expect(document.activeElement).toBe(container.querySelector('[data-testid="outside"]'));
  });

  it("reverts on Escape while open, and lets a closed Escape through", async () => {
    const revert = vi.fn();
    const { container } = mountInput(() => (
      <ComboboxInputHarness values={FRUITS} onRevert={revert} />
    ));
    const input = inputOf(container);

    input.focus();
    const closed = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    input.dispatchEvent(closed);
    // A closed combobox must let Escape reach whatever encloses it — a Dialog.
    expect(closed.defaultPrevented).toBe(false);
    expect(revert).not.toHaveBeenCalled();

    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());
    await userEvent.keyboard("{Escape}");
    expect(revert).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("false"));
  });

  it("closes on Alt+ArrowUp and opens on the last option from closed", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await vi.waitFor(() => expect(activeLabelForInput(container)).toBe("Açaí"));

    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}");
    await vi.waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("false"));
  });

  it("lets a consumer's onKeyDown cancel the whole map", async () => {
    const { container } = mountInput(() => (
      <ComboboxInputHarness
        values={FRUITS}
        inputProps={{ onKeyDown: (event) => event.preventDefault() }}
      />
    ));
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await nextFrame();
    // Consumer first in every chain, so their `preventDefault()` cancels the hook's own behavior.
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("createComboboxInput — the text seam", () => {
  it("spreads the text primitive's value and composes the consumer's onInput in front of it", async () => {
    const onInput = vi.fn();
    const { container } = mountInput(() => (
      <ComboboxInputHarness values={FRUITS} inputProps={{ onInput }} />
    ));
    const input = inputOf(container);

    typeInto(input, "hello");
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("hello");
  });

  it("forwards onBeforeInput untouched — the one cancel channel there is", () => {
    const { container } = mountInput(() => (
      <ComboboxInputHarness
        values={FRUITS}
        inputProps={{ onBeforeInput: (event) => event.preventDefault() }}
      />
    ));
    const input = inputOf(container);

    const before = new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: "x",
    });
    input.dispatchEvent(before);
    // `beforeinput` is the only cancelable channel here — the native `input` event is not, so
    // `preventDefault()` on it does nothing. The hook never consumes `onBeforeInput`, precisely so a
    // consumer can forward one and stop the change.
    expect(before.defaultPrevented).toBe(true);
  });

  it("drives the highlight's paint gate off the input's own focus", async () => {
    const { container } = mountInput(() => (
      <ComboboxInputHarness values={FRUITS} options={{ defaultOpen: true }} withOutsideButton />
    ));
    const input = inputOf(container);
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());

    // The widget's focus lives on this element, so this is the only place that can report it.
    input.focus();
    await vi.waitFor(() => expect(container.querySelector("[data-active]")).not.toBeNull());

    (container.querySelector('[data-testid="outside"]') as HTMLElement).focus();
    await vi.waitFor(() => expect(container.querySelector("[data-active]")).toBeNull());
  });

  it("commits on blur", async () => {
    const commit = vi.fn();
    const { container } = mountInput(() => (
      <ComboboxInputHarness values={FRUITS} onCommit={commit} withOutsideButton />
    ));
    const input = inputOf(container);

    input.focus();
    (container.querySelector('[data-testid="outside"]') as HTMLElement).focus();
    await vi.waitFor(() => expect(commit).toHaveBeenCalled());
  });

  it("registers itself as the trigger element, so dismissal and positioning have an anchor", async () => {
    let state: { triggerElement: () => HTMLElement | undefined } | undefined;
    const { container } = mountInput(() => (
      <ComboboxInputHarness values={FRUITS} onReady={(ready) => (state = ready)} />
    ));

    expect(state?.triggerElement()).toBe(inputOf(container));
  });

  it("reflects the list's disabled state and refuses to open", async () => {
    const { container } = mountInput(() => (
      <ComboboxInputHarness values={FRUITS} options={{ disabled: true }} />
    ));
    const input = inputOf(container);

    expect(input.disabled).toBe(true);
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await nextFrame();
    expect(listOf(container)).toBeNull();
  });

  it("selects the highlighted option through the consumer's commit", async () => {
    const { container } = mountInput(() => <ComboboxInputHarness values={FRUITS} />);
    const input = inputOf(container);

    input.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await vi.waitFor(() => expect(input.value).toBe("Banana"));
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(selectedLabels(container)).toEqual(["Banana"]));
  });
});
