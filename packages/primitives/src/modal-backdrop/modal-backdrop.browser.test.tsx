import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { ModalBackdrop } from "./modal-backdrop";

/** What a real mouse click at the centre of `element` would actually hit. */
function topmostElementOver(element: Element): Element | null {
  const rect = element.getBoundingClientRect();
  return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

describe("ModalBackdrop", () => {
  it("renders a presentational, aria-hidden, viewport-covering element", () => {
    const { container, dispose } = mount(() => <ModalBackdrop />);

    const backdrop = container.querySelector("[data-solid-zero-modal-backdrop]");
    expect(backdrop).not.toBeNull();
    expect(backdrop?.getAttribute("role")).toBe("presentation");
    expect(backdrop?.getAttribute("aria-hidden")).toBe("true");

    const rect = (backdrop as HTMLElement).getBoundingClientRect();
    expect(rect.width).toBe(window.innerWidth);
    expect(rect.height).toBe(window.innerHeight);

    dispose();
  });

  it("blocks the pointer from reaching content behind it", async () => {
    const onBackgroundClick = vi.fn();
    const { dispose } = mount(() => (
      <>
        <button type="button" data-testid="behind" onClick={onBackgroundClick}>
          Behind
        </button>
        <ModalBackdrop />
      </>
    ));

    const behind = page.getByTestId("behind").element();
    const topmost = topmostElementOver(behind);

    expect(topmost).not.toBe(behind);
    expect((topmost as Element).hasAttribute("data-solid-zero-modal-backdrop")).toBe(true);
    expect(onBackgroundClick).not.toHaveBeenCalled();

    dispose();
  });

  it("lets a positioned sibling rendered after it stay interactive", async () => {
    // The stacking contract: everything the backdrop blocks comes before it, everything that
    // must stay live comes after it *and is positioned*. A static element after it is still
    // painted beneath — see modal-backdrop.md.
    const onClick = vi.fn();
    const { dispose } = mount(() => (
      <>
        <ModalBackdrop />
        <button type="button" data-testid="above" style={{ position: "fixed" }} onClick={onClick}>
          Above
        </button>
      </>
    ));

    const above = page.getByTestId("above");
    expect(topmostElementOver(above.element())).toBe(above.element());

    await userEvent.click(above);
    expect(onClick).toHaveBeenCalledOnce();

    dispose();
  });

  it("hands its element to `ref`, so a hide-outside layer can spare it", () => {
    // Load-bearing: an `inert` element is transparent to hit testing, so a backdrop that let
    // `createHideOutside` hide it would silently stop blocking the pointer.
    let received: HTMLDivElement | undefined;
    const { container, dispose } = mount(() => <ModalBackdrop ref={(el) => (received = el)} />);

    expect(received).toBe(container.querySelector("[data-solid-zero-modal-backdrop]"));
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <ModalBackdrop />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
