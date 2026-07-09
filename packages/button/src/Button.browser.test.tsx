import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Button } from "./Button";

describe("Button", () => {
  it("renders a native button element with type=button", async () => {
    const { dispose } = mount(() => <Button>Click me</Button>);

    const button = page.getByRole("button", { name: "Click me" });
    await expect.element(button).toBeInTheDocument();
    await expect.element(button).toHaveAttribute("type", "button");
    dispose();
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    const { dispose } = mount(() => <Button onClick={onClick}>Click me</Button>);

    await page.getByRole("button", { name: "Click me" }).click();
    expect(onClick).toHaveBeenCalledOnce();
    dispose();
  });

  it("sets disabled and aria-disabled together", async () => {
    const { dispose } = mount(() => <Button disabled>Click me</Button>);

    const button = page.getByRole("button", { name: "Click me" });
    await expect.element(button).toBeDisabled();
    await expect.element(button).toHaveAttribute("aria-disabled", "true");
    dispose();
  });

  it("supports the render prop for polymorphic rendering", async () => {
    // Rendering as a fundamentally different element (button -> anchor) is a deliberate
    // cross-element escape hatch: the `render` prop is typed against Button's own props
    // for the common case (wrapping/restyling a button), so switching element kinds
    // needs an explicit assertion here, same as it would for a consumer doing this.
    const { dispose } = mount(() => (
      <Button
        render={(p) => (
          <a href="/docs" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
        )}
      >
        Link button
      </Button>
    ));

    await expect.element(page.getByRole("link", { name: "Link button" })).toBeInTheDocument();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <Button>Click me</Button>);
    await expectNoA11yViolations(container);
    dispose();
  });
});
