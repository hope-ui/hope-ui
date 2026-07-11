import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderElement } from "./render";

describe("renderElement", () => {
  it("renders the default `as` element with the given props", async () => {
    const { dispose } = mount(() =>
      renderElement({ as: "button", props: { type: "button" as const, children: "click" } }),
    );

    await expect.element(page.getByRole("button")).toBeInTheDocument();
    dispose();
  });

  it("invokes the `render` function with the computed props instead of `as`", async () => {
    const renderFn = vi.fn((p: Record<string, unknown>) => <a href="/docs" {...p} />);
    const { dispose } = mount(() =>
      renderElement({ as: "button", props: { children: "link" }, render: renderFn }),
    );

    expect(renderFn).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole("link", { name: "link" })).toBeInTheDocument();
    dispose();
  });

  it("forwards the computed props onto the element the `render` function returns", async () => {
    // The reason `RenderProp` is function-only: a JSX *element* would be an already-built
    // DOM node, and every computed prop below (onClick, aria-*) would be silently dropped.
    const onClick = vi.fn();
    const { dispose } = mount(() =>
      renderElement({
        as: "button",
        props: {
          type: "button" as const,
          "aria-expanded": "true" as const,
          onClick,
          children: "go",
        },
        render: (p) => <button {...p} data-testid="custom" />,
      }),
    );

    const button = page.getByTestId("custom");
    await expect.element(button).toHaveAttribute("aria-expanded", "true");
    await button.click();
    expect(onClick).toHaveBeenCalledOnce();
    dispose();
  });

  it("merges an internal `ref` with a consumer-supplied one", async () => {
    let internal: HTMLElement | undefined;
    let consumer: HTMLElement | undefined;

    const { dispose } = mount(() =>
      renderElement<{ children: string; ref?: (el: HTMLElement) => void }, HTMLElement>({
        as: "button",
        props: { children: "both refs", ref: (el) => (consumer = el) },
        ref: (el) => (internal = el),
      }),
    );

    await expect.element(page.getByRole("button", { name: "both refs" })).toBeInTheDocument();
    expect(internal).toBeInstanceOf(HTMLButtonElement);
    expect(consumer).toBe(internal);
    dispose();
  });

  it("applies the internal `ref` when the consumer supplied none", async () => {
    let internal: HTMLElement | undefined;

    const { dispose } = mount(() =>
      renderElement<{ children: string }, HTMLElement>({
        as: "button",
        props: { children: "internal only" },
        ref: (el) => (internal = el),
      }),
    );

    await expect.element(page.getByRole("button", { name: "internal only" })).toBeInTheDocument();
    expect(internal).toBeInstanceOf(HTMLButtonElement);
    dispose();
  });

  it("merges refs onto the element a `render` function returns", async () => {
    let internal: HTMLElement | undefined;

    const { dispose } = mount(() =>
      renderElement<{ children: string }, HTMLElement>({
        as: "button",
        props: { children: "rendered" },
        render: (p) => <a href="/docs" {...p} />,
        ref: (el) => (internal = el),
      }),
    );

    await expect.element(page.getByRole("link", { name: "rendered" })).toBeInTheDocument();
    expect(internal).toBeInstanceOf(HTMLAnchorElement);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    // Every primitive that puts real DOM on the page gets a baseline axe run, enforced by
    // `check:coverage-parity`. `renderElement` is the one every public component's markup
    // flows through, so a defect here is a defect in all of them.
    const { container, dispose } = mount(() =>
      renderElement({ as: "button", props: { type: "button" as const, children: "click" } }),
    );

    await expectNoA11yViolations(container);
    dispose();
  });
});
