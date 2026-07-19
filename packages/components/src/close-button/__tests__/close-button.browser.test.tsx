import ssrFixture from "virtual:hydration-fixture?id=close-button";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { I18nProvider } from "@hope-ui/primitives/i18n";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { CloseButton, type CloseButtonProps } from "../close-button";
// Genuine server output, rendered fresh in-process by the hydration-fixture bridge (no committed
// `.html`). `Tree` is the same tree `close-button.ssr.test.tsx` inline-snapshots and the bridge
// renders — one source of truth, so the hydration input and the client tree cannot diverge.
import { Tree } from "./close-button.ssr-entry";

// CloseButton reads styling through `useSlots`/`useRecipe`, so every render sits under a
// `<ThemeProvider>` fed the `hope` preset. `hope`'s token overrides are empty (values live in CSS), so
// the provider stays on the zero-DOM branch. See docs/theming.md.
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
 * Renders CloseButton as an anchor. Passed as a **direct** `render` prop, never via a spread object: a
 * spread-backed prop reads reactively, and the component reads `render` synchronously to build the
 * element, which would trip `STRICT_READ_UNTRACKED` for a value that is structural and never changes.
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
    // The glyph is a component wrapped in the host icon-slot span.
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
    expect(cls).toContain("hover:not-data-pressed:bg-close-overlay-hovered");
    expect(cls).toContain("data-pressed:bg-close-overlay-pressed");
    expect(cls).toContain("focus-visible:ring-close-focus");
    // Never the violet focus halo — that would clash on a colored surface.
    expect(cls).not.toContain("focus-halo");
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

  it("replaces the built-in X with a consumer `icon`", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <CloseButton icon={<CustomIcon />} />
      </Themed>
    ));

    const iconSlot = container.querySelector('[data-slot="close-button-icon"]');
    // Exactly one glyph, and it is the consumer's (distinct marker).
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

    // A non-native element switches to role="button" + tabIndex via createButton.
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
    // A preset supplies the app-wide glyph as a factory (reuse-safe). The built-in X is the fallback.
    const withDefaultIcon = definePreset(hope, {
      components: { closeButton: { defaultProps: { size: "lg", icon: () => <CustomIcon /> } } },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={withDefaultIcon}>
        <CloseButton />
      </ThemeProvider>
    ));

    const button = container.querySelector('[data-slot="close-button"]');
    // preset size default applied ...
    expect(button?.className).toContain("size-8");
    // ... and the preset's factory glyph, not the built-in X.
    expect(button?.querySelector("svg[data-custom-icon]")).not.toBeNull();
    dispose();
  });

  it("resolves the currentColor-derived wash per element (bundled Chromium)", () => {
    // The browser project doesn't compile Tailwind, so `bg-close-overlay-hovered` carries no style
    // here. Assert instead the *mechanism* the token relies on: the exact `color-mix` value
    // `--hope-close-overlay-hovered` expands to, applied to two elements with different inherited
    // `color`, must resolve to two different, real background colors that track each element's color.
    // This is what makes CloseButton surface-adaptive with no colorScheme.
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

    // Each resolves to a real, non-empty color (the bundled Chromium supports color-mix + currentColor).
    expect(onWhite).not.toBe("");
    expect(onBlack).not.toBe("");
    expect(onWhite).not.toBe("rgba(0, 0, 0, 0)");
    // And the two differ, because currentColor differs (white vs black surface).
    expect(onWhite).not.toBe(onBlack);
    dispose();
  });
});

describe("CloseButton hydration", () => {
  // `ssrFixture` is genuine server output: the hydration-fixture bridge renders `Tree` through a nested
  // SSR server (server solid builds) and `close-button.ssr.test.tsx` inline-snapshots that same render,
  // so the two agree byte-for-byte. Here `solid-js`/`@solidjs/web` resolve to their client builds, so
  // `hydrateFixture` hydrates that HTML rather than re-rendering it. It proves hydration was silent and
  // reused every node — the component-in-slot path (built-in X *and* a custom-icon component) that used
  // to break under the `@solidjs/web` beta. See docs/solid-2.0-notes.md.
  it("hydrates both close buttons in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // The zero-DOM provider injects no `<style>` — not something the reuse check covers.
    expect(container.querySelector("style")).toBeNull();
    // Both glyph components survived hydration inside their icon-slot spans (default + custom).
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
