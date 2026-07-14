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
 * A native disabled button uses the native `disabled` attribute (which also removes it from the
 * tab order) — with no redundant `aria-disabled`. Tab past it to confirm it is skipped.
 */
export const Disabled: Story = {
  render: () => <Button disabled>Can't click me</Button>,
};

/**
 * The `render` prop swaps the underlying element while keeping Button's behavior. Pair it with
 * `nativeButton={false}` for a non-`<button>` element: Button then applies `role="button"`,
 * `tabIndex`, and synthesizes keyboard activation, so the anchor announces and behaves as a button.
 * Enter and Space both activate it.
 */
export const AsAnchor: Story = {
  render: () => (
    <Button
      nativeButton={false}
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
