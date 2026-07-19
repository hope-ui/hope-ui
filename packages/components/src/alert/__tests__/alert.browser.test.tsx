import ssrFixture from "virtual:hydration-fixture?id=alert";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Alert, type AlertProps } from "..";
// Genuine server output, rendered fresh in-process by the hydration-fixture bridge (no committed
// `.html`). `Tree` is the same tree `alert.ssr.test.tsx` inline-snapshots and the bridge renders —
// one source of truth, so the hydration input and the client tree cannot structurally diverge.
import { Tree } from "./alert.ssr-entry";

// Alert reads styling through `useSlots`/`useRecipe`, so every render sits under a `<ThemeProvider>`
// fed the `hope` preset. `hope`'s token overrides are empty (values live in CSS), so the provider
// stays on the zero-DOM branch and the fixture is byte-identical. See docs/theming.md.
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

/** A consumer-supplied glyph carrying a distinct marker, for the custom-`icon` paths. */
function CustomIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" data-custom-icon>
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

/** Renders Alert as a different element. Passed as a **direct** `render` prop (never via a spread). */
const renderAsSection: NonNullable<AlertProps["render"]> = (p) => (
  <section {...(p as unknown as JSX.HTMLAttributes<HTMLElement>)} />
);

describe("Alert", () => {
  it("renders a div with the root slot marker and the live-region role", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root title="Heads up" description="Something happened." />
      </Themed>
    ));

    const alert = container.querySelector('[data-slot="alert"]');
    expect(alert?.tagName).toBe("DIV");
    expect(alert?.getAttribute("role")).toBe("alert");
    expect(alert?.getAttribute("data-state")).toBe("entered");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("auto-composes the anatomy from the convenience props", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root colorScheme="success" title="Saved" description="Your changes are live." />
      </Themed>
    ));

    const alert = container.querySelector('[data-slot="alert"]');
    // Icon span holds the built-in status glyph (a component nested in a host span).
    const iconSlot = alert?.querySelector('[data-slot="alert-icon"]');
    expect(iconSlot?.querySelector("svg")).not.toBeNull();
    expect(alert?.querySelector('[data-slot="alert-content"]')).not.toBeNull();
    expect(alert?.querySelector('[data-slot="alert-title"]')?.textContent).toBe("Saved");
    expect(alert?.querySelector('[data-slot="alert-description"]')?.textContent).toBe(
      "Your changes are live.",
    );
    await expectNoA11yViolations(container);
    dispose();
  });

  it("links aria-labelledby/aria-describedby to the auto-composed title/description ids", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root colorScheme="info" title="Note" description="Read this." />
      </Themed>
    ));

    const alert = container.querySelector('[data-slot="alert"]');
    const title = alert?.querySelector('[data-slot="alert-title"]');
    const description = alert?.querySelector('[data-slot="alert-description"]');
    // The auto path reuses `Alert.Title`/`Alert.Description`, which register their ids via
    // `createRegisteredId` (onSettled), so the link appears just after mount — the same deferral as the
    // compound path below; wait for the reactive attributes to catch up.
    await vi.waitFor(() => {
      expect(alert?.getAttribute("aria-labelledby")).toBe(title?.id);
      expect(alert?.getAttribute("aria-describedby")).toBe(description?.id);
      expect(title?.id).toBeTruthy();
    });
    dispose();
  });

  it("renders no role attribute for role=none", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root role="none" title="Quiet" />
      </Themed>
    ));

    expect(container.querySelector('[data-slot="alert"]')?.hasAttribute("role")).toBe(false);
    dispose();
  });

  it("colors the icon + title per role in the default variant, leaving the body foreground", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root colorScheme="danger" title="Payment failed" description="Try another card." />
      </Themed>
    ));

    const alert = container.querySelector('[data-slot="alert"]');
    expect(alert?.className).toContain("bg-surface-raised");
    expect(alert?.className).not.toContain("bg-danger");
    expect(alert?.querySelector('[data-slot="alert-icon"]')?.className).toContain(
      "text-danger-emphasis",
    );
    expect(alert?.querySelector('[data-slot="alert-title"]')?.className).toContain(
      "text-danger-emphasis",
    );
    // The description inherits the body's `text-foreground`; it carries no role color of its own.
    expect(alert?.querySelector('[data-slot="alert-description"]')?.className).not.toContain(
      "text-danger-emphasis",
    );
    dispose();
  });

  it("wires the solid variant to the role fill + on-color text on the root", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root variant="solid" colorScheme="danger" title="Error" />
      </Themed>
    ));

    const cls = container.querySelector('[data-slot="alert"]')?.className ?? "";
    expect(cls).toContain("bg-danger");
    expect(cls).toContain("text-on-danger");
    dispose();
  });

  it("gives the subtle variant a soft role border", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root variant="subtle" colorScheme="warning" title="Careful" />
      </Themed>
    ));

    expect(container.querySelector('[data-slot="alert"]')?.className).toContain(
      "border-warning-subtle-line",
    );
    dispose();
  });

  it("renders the explicit compound anatomy when children are supplied", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root colorScheme="info">
          <Alert.Icon>
            <CustomIcon />
          </Alert.Icon>
          <Alert.Content>
            <Alert.Title>Custom</Alert.Title>
            <Alert.Description>Explicit parts.</Alert.Description>
          </Alert.Content>
          <Alert.Actions>
            <button type="button">Undo</button>
          </Alert.Actions>
        </Alert.Root>
      </Themed>
    ));

    const alert = container.querySelector('[data-slot="alert"]');
    expect(alert?.querySelector('[data-slot="alert-icon"] svg[data-custom-icon]')).not.toBeNull();
    expect(alert?.querySelector('[data-slot="alert-title"]')?.textContent).toBe("Custom");
    expect(alert?.querySelector('[data-slot="alert-actions"]')).not.toBeNull();
    await expectNoA11yViolations(container);
    dispose();
  });

  it("links the compound title/description ids into the root's aria attributes", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root>
          <Alert.Content>
            <Alert.Title>Compound title</Alert.Title>
            <Alert.Description>Compound description</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </Themed>
    ));

    const alert = container.querySelector('[data-slot="alert"]');
    const title = alert?.querySelector('[data-slot="alert-title"]');
    // The parts register their ids via `createRegisteredId` (onSettled), so the link appears just
    // after mount; wait for the reactive attribute to catch up.
    await vi.waitFor(() => {
      expect(alert?.getAttribute("aria-labelledby")).toBe(title?.id);
      expect(title?.id).toBeTruthy();
    });
    dispose();
  });

  it("hides the icon when icon={false}", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root colorScheme="success" icon={false} title="No glyph" />
      </Themed>
    ));

    expect(container.querySelector('[data-slot="alert-icon"]')).toBeNull();
    dispose();
  });

  it("lets an instance icon win over the built-in status glyph", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root colorScheme="success" icon={<CustomIcon />} title="Custom glyph" />
      </Themed>
    ));

    const iconSlot = container.querySelector('[data-slot="alert-icon"]');
    expect(iconSlot?.querySelectorAll("svg").length).toBe(1);
    expect(iconSlot?.querySelector("svg[data-custom-icon]")).not.toBeNull();
    dispose();
  });

  it("lets a preset's defaultProps status icon beat the built-in, keeping the other roles' built-ins", async () => {
    // Only `successIcon` is overridden; `dangerIcon` is untouched (a partial override).
    const withSuccessIcon = definePreset(hope, {
      components: { alert: { defaultProps: { successIcon: () => <CustomIcon /> } } },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={withSuccessIcon}>
        <div>
          <Alert.Root colorScheme="success" title="Saved" />
          <Alert.Root colorScheme="danger" title="Failed" />
        </div>
      </ThemeProvider>
    ));

    const alerts = container.querySelectorAll('[data-slot="alert"]');
    const success = alerts[0];
    const danger = alerts[1];
    // success uses the preset's factory glyph ...
    expect(success?.querySelector('[data-slot="alert-icon"] svg[data-custom-icon]')).not.toBeNull();
    // ... danger keeps its built-in (the partial override left it alone), a non-custom glyph.
    const dangerIcon = danger?.querySelector('[data-slot="alert-icon"] svg');
    expect(dangerIcon).not.toBeNull();
    expect(dangerIcon?.hasAttribute("data-custom-icon")).toBe(false);
    dispose();
  });

  it("dismisses on close click: onOpenChange(false), then unmount + onExitComplete", async () => {
    const onOpenChange = vi.fn();
    const onExitComplete = vi.fn();
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root
          title="Dismiss me"
          closable
          onOpenChange={onOpenChange}
          onExitComplete={onExitComplete}
        />
      </Themed>
    ));

    expect(container.querySelector('[data-slot="alert"]')).not.toBeNull();
    await userEvent.click(page.getByRole("button", { name: "Close" }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    // No authored CSS transition is compiled in the browser project, so exit is immediate: the alert
    // unmounts and `onExitComplete` fires.
    await vi.waitFor(() => {
      expect(container.querySelector('[data-slot="alert"]')).toBeNull();
    });
    expect(onExitComplete).toHaveBeenCalledOnce();
    dispose();
  });

  it("lets the consumer's onClick preventDefault cancel the close", async () => {
    const onOpenChange = vi.fn();
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root onOpenChange={onOpenChange}>
          <Alert.Content>
            <Alert.Title>Persistent</Alert.Title>
          </Alert.Content>
          <Alert.Close onClick={(event) => event.preventDefault()} />
        </Alert.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Close" }));
    // The consumer's handler ran first and cancelled the close, so neither the callback fired nor did
    // the alert unmount.
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(container.querySelector('[data-slot="alert"]')).not.toBeNull();
    dispose();
  });

  it("positions Alert.Close via the recipe's close slot, over CloseButton's own chrome", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root title="With close" closable />
      </Themed>
    ));

    const close = container.querySelector('[data-slot="close-button"]');
    expect(close).not.toBeNull();
    // Placement from the alert `close` slot ...
    expect(close?.className).toContain("ms-auto");
    // ... and CloseButton's own recipe chrome is still present.
    expect(close?.className).toContain("focus-visible:ring-close-focus");
    dispose();
  });

  it("lets the consumer class win over the recipe (cn merge)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root title="x" class="rounded-none" />
      </Themed>
    ));

    const cls = container.querySelector('[data-slot="alert"]')?.className ?? "";
    expect(cls).toContain("rounded-none");
    expect(cls).not.toMatch(/(?:^|\s)rounded-lg(?:\s|$)/);
    dispose();
  });

  it("folds instance slotClasses in per slot", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root
          colorScheme="info"
          title="Styled"
          description="Body"
          slotClasses={{ root: "rounded-none", title: "uppercase" }}
        />
      </Themed>
    ));

    const alert = container.querySelector('[data-slot="alert"]');
    expect(alert?.className).toContain("rounded-none");
    expect(alert?.querySelector('[data-slot="alert-title"]')?.className).toContain("uppercase");
    dispose();
  });

  it("renders as a different element via `render` (polymorphism)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root title="Sectioned" render={renderAsSection} />
      </Themed>
    ));

    const alert = container.querySelector('[data-slot="alert"]');
    expect(alert?.tagName).toBe("SECTION");
    expect(alert?.getAttribute("role")).toBe("alert");
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("Alert hydration", () => {
  // `ssrFixture` is genuine server output: the hydration-fixture bridge renders `Tree` through a nested
  // SSR server (server solid builds) and `alert.ssr.test.tsx` inline-snapshots that same render, so the
  // two agree byte-for-byte. Here `solid-js`/`@solidjs/web` resolve to their client builds, so
  // `hydrateFixture` hydrates that HTML rather than re-rendering it — the component-in-slot (status
  // glyph + CloseButton) auto-composed path. See docs/solid-2.0-notes.md.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // The zero-DOM provider injects no `<style>` — not something the reuse check covers.
    expect(container.querySelector("style")).toBeNull();
    expect(container.querySelector('[data-slot="alert-title"]')?.textContent).toBe(
      "Update available",
    );
    // The status glyph survived hydration inside its host icon span, and the close button hydrated too.
    expect(container.querySelector('[data-slot="alert-icon"] svg')).not.toBeNull();
    expect(container.querySelector('[data-slot="close-button"]')).not.toBeNull();
    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    await expectNoA11yViolations(container);
    dispose();
  });
});
