import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { I18nProvider } from "../../../i18n";
import { createDialog } from "../../root/dialog-root";
import { createDialogClose } from "../dialog-close";

// An icon-only close button (no visible text) so the accessible name comes solely from the default
// `aria-label` — the case the default is there to cover.
function IconCloseHarness(props: { ariaLabel?: string }) {
  const state = createDialog({ defaultOpen: true });
  const close = createDialogClose(state, { "aria-label": props.ariaLabel });
  return <button data-testid="close" {...close.props} />;
}

// A minimal open dialog: a close button, and a marker gated on `open()` so the test can observe
// that clicking Close actually closed the dialog.
function Harness(props: { onClick?: (event: MouseEvent) => void }) {
  const state = createDialog({ defaultOpen: true });
  const close = createDialogClose(state, { onClick: props.onClick });
  return (
    <>
      <button data-testid="close" {...close.props}>
        Close
      </button>
      <Show when={state.open()}>
        <span data-testid="open-marker" />
      </Show>
    </>
  );
}

describe("createDialogClose", () => {
  it("closes on click", async () => {
    const { container, dispose } = mount(() => <Harness />);
    expect(container.querySelector('[data-testid="open-marker"]')).toBeTruthy();

    await userEvent.click(page.getByTestId("close"));
    expect(container.querySelector('[data-testid="open-marker"]')).toBeNull();
    dispose();
  });

  it("runs the consumer's onClick first, and preventDefault cancels the close", async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { container, dispose } = mount(() => <Harness onClick={onClick} />);

    await userEvent.click(page.getByTestId("close"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(container.querySelector('[data-testid="open-marker"]')).toBeTruthy();
    dispose();
  });

  it("defaults to type=button and has no accessibility violations", async () => {
    const { container, dispose } = mount(() => <Harness />);
    const close = container.querySelector('[data-testid="close"]') as HTMLButtonElement;
    expect(close.getAttribute("type")).toBe("button");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("defaults aria-label to the localized `dialog.close` message", async () => {
    const { container, dispose } = mount(() => <IconCloseHarness />);
    const close = container.querySelector('[data-testid="close"]') as HTMLButtonElement;
    expect(close.getAttribute("aria-label")).toBe("Close");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("uses the French default under <I18nProvider locale='fr-FR'>", async () => {
    const { container, dispose } = mount(() => (
      <I18nProvider locale="fr-FR">
        <IconCloseHarness />
      </I18nProvider>
    ));
    const close = container.querySelector('[data-testid="close"]') as HTMLButtonElement;
    expect(close.getAttribute("aria-label")).toBe("Fermer");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("lets a consumer aria-label override the default", async () => {
    const { container, dispose } = mount(() => <IconCloseHarness ariaLabel="Dismiss dialog" />);
    const close = container.querySelector('[data-testid="close"]') as HTMLButtonElement;
    expect(close.getAttribute("aria-label")).toBe("Dismiss dialog");
    await expectNoA11yViolations(container);
    dispose();
  });
});
