import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import type { CreateDialogReturn } from "../root/dialog-root";
import { createDialog } from "../root/dialog-root";
import { createDialogPortal } from "./dialog-portal";

// The portal hook returns no element props — the consumer renders the modal-backdrop element and
// wires `setModalBackdropRef` as its ref. This harness stands in for that markup.
function mountHarness(props: { open?: boolean; modal?: boolean }) {
  let state!: CreateDialogReturn;
  const result = mount(() => {
    state = createDialog({ defaultOpen: props.open ?? true, modal: props.modal });
    const portal = createDialogPortal(state);
    return (
      <Show when={portal.showModalBackdrop()}>
        <div data-testid="modal-backdrop" ref={portal.setModalBackdropRef} />
      </Show>
    );
  });
  return { ...result, state: () => state };
}

const backdropOf = (container: Element) =>
  container.querySelector('[data-testid="modal-backdrop"]');

describe("createDialogPortal", () => {
  it("shows the modal backdrop only when open and modal", () => {
    const closed = mountHarness({ open: false });
    expect(backdropOf(closed.container)).toBeNull();
    closed.dispose();

    const nonModal = mountHarness({ modal: false });
    expect(backdropOf(nonModal.container)).toBeNull();
    nonModal.dispose();

    const modal = mountHarness({});
    expect(backdropOf(modal.container)).toBeTruthy();
    modal.dispose();
  });

  it("registers the modal backdrop as a spared element", async () => {
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
