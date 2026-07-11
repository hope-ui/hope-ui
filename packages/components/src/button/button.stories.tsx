import type { JSX } from "@solidjs/web";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Button>Click me</Button>,
};

/**
 * `disabled` sets both the native attribute and `aria-disabled`. Note the native attribute
 * also removes the button from the tab order — Tab past it to confirm.
 */
export const Disabled: Story = {
  render: () => <Button disabled>Can't click me</Button>,
};

/**
 * The `render` prop swaps the underlying element while keeping Button's computed props.
 * Switching element kinds (button → anchor) needs an explicit assertion, since `render` is
 * typed against Button's own props. See `@solid-zero/primitives`' `render.md`.
 */
export const AsAnchor: Story = {
  render: () => (
    <Button
      render={(p) => (
        <a href="/docs" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
      )}
    >
      Link button
    </Button>
  ),
};

/**
 * Canary for the `solid-refresh` prop-forwarding bug documented in CLAUDE.md: HMR wrapping
 * used to silently drop `children` for components imported from another module — which is
 * exactly what every story does. If this story renders an empty button, `refresh` got
 * re-enabled somewhere; check `solid-babel-options.ts`.
 */
export const ChildrenReachTheDom: Story = {
  name: "Children reach the DOM (solid-refresh canary)",
  render: () => (
    <Button>
      <span data-testid="canary">children rendered</span>
    </Button>
  ),
};
