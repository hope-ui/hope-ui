import { mount } from "@solid-zero/internal-test-utils";
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

  it("renders a static JSX `render` override as-is", async () => {
    const { dispose } = mount(() =>
      renderElement({
        as: "button",
        props: { children: "ignored" },
        render: <span data-testid="static-override">static</span>,
      }),
    );

    await expect.element(page.getByTestId("static-override")).toBeInTheDocument();
    dispose();
  });
});
