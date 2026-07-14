import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { hydrate } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { Box } from "../box";
import ssrFixture from "./__fixtures__/box-ssr.html?raw";

describe("Box", () => {
  it("renders a div by default and maps style props to atomic classes", async () => {
    const { container, dispose } = mount(() => (
      <Box p="4" bg="primary">
        Box content
      </Box>
    ));

    const el = container.querySelector("div");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("Box content");
    expect(el?.classList.contains("p_4")).toBe(true);
    expect(el?.classList.contains("bg_primary")).toBe(true);
    dispose();
  });

  it("merges a consumer class after the style-prop classes", async () => {
    const { container, dispose } = mount(() => (
      <Box p="4" class="custom">
        Box content
      </Box>
    ));

    const el = container.querySelector("div");
    expect(el?.classList.contains("p_4")).toBe(true);
    expect(el?.classList.contains("custom")).toBe(true);
    dispose();
  });

  it("applies the `css` escape-hatch prop as real atomic classes (not a nested `css` key)", async () => {
    // Regression guard: renderStyled must pass `css` as a *sibling* css() arg, not fold it in as a
    // `css` KEY — otherwise Panda emits garbage like `color:css_red` that matches no rule.
    const { container, dispose } = mount(() => (
      <Box p="4" css={{ color: "red.300" }}>
        Box content
      </Box>
    ));

    const el = container.querySelector("div");
    expect(el?.classList.contains("p_4")).toBe(true);
    expect(el?.classList.contains("c_red.300")).toBe(true);
    // No nested-`css`-key garbage.
    expect(
      Array.from(el?.classList ?? []).some((c) => c.startsWith("css_") || c.includes(":css_")),
    ).toBe(false);
    dispose();
  });

  it("lets the `css` prop win over an equivalent style prop", async () => {
    const { container, dispose } = mount(() => (
      <Box color="red.300" css={{ color: "green.400" }}>
        Box content
      </Box>
    ));

    const el = container.querySelector("div");
    expect(el?.classList.contains("c_green.400")).toBe(true);
    dispose();
  });

  it("renders as a different element via `as`", async () => {
    const { container, dispose } = mount(() => (
      <Box as="section" p="2">
        Section box
      </Box>
    ));

    const el = container.querySelector("section");
    expect(el).not.toBeNull();
    expect(el?.classList.contains("p_2")).toBe(true);
    dispose();
  });

  it("supports the render prop for polymorphic rendering", async () => {
    const { container, dispose } = mount(() => (
      <Box render={(p) => <span {...(p as JSX.HTMLAttributes<HTMLSpanElement>)} />} p="2">
        Rendered span
      </Box>
    ));

    const el = container.querySelector("span");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("Rendered span");
    expect(el?.classList.contains("p_2")).toBe(true);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <Box>Box content</Box>);
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Box hydration", () => {
  // See button.browser.test.tsx for why `_$HY` is hand-rolled and what fields matter.
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
    // The hydrated tree must be structurally identical to what produced `box-ssr.html`
    // (same `_hk`), so the render call here matches box.ssr.test.tsx exactly.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const teardownHydration = bootstrapHydration();
    const { container, remove } = mountServerHtml(ssrFixture);

    const serverBox = container.querySelector("div");
    const dispose = hydrate(
      () => (
        <Box p="4" bg="primary" rounded="lg">
          Box content
        </Box>
      ),
      container,
    );

    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    // Reuses the server node — otherwise there'd be two, or one that isn't the server's.
    expect(container.querySelectorAll("div")).toHaveLength(1);
    expect(container.querySelector("div")).toBe(serverBox);

    dispose();
    remove();
    teardownHydration();
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it("has no accessibility violations after hydrating", async () => {
    const teardownHydration = bootstrapHydration();
    const { container, remove } = mountServerHtml(ssrFixture);

    const dispose = hydrate(
      () => (
        <Box p="4" bg="primary" rounded="lg">
          Box content
        </Box>
      ),
      container,
    );
    await expectNoA11yViolations(container);

    dispose();
    remove();
    teardownHydration();
  });
});
