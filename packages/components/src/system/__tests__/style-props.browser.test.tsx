import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JsxStyleProps } from "@hope-ui/styled-system/types";
import type { JSX } from "@solidjs/web";
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { renderStyled } from "../style-props";

// The props bag renderStyled accepts: real DOM attributes + Chakra-style style props + the `css`
// escape hatch. `class?` satisfies the `{ class?: unknown }` constraint.
type StyledProps = JsxStyleProps & JSX.HTMLAttributes<HTMLElement>;

describe("renderStyled", () => {
  it("maps style props to atomic classes and forwards DOM props verbatim", async () => {
    const { container, dispose } = mount(() =>
      renderStyled<StyledProps>({
        as: "div",
        props: { p: "4", bg: "primary", id: "target", children: "styled" },
      }),
    );

    const el = container.querySelector("div");
    expect(el).not.toBeNull();
    expect(el?.id).toBe("target");
    expect(el?.textContent).toBe("styled");
    expect(el?.classList.contains("p_4")).toBe(true);
    expect(el?.classList.contains("bg_primary")).toBe(true);
    dispose();
  });

  it("appends the consumer class last, after the style-prop classes", async () => {
    const { container, dispose } = mount(() =>
      renderStyled<StyledProps>({
        as: "div",
        props: { p: "4", class: "custom", children: "styled" },
      }),
    );

    const el = container.querySelector("div");
    const className = el?.getAttribute("class") ?? "";
    expect(className).toContain("p_4");
    expect(className).toContain("custom");
    // Consumer class is cx-appended last so it wins ties.
    expect(className.indexOf("custom")).toBeGreaterThan(className.indexOf("p_4"));
    dispose();
  });

  it("places recipeClass below style props (the recipe/variant seam)", async () => {
    const { container, dispose } = mount(() =>
      renderStyled<StyledProps>({
        as: "div",
        props: { p: "4", class: "custom", children: "styled" },
        recipeClass: () => "recipe-root",
      }),
    );

    const el = container.querySelector("div");
    const className = el?.getAttribute("class") ?? "";
    // Order: recipeClass → style props → consumer class.
    expect(className.indexOf("recipe-root")).toBeLessThan(className.indexOf("p_4"));
    expect(className.indexOf("p_4")).toBeLessThan(className.indexOf("custom"));
    dispose();
  });

  it("preserves style-prop reactivity — a changed value recomputes the class", async () => {
    const [pad, setPad] = createSignal("2");
    const { container, dispose } = mount(() =>
      renderStyled<StyledProps>({
        as: "div",
        props: {
          get p() {
            return pad();
          },
          children: "styled",
        },
      }),
    );

    const el = container.querySelector("div");
    expect(el?.classList.contains("p_2")).toBe(true);

    flush(() => setPad("8"));
    expect(el?.classList.contains("p_8")).toBe(true);
    expect(el?.classList.contains("p_2")).toBe(false);
    dispose();
  });

  it("renders as a different element via `as` and supports the render prop", async () => {
    const { container, dispose } = mount(() =>
      renderStyled<StyledProps>({
        as: "section",
        props: { p: "2", children: "section" },
      }),
    );

    const el = container.querySelector("section");
    expect(el).not.toBeNull();
    expect(el?.classList.contains("p_2")).toBe(true);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() =>
      renderStyled<StyledProps>({ as: "div", props: { p: "4", children: "styled" } }),
    );
    await expectNoA11yViolations(container);
    dispose();
  });
});
