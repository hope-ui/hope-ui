import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { createDialogContent } from "../dialog-content";
import type { CreateDialogReturn } from "../dialog-root";
import { createDialog } from "../dialog-root";
import { createDialogTitle } from "../dialog-title";

function TitleInContent(props: { state: CreateDialogReturn }) {
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
  closeOnEscape?: boolean;
  closeOnInteractOutside?: boolean;
}) {
  let state!: CreateDialogReturn;
  const result = mount(() => {
    state = createDialog({
      defaultOpen: props.open ?? true,
      modal: props.modal,
      closeOnEscape: props.closeOnEscape,
      closeOnInteractOutside: props.closeOnInteractOutside,
    });
    const content = createDialogContent(state, { "aria-labelledby": props.ariaLabelledby });
    return (
      <Show when={content.mounted()}>
        <div
          data-testid="content"
          style={{ position: "fixed" }}
          {...content.props}
          ref={content.setRef}
        >
          {props.withTitle ? <TitleInContent state={state} /> : null}
          <p>Body</p>
        </div>
      </Show>
    );
  });
  return { ...result, state: () => state };
}

const contentOf = (container: Element) =>
  container.querySelector('[data-testid="content"]') as HTMLElement | null;

describe("createDialogContent", () => {
  it("is not mounted while closed, and mounts (role=dialog, data-presence) while open", () => {
    const closed = mountHarness({ open: false });
    expect(contentOf(closed.container)).toBeNull();
    closed.dispose();

    const open = mountHarness({});
    const content = contentOf(open.container) as HTMLElement;
    expect(content).toBeTruthy();
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("data-presence")).toBeTruthy();
    open.dispose();
  });

  it("sets aria-modal only while modal", () => {
    const modal = mountHarness({ modal: true });
    expect(contentOf(modal.container)?.getAttribute("aria-modal")).toBe("true");
    modal.dispose();

    const nonModal = mountHarness({ modal: false });
    expect(contentOf(nonModal.container)?.getAttribute("aria-modal")).toBeNull();
    nonModal.dispose();
  });

  it("falls back aria-labelledby to a mounted Title's id", async () => {
    const { container, dispose } = mountHarness({ modal: false, withTitle: true });
    const titleId = (container.querySelector('[data-testid="title"]') as HTMLElement).id;

    await vi.waitFor(() =>
      expect(contentOf(container)?.getAttribute("aria-labelledby")).toBe(titleId),
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
      expect(contentOf(container)?.getAttribute("aria-labelledby")).toBe("external-heading"),
    );
    dispose();
  });

  it("focuses the initialFocus target on open, over the first focusable descendant", async () => {
    let target!: HTMLButtonElement;
    const { container, dispose } = mount(() => {
      const state = createDialog({ defaultOpen: true, modal: true });
      // The accessor is read lazily by the focus trap after mount, so `target` (assigned by the
      // ref below during the same mount) is resolved by the time focus is applied.
      const content = createDialogContent(state, { initialFocus: () => target });
      return (
        <Show when={content.mounted()}>
          <div
            data-testid="content"
            style={{ position: "fixed" }}
            {...content.props}
            ref={content.setRef}
          >
            <button type="button">first</button>
            <button type="button" ref={target}>
              target
            </button>
          </div>
        </Show>
      );
    });

    await vi.waitFor(() => expect(document.activeElement).toBe(target));
    // `initialFocus` is a control prop, never an attribute on the surface.
    expect(contentOf(container)?.hasAttribute("initialfocus")).toBe(false);
    dispose();
  });

  it("dismisses on Escape", async () => {
    const { container, dispose } = mountHarness({ withTitle: true });
    expect(contentOf(container)).toBeTruthy();

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    dispose();
  });

  it("dismisses on an outside pointerdown", async () => {
    // `document.body` sits outside the content, so `createDismissable`'s capture-phase pointerdown
    // handler (which dismisses unless the target is inside the content) fires. This is the positive
    // control the `closeOnInteractOutside={false}` case below negates.
    const { container, dispose } = mountHarness({ withTitle: true });
    expect(contentOf(container)).toBeTruthy();

    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await vi.waitFor(() => expect(contentOf(container)).toBeNull());
    dispose();
  });

  it("does NOT dismiss on Escape when closeOnEscape is false", async () => {
    // `Dialog.Root`/`createDialog` sets the toggle once; `createDialogContent` forwards it to
    // `createDismissable`'s `dismissOnEscape` as a getter (so it stays reactive).
    const { container, dispose } = mountHarness({ withTitle: true, closeOnEscape: false });
    expect(contentOf(container)).toBeTruthy();

    await userEvent.keyboard("{Escape}");
    // Give the dismiss path a frame to (not) run before asserting the content survived.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(contentOf(container)).toBeTruthy();
    dispose();
  });

  it("does NOT dismiss on an outside pointerdown when closeOnInteractOutside is false", async () => {
    const { container, dispose } = mountHarness({
      withTitle: true,
      closeOnInteractOutside: false,
    });
    expect(contentOf(container)).toBeTruthy();

    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(contentOf(container)).toBeTruthy();
    dispose();
  });

  it("has no accessibility violations (non-modal, labelled)", async () => {
    const { container, dispose } = mountHarness({ modal: false, withTitle: true });
    await expectNoA11yViolations(container);
    dispose();
  });
});
