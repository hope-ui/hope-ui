import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { flex } from "@hope-ui/styled-system/patterns";
import { hydrate } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { Flex } from "../flex";
import ssrFixture from "./__fixtures__/flex-ssr.html?raw";

describe("Flex", () => {
  it("renders a div with display:flex by default", async () => {
    const { container, dispose } = mount(() => <Flex>Flex content</Flex>);

    const el = container.querySelector("div");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("Flex content");
    // Guard against the old broken `css`-nesting path (`display:css_flex`): must be the real atom.
    expect(el?.classList.contains("d_flex")).toBe(true);
    dispose();
  });

  it("maps the flexbox shorthands to atomic classes", async () => {
    const { container, dispose } = mount(() => (
      <Flex direction="column" align="center" justify="space-between" wrap="wrap">
        Flex content
      </Flex>
    ));

    const el = container.querySelector("div");
    expect(el?.classList.contains("flex-d_column")).toBe(true);
    expect(el?.classList.contains("ai_center")).toBe(true);
    expect(el?.classList.contains("jc_space-between")).toBe(true);
    expect(el?.classList.contains("flex-wrap_wrap")).toBe(true);
    dispose();
  });

  it("renders inline-flex when `inline` is set", async () => {
    const { container, dispose } = mount(() => <Flex inline>Flex content</Flex>);

    const el = container.querySelector("div");
    expect(el?.classList.contains("d_inline-flex")).toBe(true);
    expect(el?.classList.contains("d_flex")).toBe(false);
    dispose();
  });

  it("keeps `grow`/`shrink` of 0 (uses `??`, not `||`)", async () => {
    const { container, dispose } = mount(() => (
      <Flex grow={0} shrink={0}>
        Flex content
      </Flex>
    ));

    const el = container.querySelector("div");
    expect(el?.classList.contains("flex-g_0")).toBe(true);
    expect(el?.classList.contains("flex-sh_0")).toBe(true);
    dispose();
  });

  it("forwards Box style props alongside the shorthands", async () => {
    const { container, dispose } = mount(() => (
      <Flex align="center" p="4" gap="2">
        Flex content
      </Flex>
    ));

    const el = container.querySelector("div");
    expect(el?.classList.contains("ai_center")).toBe(true);
    expect(el?.classList.contains("p_4")).toBe(true);
    expect(el?.classList.contains("gap_2")).toBe(true);
    dispose();
  });

  it("lets the consumer `css` prop win over a shorthand", async () => {
    const { container, dispose } = mount(() => (
      <Flex align="center" css={{ alignItems: "flex-end" }}>
        Flex content
      </Flex>
    ));

    const el = container.querySelector("div");
    expect(el?.classList.contains("ai_flex-end")).toBe(true);
    dispose();
  });

  it("merges a consumer class after the style-prop classes", async () => {
    const { container, dispose } = mount(() => (
      <Flex align="center" class="custom">
        Flex content
      </Flex>
    ));

    const el = container.querySelector("div");
    expect(el?.classList.contains("ai_center")).toBe(true);
    expect(el?.classList.contains("custom")).toBe(true);
    dispose();
  });

  it("renders as a different element via `as`", async () => {
    const { container, dispose } = mount(() => (
      <Flex as="section" align="center">
        Section flex
      </Flex>
    ));

    const el = container.querySelector("section");
    expect(el).not.toBeNull();
    expect(el?.classList.contains("d_flex")).toBe(true);
    expect(el?.classList.contains("ai_center")).toBe(true);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <Flex>Flex content</Flex>);
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Flex delegates to the Panda flex pattern", () => {
  // Flex reuses `flex.raw` for its shorthand → canonical mapping, and a consumer's own
  // `<Flex align="center">` is extracted statically via the SAME `flex` pattern in their preset.
  // So the class set Flex emits must equal what `flex(input)` produces (order-independent atoms).
  const cases: Array<Record<string, unknown>> = [
    { direction: "row", align: "center", justify: "space-between" },
    { direction: "column", wrap: "wrap" },
    { basis: "200px", grow: 1, shrink: 0 },
    { align: "flex-start", justify: "flex-end" },
  ];

  for (const input of cases) {
    it(`matches flex(${JSON.stringify(input)})`, async () => {
      const { container, dispose } = mount(() => <Flex {...input}>content</Flex>);
      const el = container.querySelector("div");
      const actual = new Set((el?.className ?? "").split(/\s+/).filter(Boolean));
      const expected = new Set(
        flex(input as Parameters<typeof flex>[0])
          .split(/\s+/)
          .filter(Boolean),
      );
      expect(actual).toEqual(expected);
      dispose();
    });
  }
});

describe("Flex hydration", () => {
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
    // Must be structurally identical to what produced `flex-ssr.html` (same `_hk`), so this
    // render call matches flex.ssr.test.tsx exactly.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const teardownHydration = bootstrapHydration();
    const { container, remove } = mountServerHtml(ssrFixture);

    const serverFlex = container.querySelector("div");
    const dispose = hydrate(
      () => (
        <Flex direction="column" align="center" justify="space-between" gap="2">
          Flex content
        </Flex>
      ),
      container,
    );

    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    expect(container.querySelectorAll("div")).toHaveLength(1);
    expect(container.querySelector("div")).toBe(serverFlex);

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
        <Flex direction="column" align="center" justify="space-between" gap="2">
          Flex content
        </Flex>
      ),
      container,
    );
    await expectNoA11yViolations(container);

    dispose();
    remove();
    teardownHydration();
  });
});
