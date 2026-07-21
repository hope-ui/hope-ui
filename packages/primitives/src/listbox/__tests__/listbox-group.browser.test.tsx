import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { type Fruit, fruitOptions, GroupedListbox, options } from "./listbox-harness";

const label = (fruit: Fruit) => fruit.name;

const CITRUS: Fruit[] = [
  { id: 10, name: "Lemon" },
  { id: 11, name: "Lime" },
];
const BERRIES: Fruit[] = [
  { id: 20, name: "Blueberry" },
  { id: 21, name: "Raspberry" },
];

describe("createListboxGroup", () => {
  it("emits role=group and links aria-labelledby to its GroupLabel", async () => {
    const { container, dispose } = mount(() => (
      <GroupedListbox
        groups={[
          { label: "Citrus", values: CITRUS },
          { label: "Berries", values: BERRIES },
        ]}
        labelOf={label}
        options={fruitOptions()}
      />
    ));
    await vi.waitFor(() => expect(options(container)).toHaveLength(4));

    const groups = [...container.querySelectorAll<HTMLElement>('[role="group"]')];
    expect(groups).toHaveLength(2);

    // `createRegisteredId` publishes each label id on settle, so the linkage lands after mount.
    await vi.waitFor(() => {
      for (const group of groups) {
        const labelledby = group.getAttribute("aria-labelledby");
        expect(labelledby).toBeTruthy();
        const labelEl = group.querySelector<HTMLElement>("[data-group-label]");
        expect(labelEl?.id).toBe(labelledby);
      }
    });

    const citrus = groups[0] as HTMLElement;
    expect(citrus.querySelector("[data-group-label]")?.textContent).toBe("Citrus");
    await expectNoA11yViolations(container);
    dispose();
  });
});
