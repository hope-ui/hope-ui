import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  ComboboxInputHarness,
  FRUITS,
  inputOf,
  listOf,
  nextFrame,
  toggleOf,
} from "./combobox-harness";

// `createComboboxToggle` is the chevron beside a Combobox's input — a pointer affordance for opening
// the popup, and nothing else. It is **not** `createComboboxTrigger`: that hook is the
// `role="combobox"` focus owner Select's trigger is, and putting it here would give the tree two
// comboboxes, two `aria-activedescendant`s and two keymaps.

function mountToggle(tree: () => ReturnType<typeof ComboboxInputHarness>) {
  const mounted = mount(tree);
  onTestFinished(mounted.dispose);
  return mounted;
}

describe("createComboboxToggle", () => {
  it("carries the popup ARIA but not the combobox role", async () => {
    const { container, dispose } = mountToggle(() => <ComboboxInputHarness values={FRUITS} />);
    const toggle = toggleOf(container);

    expect(toggle.getAttribute("role")).not.toBe("combobox");
    expect(toggle.getAttribute("aria-haspopup")).toBe("listbox");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    // `<button>` implies no popup, so unlike the input this one says it explicitly.
    expect(toggle.hasAttribute("aria-controls")).toBe(false);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("names itself from the locale catalog, and defers to a consumer's label", () => {
    const { container } = mountToggle(() => <ComboboxInputHarness values={FRUITS} />);
    // A bare chevron is an axe `button-name` violation and unusable by voice control.
    expect(toggleOf(container).getAttribute("aria-label")).toBe("Show suggestions");

    const custom = mountToggle(() => (
      <ComboboxInputHarness values={FRUITS} toggleProps={{ "aria-label": "Open" }} />
    ));
    expect(toggleOf(custom.container).getAttribute("aria-label")).toBe("Open");
  });

  it("sits outside the tab order", async () => {
    const { container } = mountToggle(() => (
      <ComboboxInputHarness values={FRUITS} withClear withOutsideButton />
    ));

    expect(toggleOf(container).tabIndex).toBe(-1);
    inputOf(container).focus();
    await userEvent.tab();
    // The input is the widget's single tab stop; a second one would double the presses it takes to
    // cross a form of comboboxes, for behavior already bound to the input.
    expect(document.activeElement).toBe(container.querySelector('[data-testid="outside"]'));
  });

  it("opens on the selected option and toggles closed again", async () => {
    const { container } = mountToggle(() => <ComboboxInputHarness values={FRUITS} />);
    const toggle = toggleOf(container);

    await userEvent.click(toggle);
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-controls")).toBe(listOf(container)?.id);

    // The regression this pins: without the shell registered as the anchor, this button falls
    // outside the dismissal exclusions — the capture-phase pointerdown dismisses and this very click
    // reopens, so the popup can never be closed by the control that opened it.
    await userEvent.click(toggle);
    await vi.waitFor(() => expect(toggle.getAttribute("aria-expanded")).toBe("false"));
  });

  it("never takes focus off the input", async () => {
    const { container } = mountToggle(() => <ComboboxInputHarness values={FRUITS} />);

    inputOf(container).focus();
    await userEvent.click(toggleOf(container));
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());
    // A click that moved DOM focus here would blur the input, drop the highlight's paint gate, fire
    // the input's blur-commit, and leave `aria-activedescendant` on an unfocused element.
    expect(document.activeElement).toBe(inputOf(container));
  });

  it("focuses the input when the widget was not focused at all", async () => {
    const { container } = mountToggle(() => (
      <ComboboxInputHarness values={FRUITS} withOutsideButton />
    ));

    (container.querySelector('[data-testid="outside"]') as HTMLElement).focus();
    await userEvent.click(toggleOf(container));
    await vi.waitFor(() => expect(document.activeElement).toBe(inputOf(container)));
  });

  it("reflects the list's disabled state", async () => {
    const { container } = mountToggle(() => (
      <ComboboxInputHarness values={FRUITS} options={{ disabled: true }} />
    ));

    expect(toggleOf(container).disabled).toBe(true);
    toggleOf(container).click();
    await nextFrame();
    expect(listOf(container)).toBeNull();
  });

  it("works on a non-native render target", async () => {
    const { container } = mountToggle(() => (
      <ComboboxInputHarness values={FRUITS} toggleAs="div" toggleProps={{ nativeButton: false }} />
    ));
    const toggle = toggleOf(container);

    expect(toggle.tagName).toBe("DIV");
    // On a non-`<button>` element `createButton` switches to `role`/`tabIndex`/`aria-disabled` and
    // synthesizes activation, but this hook's `tabIndex: -1` still wins — the tab-order exclusion is
    // not negotiable.
    expect(toggle.getAttribute("role")).toBe("button");
    expect(toggle.tabIndex).toBe(-1);

    await userEvent.click(toggle);
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());
  });

  it("lets a consumer's onClick cancel the toggle", async () => {
    const { container } = mountToggle(() => (
      <ComboboxInputHarness
        values={FRUITS}
        toggleProps={{ onClick: (event) => event.preventDefault() }}
      />
    ));

    await userEvent.click(toggleOf(container));
    await nextFrame();
    expect(listOf(container)).toBeNull();
  });
});
