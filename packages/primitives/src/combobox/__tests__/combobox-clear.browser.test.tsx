import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  ComboboxInputHarness,
  clearOf,
  FRUITS,
  inputOf,
  listOf,
  selectedLabels,
  toggleOf,
} from "./combobox-harness";

// `createComboboxClear` empties the field and hands focus back to the input. It shares the chevron's
// two structural rules — outside the tab order, never takes focus — and none of its ARIA: clearing
// is not opening, so `aria-expanded`/`aria-controls` here would claim this button owns the listbox
// when the input already does.

function mountClear(tree: () => ReturnType<typeof ComboboxInputHarness>) {
  const mounted = mount(tree);
  onTestFinished(mounted.dispose);
  return mounted;
}

describe("createComboboxClear", () => {
  it("names itself from the locale catalog and carries no popup ARIA", async () => {
    const { container, dispose } = mountClear(() => (
      <ComboboxInputHarness values={FRUITS} withClear />
    ));
    const clear = clearOf(container) as HTMLButtonElement;

    // A bare ✕ is an axe `button-name` violation.
    expect(clear.getAttribute("aria-label")).toBe("Clear");
    expect(clear.hasAttribute("aria-expanded")).toBe(false);
    expect(clear.hasAttribute("aria-controls")).toBe(false);
    expect(clear.hasAttribute("aria-haspopup")).toBe(false);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("defers to a consumer's own label", () => {
    const { container } = mountClear(() => (
      <ComboboxInputHarness values={FRUITS} withClear inputProps={{}} />
    ));
    expect(clearOf(container)?.getAttribute("aria-label")).toBe("Clear");
  });

  it("sits outside the tab order", async () => {
    const { container } = mountClear(() => (
      <ComboboxInputHarness values={FRUITS} withClear withOutsideButton />
    ));

    expect(clearOf(container)?.tabIndex).toBe(-1);
    inputOf(container).focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(container.querySelector('[data-testid="outside"]'));
  });

  it("clears through the consumer's callback and returns focus to the input", async () => {
    const { container } = mountClear(() => <ComboboxInputHarness values={FRUITS} withClear />);
    const input = inputOf(container);

    // Pick something first, so there is state on both axes to clear. A pointer open enters on the
    // selected row — nothing is selected, so on the first focusable one — and Enter takes it.
    await userEvent.click(toggleOf(container));
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());
    input.focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(input.value).toBe("Apple"));

    await userEvent.click(clearOf(container) as HTMLElement);
    await vi.waitFor(() => expect(input.value).toBe(""));
    // The harness's `onClear` empties both text and selection — the policy `createComboboxClear`
    // deliberately does not own.
    await userEvent.click(toggleOf(container));
    await vi.waitFor(() => expect(listOf(container)).not.toBeNull());
    expect(selectedLabels(container)).toEqual([]);
    expect(document.activeElement).toBe(input);
  });

  it("never lets the click blur the input", async () => {
    const { container } = mountClear(() => <ComboboxInputHarness values={FRUITS} withClear />);
    const input = inputOf(container);
    const onBlur = vi.fn();
    input.addEventListener("blur", onBlur);

    input.focus();
    await userEvent.click(clearOf(container) as HTMLElement);
    // A blur here fires the input's blur-commit, which — with nothing highlighted and custom values
    // off — puts back the very text the user asked to remove.
    expect(onBlur).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it("reflects the list's disabled state", () => {
    const { container } = mountClear(() => (
      <ComboboxInputHarness values={FRUITS} withClear options={{ disabled: true }} />
    ));
    expect(clearOf(container)?.disabled).toBe(true);
  });
});
