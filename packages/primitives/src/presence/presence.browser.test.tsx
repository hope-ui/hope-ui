import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { createSignal, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createPresence } from "./presence";

function TestHarness(props: { present: () => boolean; withTransition?: boolean }) {
  let ref: HTMLDivElement | undefined;
  const { mounted, status } = createPresence({ present: props.present, ref: () => ref });

  return (
    <Show when={mounted()}>
      <div
        data-testid="popup"
        data-status={status()}
        ref={ref}
        style={
          props.withTransition
            ? { transition: "opacity 150ms linear", opacity: status() === "exiting" ? "0" : "1" }
            : undefined
        }
      >
        content
      </div>
    </Show>
  );
}

function popupOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector('[data-testid="popup"]');
}

describe("createPresence", () => {
  it("is not mounted when present starts false", () => {
    const [present] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness present={present} />);

    expect(popupOf(container)).toBeNull();
    dispose();
  });

  it("mounts immediately and transitions to 'entered' when present becomes true", async () => {
    const [present, setPresent] = createSignal(false);
    const { container, dispose } = mount(() => <TestHarness present={present} />);

    setPresent(true);
    await vi.waitFor(() => expect(popupOf(container)).toBeTruthy());
    await vi.waitFor(() => expect(popupOf(container)?.getAttribute("data-status")).toBe("entered"));

    dispose();
  });

  it("unmounts immediately when present becomes false and there is no CSS transition/animation", async () => {
    const [present, setPresent] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness present={present} />);

    await vi.waitFor(() => expect(popupOf(container)).toBeTruthy());
    setPresent(false);
    await vi.waitFor(() => expect(popupOf(container)).toBeNull());

    dispose();
  });

  it("stays mounted with status 'exiting' until the CSS transition ends, then unmounts", async () => {
    const [present, setPresent] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness present={present} withTransition />);

    await vi.waitFor(() => expect(popupOf(container)).toBeTruthy());
    setPresent(false);

    await vi.waitFor(() => expect(popupOf(container)?.getAttribute("data-status")).toBe("exiting"));
    expect(popupOf(container)).toBeTruthy();

    await vi.waitFor(() => expect(popupOf(container)).toBeNull(), { timeout: 2000 });

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const [present] = createSignal(true);
    const { container, dispose } = mount(() => <TestHarness present={present} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
