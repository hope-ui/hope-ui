import ssrFixture from "virtual:hydration-fixture?id=close-button";
import { I18nProvider } from "@hope-ui/i18n";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { type CloseButtonThemeableProps, definePreset, ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { CloseButton, type CloseButtonProps } from "../close-button";
// Real server HTML, rendered in-process by the hydration-fixture bridge from the same `Tree` that
// `close-button.ssr.test.tsx` snapshots — so the hydration input and the client tree cannot diverge.
import { Tree } from "./close-button.ssr-entry";

// CloseButton reads its styling from the theme, so every render needs a `<ThemeProvider>`. The
// `hope` preset authors its values in CSS, so the provider emits no DOM of its own.
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

/** A consumer-supplied glyph as a component (custom-`icon` path). */
function CustomIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" data-custom-icon>
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

/**
 * Renders CloseButton as an anchor. Passed as a **direct** prop, never through a spread object: a
 * spread-backed prop is read reactively, and the component reads `render` synchronously to build its
 * element, which Solid flags as `STRICT_READ_UNTRACKED`.
 */
const renderAsAnchor: NonNullable<CloseButtonProps["render"]> = (p) => (
  <a href="/close" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
);

describe("CloseButton", () => {
  it("renders a native <button type=button> with the root slot marker and the built-in X", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton />
      </Themed>
    ));

    const button = container.querySelector('[data-slot="close-button"]');
    expect(button?.tagName).toBe("BUTTON");
    expect(button?.getAttribute("type")).toBe("button");
    // The glyph is a component, and it must stay wrapped in a host span rather than being the
    // button's first child directly — that wrapper is what keeps it hydratable.
    const iconSlot = button?.querySelector('[data-slot="close-button-icon"]');
    expect(iconSlot).not.toBeNull();
    expect(iconSlot?.querySelector("svg")).not.toBeNull();
    await expectNoA11yViolations(container);
    dispose();
  });

  it("applies the default recipe slot classes (sm box + currentColor wash + focus ring)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton />
      </Themed>
    ));

    const cls = container.querySelector('[data-slot="close-button"]')?.className ?? "";
    expect(cls).toContain("size-6"); // sm default
    expect(cls).toContain("hover:not-data-pressed:bg-surface-adaptive-hovered");
    expect(cls).toContain("data-pressed:bg-surface-adaptive-pressed");
    // The same focus indicator every other focusable control in the library uses.
    expect(cls).toContain("focus-visible:ring-focus-halo");
    dispose();
  });

  it("scales the box + glyph per size", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton size="lg" />
      </Themed>
    ));

    const button = container.querySelector('[data-slot="close-button"]');
    expect(button?.className).toContain("size-8");
    expect(button?.querySelector('[data-slot="close-button-icon"]')?.className).toContain(
      "[&_svg]:size-5",
    );
    dispose();
  });

  it("self-labels from the localized `common.close` (default locale = English)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton />
      </Themed>
    ));

    expect(container.querySelector('[data-slot="close-button"]')?.getAttribute("aria-label")).toBe(
      "Close",
    );
    await expectNoA11yViolations(container);
    dispose();
  });

  it("uses the French default under <I18nProvider locale='fr-FR'>", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <I18nProvider locale="fr-FR">
          <CloseButton />
        </I18nProvider>
      </Themed>
    ));

    expect(container.querySelector('[data-slot="close-button"]')?.getAttribute("aria-label")).toBe(
      "Fermer",
    );
    await expectNoA11yViolations(container);
    dispose();
  });

  it("lets a consumer aria-label override the localized default", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton aria-label="Dismiss dialog" />
      </Themed>
    ));

    expect(container.querySelector('[data-slot="close-button"]')?.getAttribute("aria-label")).toBe(
      "Dismiss dialog",
    );
    await expectNoA11yViolations(container);
    dispose();
  });

  it("falls back to a preset's defaultProps aria-label, but a per-instance one still wins", async () => {
    // The fallback must read the *merged* props, not the raw ones, or a preset-level default is
    // invisible to it and every button here would read "Close". The cast is needed because
    // `aria-label` sits outside the curated themeable surface (which is `size` + `icon` only), while
    // `useDefaults` still folds it in at runtime.
    const withAriaLabel = definePreset(hope, {
      components: {
        closeButton: {
          defaultProps: { "aria-label": "Preset dismiss" } as Partial<CloseButtonThemeableProps>,
        },
      },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={withAriaLabel}>
        <div>
          <CloseButton />
          <CloseButton aria-label="Instance dismiss" />
        </div>
      </ThemeProvider>
    ));

    const buttons = container.querySelectorAll('[data-slot="close-button"]');
    expect(buttons[0]?.getAttribute("aria-label")).toBe("Preset dismiss");
    expect(buttons[1]?.getAttribute("aria-label")).toBe("Instance dismiss");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("replaces the built-in X with a consumer `icon`", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton icon={<CustomIcon />} />
      </Themed>
    ));

    const iconSlot = container.querySelector('[data-slot="close-button-icon"]');
    // Exactly one glyph: the consumer's must replace the built-in X, not render alongside it.
    expect(iconSlot?.querySelectorAll("svg").length).toBe(1);
    expect(iconSlot?.querySelector("svg[data-custom-icon]")).not.toBeNull();
    dispose();
  });

  it("fires onClick on activation", async () => {
    const onClick = vi.fn();
    const { dispose } = mount(() => (
      <Themed>
        <CloseButton onClick={onClick} />
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Close" }));
    expect(onClick).toHaveBeenCalledOnce();
    dispose();
  });

  it("disables via the native attribute and the data-disabled hook", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton disabled />
      </Themed>
    ));

    const button = container.querySelector('[data-slot="close-button"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute("data-disabled")).toBe(true);
    dispose();
  });

  it("renders as a different element via `render` (polymorphism)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton nativeButton={false} render={renderAsAnchor} />
      </Themed>
    ));

    // A non-native element gets `role="button"` and a `tabIndex` instead, so it still announces and
    // behaves as a button.
    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("role")).toBe("button");
    expect(anchor?.getAttribute("aria-label")).toBe("Close");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("lets the consumer class win over the recipe (cn merge)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton class="rounded-none" />
      </Themed>
    ));

    const cls = container.querySelector('[data-slot="close-button"]')?.className ?? "";
    expect(cls).toContain("rounded-none");
    expect(cls).not.toMatch(/(?:^|\s)rounded-md(?:\s|$)/);
    dispose();
  });

  it("folds instance slotClasses in per slot", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton slotClasses={{ root: "rounded-none", icon: "opacity-50" }} />
      </Themed>
    ));

    const button = container.querySelector('[data-slot="close-button"]');
    expect(button?.className).toContain("rounded-none");
    expect(button?.querySelector('[data-slot="close-button-icon"]')?.className).toContain(
      "opacity-50",
    );
    dispose();
  });

  it("applies a preset's defaultProps (an app-wide default icon via a factory)", async () => {
    // The app-wide glyph is a factory so each instance builds its own node; the built-in X is the
    // fallback when a preset supplies none.
    const withDefaultIcon = definePreset(hope, {
      components: { closeButton: { defaultProps: { size: "lg", icon: () => <CustomIcon /> } } },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={withDefaultIcon}>
        <CloseButton />
      </ThemeProvider>
    ));

    const button = container.querySelector('[data-slot="close-button"]');
    expect(button?.className).toContain("size-8");
    expect(button?.querySelector("svg[data-custom-icon]")).not.toBeNull();
    dispose();
  });

  it("resolves the currentColor-derived wash per element (bundled Chromium)", () => {
    // There is no Tailwind build in this project, so the wash utility carries no style here. What is
    // asserted instead is the CSS mechanism it relies on: the exact `color-mix` value the token
    // expands to, applied to two elements with different inherited `color`, must resolve to two
    // different real colors. That is the whole basis of being surface-adaptive with no colorScheme.
    const wash = "color-mix(in oklab, currentColor 10%, transparent)";
    const { container, dispose } = mount(() => (
      <>
        <div style={{ color: "rgb(255, 255, 255)" }}>
          <span data-testid="wash-on-white" style={{ "background-color": wash }} />
        </div>
        <div style={{ color: "rgb(0, 0, 0)" }}>
          <span data-testid="wash-on-black" style={{ "background-color": wash }} />
        </div>
      </>
    ));

    const onWhite = getComputedStyle(
      container.querySelector('[data-testid="wash-on-white"]') as HTMLElement,
    ).backgroundColor;
    const onBlack = getComputedStyle(
      container.querySelector('[data-testid="wash-on-black"]') as HTMLElement,
    ).backgroundColor;

    // Both resolve to a real color, which also confirms the bundled Chromium supports `color-mix`
    // with `currentColor` at all.
    expect(onWhite).not.toBe("");
    expect(onBlack).not.toBe("");
    expect(onWhite).not.toBe("rgba(0, 0, 0, 0)");
    // And they differ, because the inherited `currentColor` differs.
    expect(onWhite).not.toBe(onBlack);
    dispose();
  });
});

describe("CloseButton hydration", () => {
  // `ssrFixture` is real server HTML: the bridge renders `Tree` through a nested SSR server, and
  // `close-button.ssr.test.tsx` snapshots that same render, so the two agree byte for byte. This
  // covers the component-in-slot path — a glyph is always a component, built-in or custom — which is
  // the shape that used to mis-hydrate. `hydrateFixture` also fails a silent fallback re-render.
  it("hydrates both close buttons in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // The provider must stay DOM-free: an injected `<style>` is not something the reuse check sees.
    expect(container.querySelector("style")).toBeNull();
    expect(container.querySelectorAll('[data-slot="close-button-icon"] svg').length).toBe(2);
    expect(container.querySelector("svg[data-custom-icon]")).not.toBeNull();
    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
