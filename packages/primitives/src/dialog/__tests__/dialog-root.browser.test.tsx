import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { type CreateDialogOptions, type CreateDialogReturn, createDialog } from "../dialog-root";

// A browser test rather than a node one because the root hook owns the shared presence, and
// `createPresence` schedules a `requestAnimationFrame` on open — which node has no version of.
//
// `mount()` supplies the reactive owner that owns and disposes that effect, and renders nothing.
// The state writes below run *after* mount returns, outside any render body, so they don't trip
// Solid 2.0's `[REACTIVE_WRITE_IN_OWNED_SCOPE]` guard — which is why wrapping them in a bare
// `createRoot` would be wrong. Each is inside `flush(() => …)` because the client build defers a
// signal write to a microtask, so a plain read straight after would still see the old value.
function mountDialog(options?: CreateDialogOptions) {
  let dialog!: CreateDialogReturn;
  const { container, dispose } = mount(() => {
    dialog = createDialog(options);
    return null;
  });
  return { dialog: () => dialog, container, dispose };
}

describe("createDialog", () => {
  it("defaults to closed, modal, not-yet-modal, role=dialog", () => {
    const { dialog, dispose } = mountDialog();
    expect(dialog().open()).toBe(false);
    expect(dialog().modal()).toBe(true);
    expect(dialog().isModal()).toBe(false);
    expect(dialog().role()).toBe("dialog");
    dispose();
  });

  it("honors role=alertdialog", () => {
    const { dialog, dispose } = mountDialog({ role: "alertdialog" });
    expect(dialog().role()).toBe("alertdialog");
    dispose();
  });

  it("opens uncontrolled, flips isModal, and fires onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { dialog, dispose } = mountDialog({ onOpenChange });

    flush(() => dialog().setOpen(true));

    expect(dialog().open()).toBe(true);
    expect(dialog().isModal()).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    dispose();
  });

  it("stays non-modal when modal is false, even while open", () => {
    const { dialog, dispose } = mountDialog({ modal: false });
    flush(() => dialog().setOpen(true));

    expect(dialog().open()).toBe(true);
    expect(dialog().modal()).toBe(false);
    expect(dialog().isModal()).toBe(false);
    dispose();
  });

  it("honors a controlled `open`: setOpen fires onChange but does not fork internal state", () => {
    const [open, setOpen] = createSignal(false);
    const onOpenChange = vi.fn((next: boolean) => setOpen(next));
    const { dialog, dispose } = mountDialog({
      get open() {
        return open();
      },
      onOpenChange,
    });

    expect(dialog().open()).toBe(false);
    flush(() => dialog().setOpen(true));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Controlled: the read tracks the external signal, which onOpenChange advanced.
    expect(dialog().open()).toBe(true);
    dispose();
  });

  it("falls back to a generated popupId until one is registered", () => {
    const { dialog, dispose } = mountDialog();
    const generated = dialog().popupId();
    expect(generated).toBeTruthy();

    flush(() => dialog().setPopupId("custom-id"));
    expect(dialog().popupId()).toBe("custom-id");

    flush(() => dialog().setPopupId(undefined));
    expect(dialog().popupId()).toBe(generated);
    dispose();
  });

  it("exposes title/description id registration", () => {
    const { dialog, dispose } = mountDialog();
    expect(dialog().titleId()).toBeUndefined();
    expect(dialog().descriptionId()).toBeUndefined();

    flush(() => dialog().setTitleId("the-title"));
    flush(() => dialog().setDescriptionId("the-description"));

    expect(dialog().titleId()).toBe("the-title");
    expect(dialog().descriptionId()).toBe("the-description");
    dispose();
  });

  it("tracks a spared-element set, idempotently", () => {
    const { dialog, dispose } = mountDialog();
    const a = {} as Element;
    const b = {} as Element;

    flush(() => dialog().addSparedElement(a));
    flush(() => dialog().addSparedElement(a)); // idempotent
    flush(() => dialog().addSparedElement(b));
    expect(dialog().sparedElements()).toEqual([a, b]);

    flush(() => dialog().removeSparedElement(a));
    expect(dialog().sparedElements()).toEqual([b]);
    dispose();
  });

  it("exposes a shared content presence: exited + unmounted while closed", () => {
    const { dialog, dispose } = mountDialog();
    // Created eagerly while closed, so its first run observes `open === false` — the property that
    // lets `Dialog.Content` animate in (a lazily-created presence would latch to `entered`).
    expect(dialog().contentPresence.mounted()).toBe(false);
    expect(dialog().contentPresence.status()).toBe("exited");
    expect(dialog().contentElement()).toBeUndefined();
    dispose();
  });

  it("renders no DOM of its own", async () => {
    // The axe pass runs on the only tree there is — the empty container — and is trivially clean.
    // It stays because every browser test in this repo owes one.
    const { container, dispose } = mountDialog();
    expect(container.childNodes.length).toBe(0);
    await expectNoA11yViolations(container);
    dispose();
  });
});
