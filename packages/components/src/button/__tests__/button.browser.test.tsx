import ssrFixture from "virtual:hydration-fixture?id=button";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Button, type ButtonProps } from "../button";
// Real server HTML, rendered in-process by the hydration-fixture bridge from the same `Tree` that
// `button.ssr.test.tsx` snapshots — so the hydration input and the client tree cannot diverge.
import { Tree } from "./button.ssr-entry";

// Button reads its styling from the theme, so every render needs a `<ThemeProvider>`. The `hope`
// preset authors its values in CSS, so the provider emits no DOM — but it still occupies a position
// in the tree, and Solid matches server and client nodes by position, so both halves of the
// hydration round-trip must wrap identically.
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

/**
 * Renders Button as an anchor. Passed as a **direct** prop, never through a spread object: a
 * spread-backed prop is read reactively, and Button reads `render` synchronously to build its
 * element, which Solid flags as `STRICT_READ_UNTRACKED`. `nativeButton={false}` turns on the ARIA
 * and keyboard handling a non-`<button>` element needs.
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
    // The `default` variant is deliberately color-independent — no role color anywhere.
    expect(button?.className).toContain("bg-surface-raised");
    expect(button?.className).toContain("border-subtle");
    expect(button?.querySelector('[data-slot="button-label"]')?.textContent).toBe("Click me");
    dispose();
  });

  it("wires the inverted variant to its own dedicated swap tokens (fill + on-content + wash)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button variant="inverted" colorScheme="primary">
          On a toolbar
        </Button>
      </Themed>
    ));

    const cls = container.querySelector("button")?.className ?? "";
    // `inverted` must use its own `-inverted` tokens throughout, never borrow `solid`'s.
    expect(cls).toContain("bg-primary-inverted");
    expect(cls).toContain("text-on-primary-inverted");
    expect(cls).toContain("hover:not-data-pressed:bg-primary-inverted-hovered");
    expect(cls).toContain("data-pressed:bg-primary-inverted-pressed");
    dispose();
  });

  it("emits data-disabled as the styling hook when disabled (absent when enabled)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button disabled>Click me</Button>
      </Themed>
    ));

    const button = container.querySelector("button");
    // The one attribute a recipe selects on, present for native and non-native buttons alike — a
    // recipe cannot rely on `:disabled`, which only a real `<button>` matches.
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
    // tailwind-merge resolves the conflicting fill in the consumer's favour.
    expect(cls).toContain("bg-red-500");
    // Matched as a whole class token, not a substring: `bg-surface-raised-hovered`/`-pressed` share
    // the prefix but do not conflict with `bg-red-500`, so they legitimately survive.
    expect(cls).not.toMatch(/(?:^|\s)bg-surface-raised(?:\s|$)/);
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
    // Regression: Solid's `merge` resolves by key *presence*, so an explicitly-`undefined` `type`
    // beat the default and the button silently became a submit button inside a form. Defaults now
    // go through `withDefaults`, which resolves each key with `??`.
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
    // No double-up: the native attribute already conveys the state to assistive tech, and also
    // removes the button from the tab order.
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
    // Deliberately not disabled: dimmed off `aria-busy`, but still focusable and in the tab order.
    await expect.element(button).not.toBeDisabled();
    expect(container.querySelector('[data-slot="button-loader"]')).not.toBeNull();

    // The recipe's `aria-busy:pointer-events-none` makes Playwright refuse to click, so dispatch a
    // raw event instead — that is also the programmatic path the loading guard has to block.
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    button.element().dispatchEvent(clickEvent);
    expect(onClick).not.toHaveBeenCalled();
    expect(clickEvent.defaultPrevented).toBe(true);
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

    // `role="button"` overrides the anchor's own role, so it announces as a button, not a link.
    const button = page.getByRole("button", { name: "Link button" });
    await expect.element(button).toBeInTheDocument();
    await expect.element(button).toHaveAttribute("role", "button");
    await expect.element(button).toHaveAttribute("tabindex", "0");
    dispose();
  });

  it("activates via keyboard (Enter native, Space synthesized)", async () => {
    // `preventDefault` so activating the enabled anchor doesn't navigate the test iframe away.
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

    // Playwright won't drive a click on an `aria-disabled` element, so dispatch a raw one — which
    // is also the programmatic path the guard has to block.
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

describe("Button — icon-only", () => {
  const Icon = (): JSX.Element => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );

  it("renders a square icon-only button (aspect-square, no horizontal padding, sized icon)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Button iconOnly aria-label="Add">
          <Icon />
        </Button>
      </Themed>
    ));

    const cls = container.querySelector("button")?.className ?? "";
    expect(cls).toContain("aspect-square");
    // Horizontal padding would break the square, so the variant must drop every `px-*`.
    expect(cls).not.toMatch(/(?:^|\s)px-[\d.]/);
    // The icon arrives as `children`, so it lands in the label slot, which sizes it per button size.
    const label = container.querySelector('[data-slot="button-label"]');
    expect(label?.className).toContain("[&_svg]:size-5");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("warns in dev when an icon-only button has no accessible name", async () => {
    // `mount` intercepts `console.warn` to fail the test on Solid diagnostics, so the spy has to be
    // installed before mounting. The warning comes from an effect, hence the `waitFor`.
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { dispose } = mount(() => (
      <Themed>
        <Button iconOnly>
          <Icon />
        </Button>
      </Themed>
    ));

    await vi.waitFor(() =>
      expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining("no accessible name")),
    );
    dispose();
    consoleWarn.mockRestore();
  });

  it("does not warn when an accessible name is provided (aria-label or aria-labelledby)", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const labelled = mount(() => (
      <Themed>
        <Button iconOnly aria-label="Add">
          <Icon />
        </Button>
      </Themed>
    ));
    await expect.element(page.getByRole("button", { name: "Add" })).toBeInTheDocument();

    const labelledBy = mount(() => (
      <Themed>
        <span id="icon-btn-label">Add item</span>
        <Button iconOnly aria-labelledby="icon-btn-label">
          <Icon />
        </Button>
      </Themed>
    ));
    await expect.element(page.getByRole("button", { name: "Add item" })).toBeInTheDocument();

    expect(consoleWarn).not.toHaveBeenCalled();
    labelled.dispose();
    labelledBy.dispose();
    consoleWarn.mockRestore();
  });
});

describe("Button — preset defaultProps (variants)", () => {
  // Precedence is instance prop ?? preset default ?? component builtin. `hope` sets no button
  // defaults, so extend it with one to have something to test.
  const smallByDefault = definePreset(hope, {
    components: { button: { defaultProps: { size: "sm" } } },
  });

  it("applies the preset's defaultProps when the instance leaves the prop unset", async () => {
    const { container, dispose } = mount(() => (
      <ThemeProvider preset={smallByDefault}>
        <Button>Click me</Button>
      </ThemeProvider>
    ));

    // `sm` is `h-7` and the built-in default `md` is `h-8`, so `h-7` proves the preset default won.
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

    // `lg` is `h-9`; the instance prop wins over the preset's `sm` (`h-7`).
    const cls = container.querySelector("button")?.className ?? "";
    expect(cls).toContain("h-9");
    expect(cls).not.toContain("h-7");
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Button — slotClasses", () => {
  // The override chain, in order: recipe base → preset `slotClasses` → instance `slotClasses` →
  // `class` (root only). tailwind-merge runs over the whole chain, so a later utility wins.
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
    expect(button?.className).toContain("rounded-none");
    expect(button?.className).not.toContain("rounded-full");
    // A slot the preset never touched still receives the instance override.
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

    // Three conflicting radii; `class` is applied last, so it is the one that survives.
    const cls = container.querySelector("button")?.className ?? "";
    expect(cls).toContain("rounded-sm");
    expect(cls).not.toContain("rounded-full");
    expect(cls).not.toContain("rounded-none");
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Button — preset defaultProps (chrome content)", () => {
  // A preset can default *content*, not just style variants. Behavioral props like
  // `nativeButton`/`type` are deliberately excluded from the themeable surface — they are per-usage
  // decisions, so an app-wide default for them would be meaningless.

  it("defaults the loader (chrome content) app-wide via a factory, with the instance still winning", async () => {
    const brandLoader = definePreset(hope, {
      components: {
        button: { defaultProps: { loader: () => <span data-testid="brand-loader" /> } },
      },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={brandLoader}>
        <Button loading>Saving</Button>
      </ThemeProvider>
    ));
    const loaderSlot = container.querySelector('[data-slot="button-loader"]');
    expect(loaderSlot?.querySelector('[data-testid="brand-loader"]')).not.toBeNull();
    // The built-in loader is an `<svg>`; the preset's default must replace it, not sit beside it.
    expect(loaderSlot?.querySelector("svg")).toBeNull();
    await expectNoA11yViolations(container);
    dispose();

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
    // While loading, the preset's loading text replaces the button's own children.
    const label = container.querySelector('[data-slot="button-label"]');
    expect(label?.querySelector('[data-testid="brand-loading-text"]')).not.toBeNull();
    expect(label?.textContent).toContain("Working…");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("renders an independent loader subtree per instance from one shared preset factory (reuse-safe)", async () => {
    // Why the app-wide default must be a factory rather than a bare element: a single already-built
    // node cannot be in two places, so it would *move* and appear under only one of these two
    // buttons. Calling the factory per instance gives each its own subtree.
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
  // `ssrFixture` is real server HTML: the bridge renders `Tree` through a nested SSR server, and
  // `button.ssr.test.tsx` snapshots that same render, so the two agree byte for byte. In this
  // project Solid resolves to its client builds, so `hydrateFixture` hydrates that HTML instead of
  // re-rendering it. Both halves import the same `Tree`, which is what keeps the client tree
  // positionally identical to the server's. `hydrateFixture` asserts hydration was silent and reused
  // every node, so a silent fallback re-render — visually indistinguishable — still fails.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // The provider must stay DOM-free: an injected `<style>` is not something the reuse check sees.
    expect(container.querySelector("style")).toBeNull();

    dispose();
  });

  it("leaves the hydrated button interactive", async () => {
    const onClick = vi.fn();
    // `onClick` adds an event binding, not an element or a server attribute, so the tree stays byte-
    // and position-identical to the fixture — hydration still reuses every node.
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
