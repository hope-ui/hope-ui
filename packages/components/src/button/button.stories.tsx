import type { JSX } from "@solidjs/web";
import { For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button, type ButtonColor, type ButtonVariant } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- demo icons (plain SVG; the recipe sizes them per button size) ----------

const strokeIcon = (d: string): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);
const PlusIcon = () => strokeIcon("M12 5v14M5 12h14");
const ArrowRightIcon = () => strokeIcon("M5 12h14M13 6l6 6-6 6");
const CheckIcon = () => strokeIcon("M20 6 9 17l-5-5");

const VARIANTS: ButtonVariant[] = ["default", "solid", "soft", "outline", "ghost", "link"];
const COLORED_VARIANTS: Exclude<ButtonVariant, "default">[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "link",
];
const COLORS: ButtonColor[] = ["primary", "neutral", "success", "warning", "danger", "info"];

export const Default: Story = {
  render: () => <Button>Button</Button>,
};

/** The six variants at their default `primary` color (`default` is color-independent chrome). */
export const Variants: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <For each={VARIANTS}>
        {(variant) => <Button variant={variant}>Button ({variant})</Button>}
      </For>
    </div>
  ),
};

/** variant × color — the validated matrix (mirrors the look-&-feel mockup). */
export const VariantColorMatrix: Story = {
  parameters: { layout: "padded" },
  // Each `<For>` callback returns a single element (a flex row, or one cell) — never a fragment
  // wrapping another `<For>`, which produces a variable node count per row and breaks Solid's
  // `<For>` DOM tracking (`nextSibling` of null). Flex rows keep the columns aligned.
  render: () => (
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <span class="w-16" />
        <For each={COLORS}>
          {(color) => (
            <span class="w-24 text-center font-mono text-xs text-foreground-muted">{color}</span>
          )}
        </For>
      </div>
      <For each={COLORED_VARIANTS}>
        {(variant) => (
          <div class="flex items-center gap-3">
            <span class="w-16 text-right font-mono text-xs text-foreground-muted">{variant}</span>
            <For each={COLORS}>
              {(color) => (
                <div class="flex w-24 justify-center">
                  <Button variant={variant} color={color}>
                    Button
                  </Button>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  ),
};

/** xs → xl (heights 28 / 32 / 36 / 40 / 44px). */
export const Sizes: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <Button variant="solid" size="xs">
        Button (xs)
      </Button>
      <Button variant="solid" size="sm">
        Button (sm)
      </Button>
      <Button variant="solid" size="md">
        Button (md)
      </Button>
      <Button variant="solid" size="lg">
        Button (lg)
      </Button>
      <Button variant="solid" size="xl">
        Button (xl)
      </Button>
    </div>
  ),
};

/** Leading / trailing decorators (the recipe trims padding ×0.72 on the icon's side). */
export const Decorators: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <Button variant="solid" startDecorator={<PlusIcon />}>
        New
      </Button>
      <Button variant="default" endDecorator={<ArrowRightIcon />}>
        Continue
      </Button>
      <Button variant="soft" color="success" startDecorator={<CheckIcon />}>
        Saved
      </Button>
    </div>
  ),
};

/**
 * Per-instance `slotClasses` targets individual slots with **literal** Tailwind classes (so the
 * consumer's build can scan them). They fold in after the recipe base and any preset-level
 * `slotClasses`, before `class` — a later utility wins a Tailwind conflict (here `rounded-full`
 * overrides the recipe's `rounded-md`).
 */
export const SlotClasses: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <Button variant="solid" slotClasses={{ root: "rounded-full" }}>
        Pill
      </Button>
      <Button
        variant="soft"
        color="success"
        startDecorator={<CheckIcon />}
        slotClasses={{ label: "uppercase tracking-wide" }}
      >
        Saved
      </Button>
    </div>
  ),
};

/** Loading: centered overlay (default) keeps width and hides the label; `loadingText` stays inline. */
export const Loading: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <Button variant="solid" loading>
        Saving
      </Button>
      <Button variant="soft" color="neutral" loading loadingText="Uploading…">
        Upload
      </Button>
      <Button variant="outline" color="danger" loading loaderPlacement="start">
        Deleting
      </Button>
    </div>
  ),
};

/** Disabled is always neutral grayed chrome, regardless of variant/color. */
export const Disabled: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <For each={VARIANTS}>
        {(variant) => (
          <Button variant={variant} color="primary" disabled>
            {variant}
          </Button>
        )}
      </For>
    </div>
  ),
};

export const FullWidth: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div class="w-80">
      <Button variant="solid" fullWidth>
        Full width
      </Button>
    </div>
  ),
};

/**
 * Light + dark side by side, driven purely by the `.dark` class toggling hope's tokens — the
 * reference for comparing against the validated look-&-feel mockup.
 */
export const LightAndDark: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const panel = (): JSX.Element => (
      <div class="flex flex-col gap-4 bg-surface p-6 text-foreground">
        <div class="flex flex-wrap items-center gap-3">
          <For each={VARIANTS}>{(variant) => <Button variant={variant}>{variant}</Button>}</For>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <For each={COLORS}>
            {(color) => (
              <Button variant="solid" color={color}>
                {color}
              </Button>
            )}
          </For>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Button variant="solid" startDecorator={<PlusIcon />}>
            New
          </Button>
          <Button variant="soft" color="success" startDecorator={<CheckIcon />}>
            Saved
          </Button>
          <Button variant="solid" loading>
            Saving
          </Button>
          <Button variant="solid" disabled>
            Disabled
          </Button>
        </div>
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

/**
 * A native disabled button uses the native `disabled` attribute (which also removes it from the
 * tab order) — with no redundant `aria-disabled`. Tab past it to confirm it is skipped.
 */
export const NativeDisabled: Story = {
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
      variant="solid"
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
