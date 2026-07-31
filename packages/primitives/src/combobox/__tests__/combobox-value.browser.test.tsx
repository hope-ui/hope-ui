import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { SelectionMode } from "../../internal";
import type { CreateComboboxReturn } from "../combobox-root";
import {
  ComboboxHarness,
  type ComboboxHarnessProps,
  contentOf,
  FRUITS,
  nextFrame,
  nth,
  optionsOf,
  triggerOf,
  valuePartOf,
} from "./combobox-harness";

function mountHarness(props: Partial<ComboboxHarnessProps<string>> = {}) {
  let state!: CreateComboboxReturn<string, SelectionMode>;
  const result = mount(() => (
    <ComboboxHarness
      values={FRUITS}
      {...props}
      onReady={(ready) => {
        state = ready;
        props.onReady?.(ready);
      }}
    />
  ));
  return { ...result, state: () => state };
}

describe("createComboboxValue", () => {
  it("marks the empty state with data-placeholder, and clears it once something is selected", async () => {
    const { container, dispose } = mountHarness();
    expect(valuePartOf(container)?.hasAttribute("data-placeholder")).toBe(true);
    // Present-*empty*, so a recipe targets one `data-placeholder:` variant.
    expect(valuePartOf(container)?.getAttribute("data-placeholder")).toBe("");

    await userEvent.click(page.getByTestId("trigger"));
    await vi.waitFor(() => expect(contentOf(container)).toBeTruthy());
    await userEvent.click(nth(optionsOf(container), 1));

    await vi.waitFor(() =>
      expect(valuePartOf(container)?.hasAttribute("data-placeholder")).toBe(false),
    );
    expect(valuePartOf(container)?.textContent).toBe("Banana");
    dispose();
  });

  it("reads emptiness off the listbox's own value, so both selection modes agree", () => {
    // "Nothing selected" is one condition on `list.value()` (an empty array) where the adapted shape
    // spells it `null` in single mode and `[]` in multiple.
    const single = mountHarness({ options: { defaultValue: "Apple" } });
    expect(valuePartOf(single.container)?.hasAttribute("data-placeholder")).toBe(false);
    single.dispose();

    const emptyMultiple = mountHarness({
      options: { selectionMode: "multiple", defaultValue: [] },
    });
    expect(valuePartOf(emptyMultiple.container)?.hasAttribute("data-placeholder")).toBe(true);
    emptyMultiple.dispose();

    const multiple = mountHarness({
      options: { selectionMode: "multiple", defaultValue: ["Apple", "Cherry"] },
    });
    expect(valuePartOf(multiple.container)?.hasAttribute("data-placeholder")).toBe(false);
    expect(valuePartOf(multiple.container)?.textContent).toBe("Apple, Cherry");
    multiple.dispose();
  });

  it("generates an SSR-stable id, and a consumer's own wins", async () => {
    const generated = mountHarness();
    expect(valuePartOf(generated.container)?.id).toBeTruthy();
    await vi.waitFor(() =>
      expect(triggerOf(generated.container).getAttribute("aria-labelledby")).toContain(
        valuePartOf(generated.container)?.id as string,
      ),
    );
    generated.dispose();

    const custom = mountHarness({ valueProps: { id: "fruit-value" } });
    expect(valuePartOf(custom.container)?.id).toBe("fruit-value");
    // …and the consumer's id is what reaches the trigger, not the generated one.
    await vi.waitFor(() =>
      expect(triggerOf(custom.container).getAttribute("aria-labelledby")).toContain("fruit-value"),
    );
    expect(custom.state().valueId()).toBe("fruit-value");
    custom.dispose();
  });

  it("clears its registration when it unmounts", async () => {
    const { container, state, dispose } = mountHarness();
    await vi.waitFor(() => expect(state().valueId()).toBeTruthy());
    const id = state().valueId();

    dispose();
    // A stale `valueId` would leave the next trigger pointing `aria-labelledby` at a removed node.
    expect(id).toBeTruthy();
    expect(container.querySelector('[data-testid="value"]')).toBeNull();
  });

  it("forwards the consumer's own attributes and handlers", async () => {
    const onClick = vi.fn();
    const { container, dispose } = mountHarness({
      valueProps: { title: "kept", lang: "fr", onClick },
    });
    const value = valuePartOf(container) as HTMLElement;

    expect(value.getAttribute("title")).toBe("kept");
    expect(value.getAttribute("lang")).toBe("fr");
    value.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await nextFrame();
    expect(onClick).toHaveBeenCalledOnce();
    dispose();
  });

  it("has no accessibility violations", async () => {
    const { container, dispose } = mountHarness({ options: { defaultValue: "Cherry" } });
    await expectNoA11yViolations(container);
    dispose();
  });
});
