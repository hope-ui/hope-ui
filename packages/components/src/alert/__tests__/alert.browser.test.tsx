import ssrFixture from "virtual:hydration-fixture?id=alert";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Alert, type AlertProps } from "..";
// Real server HTML, rendered in-process by the hydration-fixture bridge from the same `Tree` that
// `alert.ssr.test.tsx` snapshots — so the hydration input and the client tree cannot diverge.
import { Tree } from "./alert.ssr-entry";

// Alert reads its styling from the theme, so every render needs a `<ThemeProvider>`. The `hope`
// preset authors its values in CSS, so the provider emits no DOM — but it still occupies a position
// in the tree, and Solid matches server and client nodes by position, so both halves of the
// hydration round-trip must wrap identically.
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

/**
 * Renders Alert as a different element. Passed as a **direct** prop, never through a spread object:
 * a spread-backed prop is read reactively, and Alert reads `render` synchronously to build its
 * element, which Solid flags as `STRICT_READ_UNTRACKED`.
 */
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
    expect(alert?.getAttribute("data-presence")).toBe("entered");
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
    // The auto-composed form reuses the same parts as the compound one, and they register their ids
    // *after* the render pass — so the links appear a tick after mount either way.
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
    // The description deliberately carries no role color — it inherits the body's foreground.
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
    // Every variant reserves a border, so `solid` must colour it to match its own fill — otherwise
    // the surface stops short of the outer edge.
    expect(cls).toContain("border-danger");
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
    // The parts register their ids after the render pass, so the link appears a tick after mount.
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
    // Exactly one glyph: the consumer's must replace the built-in, not render alongside it.
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
    expect(success?.querySelector('[data-slot="alert-icon"] svg[data-custom-icon]')).not.toBeNull();
    // The untouched role must keep its built-in glyph — overriding one must not clear the rest.
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
    // There is no Tailwind build here, so no exit transition is actually applied and the unmount is
    // immediate.
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
          <Alert.CloseTrigger onClick={(event) => event.preventDefault()} />
        </Alert.Root>
      </Themed>
    ));

    await userEvent.click(page.getByRole("button", { name: "Close" }));
    // The consumer's handler runs first and cancels the close, so neither the callback fires nor
    // does the alert unmount.
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(container.querySelector('[data-slot="alert"]')).not.toBeNull();
    dispose();
  });

  it("positions Alert.CloseTrigger via the recipe's closeTrigger slot, over CloseButton's own chrome", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root title="With close" closable />
      </Themed>
    ));

    const close = container.querySelector('[data-slot="alert-close-trigger"]');
    expect(close).not.toBeNull();
    expect(container.querySelector('[data-slot="close-button"]')).toBeNull();
    // Both must survive together: the alert slot contributes placement, and CloseButton's own recipe
    // still contributes its chrome underneath.
    expect(close?.className).toContain("ms-auto");
    expect(close?.className).toContain("hover:not-data-pressed:bg-surface-adaptive-hovered");
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

  // Regression: every part declared `class` in its props type, but five of them computed the class
  // from their slot without passing `props.class` into it — so the computed getter won the merge and
  // the consumer's string vanished. Type-checked, all tests green, docs promising the opposite.
  // Hence the assertion is on the *element*, never on the props type.
  it("merges each part's own class onto that part's slot", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Alert.Root colorScheme="info">
          <Alert.Icon class="icon-class" />
          <Alert.Content class="content-class">
            <Alert.Title class="title-class">Custom</Alert.Title>
            <Alert.Description class="description-class">Explicit parts.</Alert.Description>
          </Alert.Content>
          <Alert.Actions class="actions-class">
            <button type="button">Undo</button>
          </Alert.Actions>
        </Alert.Root>
      </Themed>
    ));

    for (const [slot, consumerClass] of [
      ["alert-icon", "icon-class"],
      ["alert-content", "content-class"],
      ["alert-title", "title-class"],
      ["alert-description", "description-class"],
      ["alert-actions", "actions-class"],
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)?.className).toContain(consumerClass);
    }
    // The consumer's class is folded in, not swapped in: non-conflicting recipe classes survive.
    expect(container.querySelector('[data-slot="alert-content"]')?.className).toContain("flex");
    await expectNoA11yViolations(container);
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
  // `ssrFixture` is real server HTML: the bridge renders `Tree` through a nested SSR server, and
  // `alert.ssr.test.tsx` snapshots that same render, so the two agree byte for byte. The tree is the
  // auto-composed form, which is the interesting one — it nests components inside slots (the status
  // glyph, the close button), the shape that used to mis-hydrate.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // The provider must stay DOM-free: an injected `<style>` is not something the reuse check sees.
    expect(container.querySelector("style")).toBeNull();
    expect(container.querySelector('[data-slot="alert-title"]')?.textContent).toBe(
      "Update available",
    );
    expect(container.querySelector('[data-slot="alert-icon"] svg')).not.toBeNull();
    expect(container.querySelector('[data-slot="alert-close-trigger"]')).not.toBeNull();
    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    await expectNoA11yViolations(container);
    dispose();
  });
});
