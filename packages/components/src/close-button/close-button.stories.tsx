import type { JSX } from "@solidjs/web";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CloseButton } from "./close-button";

const meta = {
  title: "Components/CloseButton",
  component: CloseButton,
} satisfies Meta<typeof CloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CloseButton />,
};

/** sm → lg. A compact corner affordance; `sm` is the default. */
export const Sizes: Story = {
  render: () => (
    <div class="flex items-center gap-3">
      <CloseButton size="sm" />
      <CloseButton size="md" />
      <CloseButton size="lg" />
    </div>
  ),
};

/**
 * The whole point: CloseButton asserts **no color of its own**. The glyph inherits `currentColor` and
 * the hover/press wash + focus ring derive from it, so one component reads correctly on any surface —
 * light, soft-tinted, solid-colored, dark — with zero configuration. Hover/focus each cell to see the
 * adaptive wash and ring pick up that surface's text color.
 */
export const AdaptsToTheSurface: Story = {
  parameters: { layout: "padded" },
  render: () => {
    const Cell = (props: { class: string; label: string }): JSX.Element => (
      <div class={`flex items-center justify-between gap-6 rounded-lg p-4 ${props.class}`}>
        <span class="text-sm font-medium">{props.label}</span>
        <CloseButton />
      </div>
    );
    return (
      <div class="flex flex-col gap-3">
        {/* Light surface: dark text → a dark, low-alpha wash. */}
        <Cell class="bg-surface text-foreground border border-subtle" label="On a light surface" />
        {/* Soft-tinted surface: role-emphasis text → a role-tinted wash. */}
        <Cell class="bg-primary-soft text-primary-emphasis" label="On a soft surface" />
        {/* Solid colored surface: on-color text → a light wash. */}
        <Cell class="bg-primary text-on-primary" label="On a solid surface" />
        {/* Dark surface: light text → a light, low-alpha wash. */}
        <Cell class="bg-surface-inverse text-on-inverse" label="On a dark surface" />
      </div>
    );
  },
};

/**
 * `icon` overrides the built-in X (per instance, or app-wide via a preset's `defaultProps.icon`
 * factory). Here a trash glyph stands in for a "remove" affordance.
 */
export const CustomIcon: Story = {
  render: () => (
    <CloseButton
      aria-label="Remove"
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      }
    />
  ),
};

/** The `render` prop swaps the underlying element while keeping CloseButton's computed props. */
export const AsLink: Story = {
  render: () => (
    <CloseButton
      nativeButton={false}
      render={(p) => (
        <a href="/close" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
      )}
    />
  ),
};

/** Disabled — dimmed via the `opacity-disabled` token, interaction blocked. */
export const Disabled: Story = {
  render: () => <CloseButton disabled />,
};

/**
 * Light + dark side by side, driven purely by the `.dark` class. Because the wash is `currentColor`-
 * derived, the same markup adapts to each theme with no per-scheme tokens.
 */
export const LightAndDark: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const panel = (): JSX.Element => (
      <div class="flex items-center gap-4 bg-surface p-6 text-foreground">
        <CloseButton size="sm" />
        <CloseButton size="md" />
        <CloseButton size="lg" />
      </div>
    );
    return (
      <div class="grid gap-4 md:grid-cols-2">
        {panel()}
        <div class="dark">{panel()}</div>
      </div>
    );
  },
};
