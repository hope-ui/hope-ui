import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { type CreateButtonOptions, createButton } from "../create-button";

/** A native `<button>` driven by `createButton`. */
function NativeButton(props: { options?: CreateButtonOptions<HTMLButtonElement> }) {
  const { buttonProps, setRef } = createButton<HTMLButtonElement>(props.options ?? {});
  return (
    <button data-testid="target" ref={setRef} {...buttonProps}>
      Press me
    </button>
  );
}

/** A `render`-ed anchor (non-native) driven by `createButton`. */
function AnchorButton(props: { options?: CreateButtonOptions<HTMLAnchorElement> }) {
  const { buttonProps, setRef } = createButton<HTMLAnchorElement>(props.options ?? {});
  return (
    <a href="/docs" data-testid="target" ref={setRef} {...buttonProps}>
      Link button
    </a>
  );
}

function alwaysTrue(): Accessor<boolean> {
  const [value] = createSignal(true);
  return value;
}

describe("createButton — native", () => {
  it("sets type=button and no role/aria-disabled", async () => {
    const { dispose } = mount(() => <NativeButton />);

    const target = page.getByTestId("target");
    await expect.element(target).toHaveAttribute("type", "button");
    await expect.element(target).not.toHaveAttribute("role");
    await expect.element(target).not.toHaveAttribute("aria-disabled");
    dispose();
  });

  it("uses the native disabled attribute — without a redundant aria-disabled", async () => {
    const { dispose } = mount(() => <NativeButton options={{ disabled: alwaysTrue() }} />);

    const target = page.getByRole("button", { name: "Press me" });
    await expect.element(target).toBeDisabled();
    await expect.element(target).not.toHaveAttribute("aria-disabled");
    dispose();
  });

  it("activates via Enter and Space through the native click", async () => {
    const onClick = vi.fn();
    const { dispose } = mount(() => <NativeButton options={{ onClick: () => onClick }} />);

    page.getByTestId("target").element().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    dispose();
  });
});

describe("createButton — non-native (render-ed anchor)", () => {
  it("adds role=button and tabIndex=0, and no type/disabled attribute", async () => {
    const { dispose } = mount(() => <AnchorButton options={{ nativeButton: () => false }} />);

    const target = page.getByTestId("target");
    await expect.element(target).toHaveAttribute("role", "button");
    await expect.element(target).toHaveAttribute("tabindex", "0");
    await expect.element(target).not.toHaveAttribute("type");
    await expect.element(target).not.toHaveAttribute("disabled");
    dispose();
  });

  it("activates via synthesized Enter and Space clicks", async () => {
    // preventDefault so the (enabled) anchor's activation doesn't navigate the test iframe;
    // the spy still records each click, which is what we assert.
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { dispose } = mount(() => (
      <AnchorButton options={{ nativeButton: () => false, onClick: () => onClick }} />
    ));

    page.getByTestId("target").element().focus();
    // Enter activates an anchor natively; Space is synthesized. Both reach onClick once each.
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("marks aria-disabled, drops from the tab order, and blocks activation while disabled", async () => {
    const onClick = vi.fn();
    const { dispose } = mount(() => (
      <AnchorButton
        options={{ nativeButton: () => false, disabled: alwaysTrue(), onClick: () => onClick }}
      />
    ));

    const target = page.getByTestId("target");
    await expect.element(target).toHaveAttribute("aria-disabled", "true");
    await expect.element(target).not.toHaveAttribute("tabindex");

    // Playwright refuses to drive a click on an aria-disabled element, so dispatch a raw one —
    // the programmatic / screen-reader path the guard must block anyway. The consumer's onClick
    // never runs, and the default action (anchor navigation) is prevented.
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    target.element().dispatchEvent(clickEvent);
    expect(onClick).not.toHaveBeenCalled();
    expect(clickEvent.defaultPrevented).toBe(true);
    dispose();
  });
});

describe("createButton — dev mismatch warning", () => {
  it("warns when nativeButton is true but a non-button is rendered", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Anchor element with the default nativeButton=true — the misuse the warning catches.
    const { dispose } = mount(() => <AnchorButton />);

    await vi.waitFor(() =>
      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining("nativeButton is true")),
    );
    dispose();
    consoleWarn.mockRestore();
  });

  it("does not warn when nativeButton matches the rendered element", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { dispose } = mount(() => <NativeButton />);

    // Give the mismatch effect a chance to run before asserting it stayed silent.
    await expect.element(page.getByTestId("target")).toBeInTheDocument();
    expect(consoleWarn).not.toHaveBeenCalled();
    dispose();
    consoleWarn.mockRestore();
  });
});

describe("createButton — accessibility", () => {
  it("has no baseline accessibility violations as a native button", async () => {
    const { container, dispose } = mount(() => <NativeButton />);
    await expectNoA11yViolations(container);
    dispose();
  });

  it("has no baseline accessibility violations as a non-native button", async () => {
    const { container, dispose } = mount(() => (
      <AnchorButton options={{ nativeButton: () => false }} />
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});
