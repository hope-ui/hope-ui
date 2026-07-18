import ssrFixture from "virtual:hydration-fixture?id=badge";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { definePreset, ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { Badge, type BadgeProps } from "../badge";
// Genuine server output, rendered fresh in-process by the hydration-fixture bridge (no committed
// `.html`). `Tree` is the same tree `badge.ssr.test.tsx` inline-snapshots and the bridge renders —
// one source of truth, so the hydration input and the client tree cannot structurally diverge.
import { Tree } from "./badge.ssr-entry";

// Badge reads styling through `useSlots`/`useRecipe`, so every render sits under a `<ThemeProvider>`
// fed the `hope` preset. `hope`'s token overrides are empty (its values live in CSS), so the provider
// stays on the zero-DOM branch and the fixture is byte-identical. See docs/theming.md.
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

/**
 * Renders Badge as an anchor (a linkable tag). Passed as a **direct** `render` prop, never via a
 * spread object: a spread-backed prop reads reactively, and Badge reads `render` synchronously to
 * build the element, which would trip `STRICT_READ_UNTRACKED` for a value that is structural and
 * never changes.
 */
const renderAsAnchor: NonNullable<BadgeProps["render"]> = (p) => (
  <a href="/tags/new" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
);

describe("Badge", () => {
  it("renders a span with the root slot marker and the label", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge>New</Badge>
      </Themed>
    ));

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.tagName).toBe("SPAN");
    expect(badge?.querySelector('[data-slot="badge-label"]')?.textContent).toBe("New");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("applies the default recipe slot classes (soft neutral)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge>New</Badge>
      </Themed>
    ));

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.className).toContain("bg-neutral-soft");
    expect(badge?.className).toContain("text-neutral-emphasis");
    dispose();
  });

  it("wires the solid variant to the role fill + on-color text", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge variant="solid" colorScheme="danger">
          Error
        </Badge>
      </Themed>
    ));

    const cls = container.querySelector('[data-slot="badge"]')?.className ?? "";
    expect(cls).toContain("bg-danger");
    expect(cls).toContain("text-on-danger");
    dispose();
  });

  it("wires the inverted variant to the swapped pair (on-color fill + role text)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge variant="inverted" colorScheme="primary">
          Beta
        </Badge>
      </Themed>
    ));

    const cls = container.querySelector('[data-slot="badge"]')?.className ?? "";
    expect(cls).toContain("bg-on-primary");
    expect(cls).toContain("text-primary");
    dispose();
  });

  it("gives the subtle variant a soft role border", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge variant="subtle" colorScheme="danger">
          Error
        </Badge>
      </Themed>
    ));

    expect(container.querySelector('[data-slot="badge"]')?.className).toContain(
      "border-danger-subtle-line",
    );
    dispose();
  });

  it("gives the dot variant neutral chrome plus a role-colored dot slot", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge variant="dot" colorScheme="success">
          Online
        </Badge>
      </Themed>
    ));

    const badge = container.querySelector('[data-slot="badge"]');
    const dot = badge?.querySelector('[data-slot="badge-dot"]');
    // The root chrome is role-neutral; the role color rides the dot slot.
    expect(badge?.className).toContain("border-neutral-subtle-line");
    expect(badge?.className).not.toContain("bg-success");
    expect(dot).not.toBeNull();
    expect(dot?.className).toContain("bg-success");
    // The dot is decorative — it carries no accessible name.
    expect(dot?.getAttribute("aria-hidden")).toBe("true");
    await expectNoA11yViolations(container);
    dispose();
  });

  it("renders decorators in their own slots", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge
          startDecorator={<span data-testid="start">+</span>}
          endDecorator={<span data-testid="end">-</span>}
        >
          Label
        </Badge>
      </Themed>
    ));

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.querySelector('[data-slot="badge-start-decorator"]')).not.toBeNull();
    expect(badge?.querySelector('[data-slot="badge-end-decorator"]')).not.toBeNull();
    expect(badge?.querySelector('[data-testid="start"]')).not.toBeNull();
    dispose();
  });

  it("forwards native attributes through ...rest", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge id="status" title="Account status">
          Active
        </Badge>
      </Themed>
    ));

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.getAttribute("id")).toBe("status");
    expect(badge?.getAttribute("title")).toBe("Account status");
    dispose();
  });

  it("lets the consumer class win over the recipe (cn merge)", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge class="bg-red-500">New</Badge>
      </Themed>
    ));

    const cls = container.querySelector('[data-slot="badge"]')?.className ?? "";
    // tailwind-merge resolves the conflicting fill in the consumer's favor.
    expect(cls).toContain("bg-red-500");
    expect(cls).not.toMatch(/(?:^|\s)bg-neutral-soft(?:\s|$)/);
    dispose();
  });

  it("folds instance slotClasses in per slot", async () => {
    const { container, dispose } = mount(() => (
      <Themed>
        <Badge slotClasses={{ root: "rounded-none", label: "uppercase" }}>New</Badge>
      </Themed>
    ));

    const badge = container.querySelector('[data-slot="badge"]');
    // Instance `rounded-none` is applied after the recipe's `rounded-md` → tailwind-merge keeps it.
    expect(badge?.className).toContain("rounded-none");
    expect(badge?.className).not.toContain("rounded-md");
    expect(badge?.querySelector('[data-slot="badge-label"]')?.className).toContain("uppercase");
    dispose();
  });

  it("renders as a different element via `render` (polymorphism)", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Badge variant="solid" render={renderAsAnchor}>
          Linkable
        </Badge>
      </Themed>
    ));

    const link = page.getByRole("link", { name: "Linkable" });
    await expect.element(link).toBeInTheDocument();
    await expect.element(link).toHaveAttribute("href", "/tags/new");
    dispose();
  });

  it("applies a preset's defaultProps when the instance leaves the prop unset", async () => {
    // A preset can set app-wide defaults; the built-in default is the fallback, and an explicit
    // instance prop still wins (precedence: instance ?? preset ?? builtin), wired via `useDefaults`.
    const solidByDefault = definePreset(hope, {
      components: { badge: { defaultProps: { variant: "solid" } } },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={solidByDefault}>
        <Badge colorScheme="primary">New</Badge>
      </ThemeProvider>
    ));

    // variant `solid` → `bg-primary`; the built-in default `soft` would be `bg-primary-soft`.
    const cls = container.querySelector('[data-slot="badge"]')?.className ?? "";
    expect(cls).toContain("bg-primary");
    expect(cls).not.toContain("bg-primary-soft");
    dispose();
  });

  it("lets an explicit instance prop override the preset default", async () => {
    const solidByDefault = definePreset(hope, {
      components: { badge: { defaultProps: { variant: "solid" } } },
    });

    const { container, dispose } = mount(() => (
      <ThemeProvider preset={solidByDefault}>
        <Badge variant="soft" colorScheme="primary">
          New
        </Badge>
      </ThemeProvider>
    ));

    const cls = container.querySelector('[data-slot="badge"]')?.className ?? "";
    expect(cls).toContain("bg-primary-soft");
    dispose();
  });
});

describe("Badge hydration", () => {
  // `ssrFixture` is genuine server output: the hydration-fixture bridge renders `Tree` through a
  // nested SSR server (server solid builds) and `badge.ssr.test.tsx` inline-snapshots that same
  // render, so the two agree byte-for-byte. Here `solid-js`/`@solidjs/web` resolve to their client
  // builds, so `hydrateFixture` hydrates that HTML rather than re-rendering it. The client tree must
  // stay structurally identical to the server's — guaranteed by reusing the same `Tree`.
  // `hydrateFixture` proves hydration was silent and reused every node.
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    // The zero-DOM provider injects no `<style>` — not something the reuse check covers.
    expect(container.querySelector("style")).toBeNull();
    expect(container.querySelector('[data-slot="badge-label"]')?.textContent).toBe("New");
    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);

    await expectNoA11yViolations(container);
    dispose();
  });
});
