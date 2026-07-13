import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import type { CreateDialogReturn } from "../../root/dialog-root";
import { createDialog } from "../../root/dialog-root";
import { createDialogBackdrop } from "../dialog-backdrop";

function mountHarness(props: {
  open?: boolean;
  role?: JSX.HTMLAttributes<HTMLDivElement>["role"];
}) {
  let state!: CreateDialogReturn;
  const result = mount(() => {
    state = createDialog({ defaultOpen: props.open ?? true });
    const backdrop = createDialogBackdrop(state, { role: props.role });
    return (
      <Show when={backdrop.mounted()}>
        <div data-testid="backdrop" {...backdrop.props} ref={backdrop.setRef} />
      </Show>
    );
  });
  return { ...result, state: () => state };
}

const backdropOf = (container: Element) => container.querySelector('[data-testid="backdrop"]');

describe("createDialogBackdrop", () => {
  it("is not mounted while closed", () => {
    const { container, dispose } = mountHarness({ open: false });
    expect(backdropOf(container)).toBeNull();
    dispose();
  });

  it("mounts while open with role=presentation and a data-presence attribute", () => {
    const { container, dispose } = mountHarness({});
    const backdrop = backdropOf(container) as HTMLElement;

    expect(backdrop).toBeTruthy();
    expect(backdrop.getAttribute("role")).toBe("presentation");
    expect(backdrop.getAttribute("data-presence")).toBeTruthy();
    dispose();
  });

  it("lets a consumer role win", () => {
    const { container, dispose } = mountHarness({ role: "none" });
    expect((backdropOf(container) as HTMLElement).getAttribute("role")).toBe("none");
    dispose();
  });

  it("registers its element as spared (so hide-outside won't inert it)", async () => {
    const { container, state, dispose } = mountHarness({});
    const backdrop = backdropOf(container) as HTMLElement;

    await vi.waitFor(() => expect(state().sparedElements()).toContain(backdrop));
    dispose();
  });

  it("has no accessibility violations", async () => {
    const { container, dispose } = mountHarness({});
    await expectNoA11yViolations(container);
    dispose();
  });
});
