import { expectNoA11yViolations, mount } from "@enara-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { hydrate } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Button } from "../button";
import ssrFixture from "./__fixtures__/button-ssr.html?raw";

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

  it("keeps type=button when a wrapper forwards an unset `type` prop", async () => {
    // Regression: `merge({ type: "button" }, props)` resolved by key *presence*, so an
    // explicitly-`undefined` `type` beat the default and the button became a submit button
    // inside a form. `withDefaults` resolves with `??`. See `withDefaults`' doc.
    const { dispose } = mount(() => <Button type={undefined}>Click me</Button>);

    await expect
      .element(page.getByRole("button", { name: "Click me" }))
      .toHaveAttribute("type", "button");
    dispose();
  });

  it("still lets an explicit `type` override the default", async () => {
    const { dispose } = mount(() => <Button type="submit">Submit</Button>);

    await expect
      .element(page.getByRole("button", { name: "Submit" }))
      .toHaveAttribute("type", "submit");
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

describe("Button hydration", () => {
  /**
   * `hydrate()` reads `globalThis._$HY` unconditionally. A real app gets it from
   * `generateHydrationScript()`, which is a no-op (`voidFn`) in `@solidjs/web`'s client build
   * — so a browser test has to supply it. Only three fields are read on this path:
   * `.done`, `.completed` and `.events`. `.r` is the *resource/asset* registry consulted by
   * `sharedConfig.load`; the element registry `getNextElement()` looks in is built separately
   * by `gatherHydratable()`, which scans the container for `[_hk]` attributes. An empty `.r`
   * is therefore correct, not a bug.
   */
  function bootstrapHydration(): () => void {
    const globals = globalThis as { _$HY?: unknown };
    globals._$HY = { events: [], completed: new WeakSet(), r: {} };
    return () => {
      globals._$HY = undefined;
    };
  }

  function mountServerHtml(html: string): { container: HTMLElement; remove: () => void } {
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    return { container, remove: () => container.remove() };
  }

  it("hydrates the server HTML in place, without a mismatch or a second render", async () => {
    // `ssrFixture` is genuine server output — `Button.ssr.test.tsx` asserts it byte-for-byte
    // against a real `renderToStringAsync` in the `ssr` project, where both `solid-js` and
    // `@solidjs/web` resolve to their server builds. Here they resolve to the client builds,
    // whose `renderToStringAsync` is a stub that `console.error`s and returns `undefined`;
    // rendering the fixture in-process would silently hydrate the string "undefined".
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const teardownHydration = bootstrapHydration();
    const { container, remove } = mountServerHtml(ssrFixture);

    const serverButton = container.querySelector("button");
    const dispose = hydrate(() => <Button>Click me</Button>, container);

    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();

    // Hydration reuses the server's node. If it had fallen back to a client render, there
    // would be two buttons here, or one that isn't the node the server sent.
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(container.querySelector("button")).toBe(serverButton);

    dispose();
    remove();
    teardownHydration();
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it("leaves the hydrated button interactive", async () => {
    const onClick = vi.fn();
    const teardownHydration = bootstrapHydration();
    const { container, remove } = mountServerHtml(ssrFixture);

    const dispose = hydrate(() => <Button onClick={onClick}>Click me</Button>, container);

    await page.getByRole("button", { name: "Click me" }).click();
    expect(onClick).toHaveBeenCalledOnce();

    dispose();
    remove();
    teardownHydration();
  });

  it("has no accessibility violations after hydrating", async () => {
    const teardownHydration = bootstrapHydration();
    const { container, remove } = mountServerHtml(ssrFixture);

    const dispose = hydrate(() => <Button>Click me</Button>, container);
    await expectNoA11yViolations(container);

    dispose();
    remove();
    teardownHydration();
  });
});
