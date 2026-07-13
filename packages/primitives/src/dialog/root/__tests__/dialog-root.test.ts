import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createDialog } from "../dialog-root";

// `createDialog` is the root state hook — pure logic, no DOM — so it lives in the `unit` project.
// No `createRoot`: SolidJS 2.0 throws [REACTIVE_WRITE_IN_OWNED_SCOPE] on a synchronous signal write
// inside a root's body. `flush(() => ...)` around each write because the client build defers writes
// to a microtask (see controllable.test.ts). `createUniqueId` returns `cl-N` here (client build),
// so the hook needs no owner.

describe("createDialog", () => {
  it("defaults to closed, modal, and not-yet-modal", () => {
    const dialog = createDialog();
    expect(dialog.open()).toBe(false);
    expect(dialog.modal()).toBe(true);
    expect(dialog.isModal()).toBe(false);
  });

  it("opens uncontrolled, flips isModal, and fires onOpenChange", () => {
    const onOpenChange = vi.fn();
    const dialog = createDialog({ onOpenChange });

    flush(() => dialog.setOpen(true));

    expect(dialog.open()).toBe(true);
    expect(dialog.isModal()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("stays non-modal when modal is false, even while open", () => {
    const dialog = createDialog({ modal: false });
    flush(() => dialog.setOpen(true));

    expect(dialog.open()).toBe(true);
    expect(dialog.modal()).toBe(false);
    expect(dialog.isModal()).toBe(false);
  });

  it("honors a controlled `open`: setOpen fires onChange but does not fork internal state", () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn((next: boolean) => setOpen(next));
    const dialog = createDialog({
      get open() {
        return open();
      },
      onOpenChange,
    });

    expect(dialog.open()).toBe(false);
    flush(() => dialog.setOpen(true));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Controlled: the read tracks the external signal, which onOpenChange advanced.
    expect(dialog.open()).toBe(true);
  });

  it("falls back to a generated popupId until one is registered", () => {
    const dialog = createDialog();
    const generated = dialog.popupId();
    expect(generated).toBeTruthy();

    flush(() => dialog.setPopupId("custom-id"));
    expect(dialog.popupId()).toBe("custom-id");

    flush(() => dialog.setPopupId(undefined));
    expect(dialog.popupId()).toBe(generated);
  });

  it("exposes title/description id registration", () => {
    const dialog = createDialog();
    expect(dialog.titleId()).toBeUndefined();
    expect(dialog.descriptionId()).toBeUndefined();

    flush(() => dialog.setTitleId("the-title"));
    flush(() => dialog.setDescriptionId("the-description"));

    expect(dialog.titleId()).toBe("the-title");
    expect(dialog.descriptionId()).toBe("the-description");
  });

  it("tracks a spared-element set, idempotently", () => {
    const dialog = createDialog();
    const a = {} as Element;
    const b = {} as Element;

    flush(() => dialog.addSparedElement(a));
    flush(() => dialog.addSparedElement(a)); // idempotent
    flush(() => dialog.addSparedElement(b));
    expect(dialog.sparedElements()).toEqual([a, b]);

    flush(() => dialog.removeSparedElement(a));
    expect(dialog.sparedElements()).toEqual([b]);
  });
});
