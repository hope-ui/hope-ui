import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import type { CreateDialogReturn } from "../dialog-root";
import { createDialog } from "../dialog-root";
import { createDialogTitle } from "../dialog-title";

// The harness captures the shared state so the test can observe the id registration
// (`createRegisteredId` defers the write via `onSettled`, so assertions use `vi.waitFor`).
function mountHarness(props: { id?: string }) {
  let state!: CreateDialogReturn;
  const result = mount(() => {
    state = createDialog();
    const title = createDialogTitle(state, { id: props.id });
    return (
      <h2 data-testid="title" {...title.props}>
        Title
      </h2>
    );
  });
  return { ...result, state: () => state };
}

const titleOf = (container: Element) =>
  container.querySelector('[data-testid="title"]') as HTMLHeadingElement;

describe("createDialogTitle", () => {
  it("generates an id and registers it on the dialog's titleId", async () => {
    const { container, state, dispose } = mountHarness({});
    const generatedId = titleOf(container).id;

    expect(generatedId).toBeTruthy();
    await vi.waitFor(() => expect(state().titleId()).toBe(generatedId));
    dispose();
  });

  it("lets a consumer id win, and registers that one", async () => {
    const { container, state, dispose } = mountHarness({ id: "my-title" });

    expect(titleOf(container).id).toBe("my-title");
    await vi.waitFor(() => expect(state().titleId()).toBe("my-title"));
    dispose();
  });

  it("has no accessibility violations", async () => {
    const { container, dispose } = mountHarness({});
    await expectNoA11yViolations(container);
    dispose();
  });
});
