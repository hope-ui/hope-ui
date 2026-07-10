import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Dialog } from "./Dialog";

function FullDialog(props: { defaultOpen?: boolean }) {
  return (
    <Dialog.Root defaultOpen={props.defaultOpen}>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Dialog title</Dialog.Title>
          <Dialog.Description>Dialog description</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

describe("Dialog SSR", () => {
  it("resolves renderToStringAsync without throwing while closed", async () => {
    const html = await renderToStringAsync(() => <FullDialog />);
    expect(typeof html).toBe("string");
  });

  it("resolves renderToStringAsync without throwing while defaultOpen", async () => {
    // The critical case: @solidjs/web's Portal throws server-side, so an open dialog
    // (whose Backdrop/Popup would otherwise portal into document.body) must not crash
    // the render. Dialog.Portal's isServer guard is what makes this pass.
    const html = await renderToStringAsync(() => <FullDialog defaultOpen />);
    expect(typeof html).toBe("string");
  });

  it("renders the trigger with aria-expanded reflecting the closed state", async () => {
    const html = await renderToStringAsync(() => <FullDialog />);
    expect(html).toContain("Open");
    expect(html).toMatch(/aria-expanded="false"/);
  });

  it("omits portaled content from the SSR output even when defaultOpen", async () => {
    const html = await renderToStringAsync(() => <FullDialog defaultOpen />);
    expect(html).not.toContain("Dialog title");
  });
});
