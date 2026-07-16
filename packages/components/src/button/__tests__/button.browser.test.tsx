import ssrFixture from "virtual:hydration-fixture?id=button";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Button, type ButtonProps } from "../button";
// Genuine server output, rendered fresh in-process by the hydration-fixture bridge (no committed
// `.html`). `Tree` is the same tree `button.ssr.test.tsx` inline-snapshots and the bridge renders —
// one source of truth, so the hydration input and the client tree cannot structurally diverge.
import { Tree } from "./button.ssr-entry";

// Button reads styling through `useSlots`/`useRecipe`, so every render sits under a
// `<ThemeProvider>` fed the `hope` preset. `hope`'s token overrides are empty (its values live in
// CSS), so the provider stays on the zero-DOM branch and the fixture is byte-identical. The
// hydration suite wraps the *same* tree the SSR fixture was generated from
// (`<ThemeProvider preset={hope}><Button>Click me</Button></ThemeProvider>`) — the provider shifts
// `_hk` keys, so both halves must include it identically. See docs/theming.md.
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

/**
 * Renders Button as an anchor. Passed as a **direct** `render` prop, never via a spread object:
 * a spread-backed prop reads reactively, and Button reads `render` synchronously to build the
 * element, which would trip `STRICT_READ_UNTRACKED` for a value that is structural and never
 * changes. `nativeButton={false}` switches on the element-aware a11y + keyboard synthesis.
 */
const renderAsAnchor: NonNullable<ButtonProps["render"]> = (p) => (
  <a href="/docs" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
);

describe("Button — native", () => {
  it("renders a native button element with type=button", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Button>Click me</Button>
      </Themed>
    ));

    const button = page.getByRole("button", { name: "Click me" });
    await expect.element(button).toBeInTheDocument();
    await expect.element(button).toHaveAttribute("type", "button");
    dispose();
  });

  it("applies the recipe's slot classes (default neutral chrome)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button>Click me</Button>
      </Themed>
    ));

    const button = container.querySelector("button");
    // The default variant is color-independent neutral chrome; the label sits in its own slot.
    expect(button?.className).toContain("bg-surface-raised");
    expect(button?.className).toContain("border-subtle-outline");
    expect(button?.querySelector('[data-slot="button-label"]')?.textContent).toBe("Click me");
    dispose();
  });

  it("emits data-disabled as the styling hook when disabled (absent when enabled)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button disabled>Click me</Button>
      </Themed>
    ));

    const button = container.querySelector("button");
    // The single hook a recipe styles — present for both native and non-native buttons.
    expect(button?.hasAttribute("data-disabled")).toBe(true);
    expect(button?.getAttribute("data-disabled")).toBe("");
    dispose();

    const enabled = mount(() => (
      <Themed>
        <Button>Click me</Button>
      </Themed>
    ));
    expect(enabled.container.querySelector("button")?.hasAttribute("data-disabled")).toBe(false);
    enabled.dispose();
  });

  it("lets the consumer class win over the recipe (cn merge)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button class="bg-red-500">Click me</Button>
      </Themed>
    ));

    const cls = container.querySelector("button")?.className ?? "";
    // tailwind-merge resolves the conflicting fill in the consumer's favor.
    expect(cls).toContain("bg-red-500");
    expect(cls).not.toContain("bg-surface-raised");
    dispose();
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    const { dispose } = mount(() => (
      <Themed>
        <Button onClick={onClick}>Click me</Button>
      </Themed>
    ));

    await page.getByRole("button", { name: "Click me" }).click();
    expect(onClick).toHaveBeenCalledOnce();
    dispose();
  });

  it("keeps type=button when a wrapper forwards an unset `type` prop", async () => {
    // Regression: `merge({ type: "button" }, props)` resolved by key *presence*, so an
    // explicitly-`undefined` `type` beat the default and the button became a submit button
    // inside a form. `withDefaults` resolves with `??`. See `withDefaults`' doc.
    const { dispose } = mount(() => (
      <Themed>
        <Button type={undefined}>Click me</Button>
      </Themed>
    ));

    await expect
      .element(page.getByRole("button", { name: "Click me" }))
      .toHaveAttribute("type", "button");
    dispose();
  });

  it("still lets an explicit `type` override the default", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Button type="submit">Submit</Button>
      </Themed>
    ));

    await expect
      .element(page.getByRole("button", { name: "Submit" }))
      .toHaveAttribute("type", "submit");
    dispose();
  });

  it("uses the native disabled attribute without a redundant aria-disabled", async () => {
    // The rework drops the double-up: a native disabled button already conveys the state via
    // the native attribute, which also removes it from the tab order.
    const { dispose } = mount(() => (
      <Themed>
        <Button disabled>Click me</Button>
      </Themed>
    ));

    const button = page.getByRole("button", { name: "Click me" });
    await expect.element(button).toBeDisabled();
    await expect.element(button).not.toHaveAttribute("aria-disabled");
    dispose();
  });

  it("activates on Enter and Space", async () => {
    const onClick = vi.fn();
    const { dispose } = mount(() => (
      <Themed>
        <Button onClick={onClick}>Click me</Button>
      </Themed>
    ));

    page.getByRole("button", { name: "Click me" }).element().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("renders decorators in their own slots", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button
          startDecorator={<span data-testid="start">+</span>}
          endDecorator={<span data-testid="end">-</span>}
        >
          Label
        </Button>
      </Themed>
    ));

    const button = container.querySelector("button");
    expect(button?.querySelector('[data-slot="button-start-decorator"]')).not.toBeNull();
    expect(button?.querySelector('[data-slot="button-end-decorator"]')).not.toBeNull();
    expect(button?.querySelector('[data-testid="start"]')).not.toBeNull();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button>Click me</Button>
      </Themed>
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Button — loading", () => {
  it("marks aria-busy, renders the loader, and blocks activation", async () => {
    const onClick = vi.fn();
    const { container, dispose } = mount(() => (
      <Themed>
        <Button loading onClick={onClick}>
          Saving
        </Button>
      </Themed>
    ));

    const button = page.getByRole("button", { name: "Saving" });
    await expect.element(button).toHaveAttribute("aria-busy", "true");
    // Not disabled: still in the tab order, keeps its enabled look.
    await expect.element(button).not.toBeDisabled();
    expect(container.querySelector('[data-slot="button-loader"]')).not.toBeNull();

    // A click is blocked by the loading guard's preventDefault (the same cancel channel disabled uses).
    await button.click();
    expect(onClick).not.toHaveBeenCalled();
    dispose();
  });

  it("has no accessibility violations while loading", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button loading>Saving</Button>
      </Themed>
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Button — render-ed as a non-native element", () => {
  it("renders the polymorphic element and announces as a button", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Button nativeButton={false} render={renderAsAnchor}>
          Link button
        </Button>
      </Themed>
    ));

    // role="button" is applied over the anchor, so it announces as a button, not a link.
    const button = page.getByRole("button", { name: "Link button" });
    await expect.element(button).toBeInTheDocument();
    await expect.element(button).toHaveAttribute("role", "button");
    await expect.element(button).toHaveAttribute("tabindex", "0");
    dispose();
  });

  it("activates via keyboard (Enter native, Space synthesized)", async () => {
    // preventDefault so the enabled anchor's activation doesn't navigate the test iframe.
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { dispose } = mount(() => (
      <Themed>
        <Button nativeButton={false} render={renderAsAnchor} onClick={onClick}>
          Link button
        </Button>
      </Themed>
    ));

    page.getByRole("button", { name: "Link button" }).element().focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("marks aria-disabled, drops from the tab order, and blocks activation while disabled", async () => {
    const onClick = vi.fn();
    const { dispose } = mount(() => (
      <Themed>
        <Button nativeButton={false} render={renderAsAnchor} onClick={onClick} disabled>
          Link button
        </Button>
      </Themed>
    ));

    const button = page.getByRole("button", { name: "Link button" });
    await expect.element(button).toHaveAttribute("aria-disabled", "true");
    await expect.element(button).not.toHaveAttribute("tabindex");

    // Playwright won't drive a click on an aria-disabled element; dispatch a raw one (the
    // programmatic / screen-reader path the guard must block anyway).
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    button.element().dispatchEvent(clickEvent);
    expect(onClick).not.toHaveBeenCalled();
    expect(clickEvent.defaultPrevented).toBe(true);
    dispose();
  });

  it("has no baseline accessibility violations as a non-native button", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button nativeButton={false} render={renderAsAnchor}>
          Link button
        </Button>
      </Themed>
    ));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Button — preset defaultProps (variants)", () => {
  // A preset can set app-wide defaults; the component's built-in defaults are the fallback, and an
  // explicit instance prop still wins (precedence: instance ?? preset ?? builtin), all wired through
  // `useDefaults`. `hope` sets none, so extend it with one. (`defaultProps` is the renamed, widened
  // successor of `defaultVariants`; a variant default is still the common case.)
  const smallByDefault = definePreset(hope, {
    components: { button: { defaultProps: { size: "sm" } } },
  });

  it("applies the preset's defaultProps when the instance leaves the prop unset", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={smallByDefault}>
        <Button>Click me</Button>
      </ThemeProvider>
    ));

    // size `sm` → `h-7`; the built-in default is `md` → `h-8`, so `h-7` proves the preset default won.
    const cls = container.querySelector("button")?.className ?? "";
    expect(cls).toContain("h-7");
    expect(cls).not.toContain("h-8");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("lets an explicit instance prop override the preset default", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={smallByDefault}>
        <Button size="lg">Click me</Button>
      </ThemeProvider>
    ));

    // size `lg` → `h-9`; the instance wins over the preset's `sm` (`h-7`).
    const cls = container.querySelector("button")?.className ?? "";
    expect(cls).toContain("h-9");
    expect(cls).not.toContain("h-7");
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Button — slotClasses", () => {
  // The full override chain is recipe base → preset `slotClasses` → instance `slotClasses` → `class`
  // (root only), folded in by `useSlots`; the final tailwind-merge (inside the recipe's `{ class }`
  // seam) means a later utility wins a conflict.
  it("applies a preset's global slotClasses to the matching slots", async () => {
    const preset = definePreset(hope, {
      components: { button: { slotClasses: { root: "rounded-full", label: "tracking-wide" } } },
    });
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={preset}>
        <Button>Click me</Button>
      </ThemeProvider>
    ));

    const button = container.querySelector("button");
    expect(button?.className).toContain("rounded-full");
    expect(button?.querySelector('[data-slot="button-label"]')?.className).toContain(
      "tracking-wide",
    );
    await expectNoA11yViolations(container);
    dispose();
  });

  it("folds instance slotClasses in after the preset's, letting the instance win a conflict", async () => {
    const preset = definePreset(hope, {
      components: { button: { slotClasses: { root: "rounded-full" } } },
    });
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={preset}>
        <Button slotClasses={{ root: "rounded-none", label: "italic" }}>Click me</Button>
      </ThemeProvider>
    ));

    const button = container.querySelector("button");
    // Instance `rounded-none` is applied after the preset's `rounded-full` → tailwind-merge keeps it.
    expect(button?.className).toContain("rounded-none");
    expect(button?.className).not.toContain("rounded-full");
    // A slot the preset didn't touch still receives the instance override.
    expect(button?.querySelector('[data-slot="button-label"]')?.className).toContain("italic");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("applies the root `class` last, after both preset and instance slotClasses", async () => {
    const preset = definePreset(hope, {
      components: { button: { slotClasses: { root: "rounded-full" } } },
    });
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={preset}>
        <Button slotClasses={{ root: "rounded-none" }} class="rounded-sm">
          Click me
        </Button>
      </ThemeProvider>
    ));

    // Order is preset → instance slotClasses → `class`; the last conflicting radius (`class`) wins.
    const cls = container.querySelector("button")?.className ?? "";
    expect(cls).toContain("rounded-sm");
    expect(cls).not.toContain("rounded-full");
    expect(cls).not.toContain("rounded-none");
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Button — preset defaultProps (chrome content)", () => {
  // These are capabilities that did not exist before the themeable-props widening: the old
  // variants-only `defaultVariants` could not express a chrome-content default. They are the
  // definitive proof that `defaultProps` now defaults the curated themeable surface. (Per-usage
  // behavioral props like `nativeButton`/`type` are intentionally NOT themeable, so there is no
  // "default a behavioral prop app-wide" case — defaulting them would be meaningless.)

  it("defaults the loader (chrome content) app-wide via a factory, with the instance still winning", async () => {
    const brandLoader = definePreset(hope, {
      components: {
        button: { defaultProps: { loader: () => <span data-testid="brand-loader" /> } },
      },
    });

    // A loading button with no instance `loader` renders the preset's brand loader — not hope's
    // built-in <svg> loader.
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={brandLoader}>
        <Button loading>Saving</Button>
      </ThemeProvider>
    ));
    const loaderSlot = container.querySelector('[data-slot="button-loader"]');
    expect(loaderSlot?.querySelector('[data-testid="brand-loader"]')).not.toBeNull();
    // hope's default loader is an <svg>; the brand default replaces it entirely.
    expect(loaderSlot?.querySelector("svg")).toBeNull();
    await expectNoA11yViolations(container);
    dispose();

    // An explicit instance `loader` overrides the preset's brand default.
    const overridden = mount(() => (
      <ThemeProvider preset={brandLoader}>
        <Button loading loader={<span data-testid="instance-loader" />}>
          Saving
        </Button>
      </ThemeProvider>
    ));
    const overriddenSlot = overridden.container.querySelector('[data-slot="button-loader"]');
    expect(overriddenSlot?.querySelector('[data-testid="instance-loader"]')).not.toBeNull();
    expect(overriddenSlot?.querySelector('[data-testid="brand-loader"]')).toBeNull();
    await expectNoA11yViolations(overridden.container);
    overridden.dispose();
  });

  it("defaults the loadingText (chrome content) app-wide via a factory", async () => {
    const brandLoadingText = definePreset(hope, {
      components: {
        button: {
          defaultProps: {
            loadingText: () => <span data-testid="brand-loading-text">Working…</span>,
          },
        },
      },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={brandLoadingText}>
        <Button loading>Save</Button>
      </ThemeProvider>
    ));
    // The label shows the preset's brand loading text, not the instance children.
    const label = container.querySelector('[data-slot="button-label"]');
    expect(label?.querySelector('[data-testid="brand-loading-text"]')).not.toBeNull();
    expect(label?.textContent).toContain("Working…");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("renders an independent loader subtree per instance from one shared preset factory (reuse-safe)", async () => {
    // The correctness proof for the factory form: two loading buttons under one provider whose
    // `defaultProps.loader` is a single shared factory each get their OWN brand-loader node. A bare
    // shared `JSX.Element` default would be one already-built node that *moves*, appearing under only
    // one of the two — which is why the themeable type demands a `() => JSX.Element` factory.
    const brandLoader = definePreset(hope, {
      components: {
        button: { defaultProps: { loader: () => <span data-testid="brand-loader" /> } },
      },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={brandLoader}>
        <Button loading>First</Button>
        <Button loading>Second</Button>
      </ThemeProvider>
    ));

    expect(container.querySelectorAll('[data-testid="brand-loader"]').length).toBe(2);
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Button hydration", () => {
  // `ssrFixture` is genuine server output: the hydration-fixture bridge renders `Tree` through a
  // nested SSR server (server solid builds) and `button.ssr.test.tsx` inline-snapshots that same
  // render, so the two agree byte-for-byte. Here `solid-js`/`@solidjs/web` resolve to their client
  // builds, so `hydrateFixture` hydrates that HTML rather than re-rendering it (the client build's
  // `renderToStringAsync` returns `undefined`). The client tree must stay structurally identical to
  // the server's — hydration keys are a path through the component tree — which is guaranteed by
  // reusing the same `Tree`. `hope` authors its palette in CSS and the provider is zero-DOM, so the
  // fixture is just the `<button>`. `hydrateFixture` proves hydration was silent and reused every node.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // The zero-DOM provider injects no `<style>` — not something the reuse check covers.
    expect(container.querySelector("style")).toBeNull();

    dispose();
  });

  it("leaves the hydrated button interactive", async () => {
    const onClick = vi.fn();
    // `onClick` adds an event binding, not an element or a server attribute, so the tree stays
    // structurally (and byte-) identical to the fixture — hydration still reuses every node.
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree onClick={onClick} />);

    await page.getByRole("button", { name: "Click me" }).click();
    expect(onClick).toHaveBeenCalledOnce();

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    await expectNoA11yViolations(container);
    dispose();
  });
});
