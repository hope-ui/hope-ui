import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import type { CreateDialogReturn } from "../root/dialog-root";
import { createDialog } from "../root/dialog-root";
import { createDialogDescription } from "./dialog-description";

function mountHarness(props: { id?: string }) {
  let state!: CreateDialogReturn;
  const result = mount(() => {
    state = createDialog();
    const description = createDialogDescription(state, { id: props.id });
    return (
      <p data-testid="description" {...description.props}>
        Description
      </p>
    );
  });
  return { ...result, state: () => state };
}

const descriptionOf = (container: Element) =>
  container.querySelector('[data-testid="description"]') as HTMLParagraphElement;

describe("createDialogDescription", () => {
  it("generates an id and registers it on the dialog's descriptionId", async () => {
    const { container, state, dispose } = mountHarness({});
    const generatedId = descriptionOf(container).id;

    expect(generatedId).toBeTruthy();
    await vi.waitFor(() => expect(state().descriptionId()).toBe(generatedId));
    dispose();
  });

  it("lets a consumer id win, and registers that one", async () => {
    const { container, state, dispose } = mountHarness({ id: "my-description" });

    expect(descriptionOf(container).id).toBe("my-description");
    await vi.waitFor(() => expect(state().descriptionId()).toBe("my-description"));
    dispose();
  });

  it("has no accessibility violations", async () => {
    const { container, dispose } = mountHarness({});
    await expectNoA11yViolations(container);
    dispose();
  });
});
