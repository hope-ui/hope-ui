import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { CreateDialogReturn } from "../root/dialog-root";
import { createDialog } from "../root/dialog-root";
import { createDialogTitle } from "../title/dialog-title";
import { createDialogPopup } from "./dialog-popup";

function TitleInPopup(props: { state: CreateDialogReturn }) {
  const title = createDialogTitle(props.state, {});
  return (
    <h2 data-testid="title" {...title.props}>
      Title
    </h2>
  );
}

function mountHarness(props: {
  open?: boolean;
  modal?: boolean;
  withTitle?: boolean;
  ariaLabelledby?: string;
}) {
  let state!: CreateDialogReturn;
  const result = mount(() => {
    state = createDialog({ defaultOpen: props.open ?? true, modal: props.modal });
    const popup = createDialogPopup(state, { "aria-labelledby": props.ariaLabelledby });
    return (
      <Show when={popup.mounted()}>
        <div data-testid="popup" style={{ position: "fixed" }} {...popup.props} ref={popup.setRef}>
          {props.withTitle ? <TitleInPopup state={state} /> : null}
          <p>Body</p>
        </div>
      </Show>
    );
  });
  return { ...result, state: () => state };
}

const popupOf = (container: Element) =>
  container.querySelector('[data-testid="popup"]') as HTMLElement | null;

describe("createDialogPopup", () => {
  it("is not mounted while closed, and mounts (role=dialog, data-presence) while open", () => {
    const closed = mountHarness({ open: false });
    expect(popupOf(closed.container)).toBeNull();
    closed.dispose();

    const open = mountHarness({});
    const popup = popupOf(open.container) as HTMLElement;
    expect(popup).toBeTruthy();
    expect(popup.getAttribute("role")).toBe("dialog");
    expect(popup.getAttribute("data-presence")).toBeTruthy();
    open.dispose();
  });

  it("sets aria-modal only while modal", () => {
    const modal = mountHarness({ modal: true });
    expect(popupOf(modal.container)?.getAttribute("aria-modal")).toBe("true");
    modal.dispose();

    const nonModal = mountHarness({ modal: false });
    expect(popupOf(nonModal.container)?.getAttribute("aria-modal")).toBeNull();
    nonModal.dispose();
  });

  it("falls back aria-labelledby to a mounted Title's id", async () => {
    const { container, dispose } = mountHarness({ modal: false, withTitle: true });
    const titleId = (container.querySelector('[data-testid="title"]') as HTMLElement).id;

    await vi.waitFor(() =>
      expect(popupOf(container)?.getAttribute("aria-labelledby")).toBe(titleId),
    );
    dispose();
  });

  it("lets a consumer aria-labelledby win over the Title", async () => {
    const { container, dispose } = mountHarness({
      modal: false,
      withTitle: true,
      ariaLabelledby: "external-heading",
    });
    await vi.waitFor(() =>
      expect(popupOf(container)?.getAttribute("aria-labelledby")).toBe("external-heading"),
    );
    dispose();
  });

  it("dismisses on Escape", async () => {
    const { container, dispose } = mountHarness({ withTitle: true });
    expect(popupOf(container)).toBeTruthy();

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(popupOf(container)).toBeNull());
    dispose();
  });

  it("has no accessibility violations (non-modal, labelled)", async () => {
    const { container, dispose } = mountHarness({ modal: false, withTitle: true });
    await expectNoA11yViolations(container);
    dispose();
  });
});
