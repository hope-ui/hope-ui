import type { JSX } from "@solidjs/web";
import { For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Badge, type BadgeColorScheme, type BadgeVariant } from "./badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------- demo icons (plain SVG; the recipe sizes them per badge size) ----------

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
const CheckIcon = () => strokeIcon("M20 6 9 17l-5-5");
const StarIcon = () =>
  strokeIcon(
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  );

const VARIANTS: BadgeVariant[] = ["solid", "inverted", "soft", "subtle", "outline", "dot"];
const COLORS: BadgeColorScheme[] = ["primary", "neutral", "success", "info", "warning", "danger"];

export const Default: Story = {
  render: () => <Badge>Badge</Badge>,
};

/** The six variants at their default `neutral` color. `inverted` gets its own solid-surface story. */
export const Variants: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <For each={VARIANTS}>{(variant) => <Badge variant={variant}>{variant}</Badge>}</For>
    </div>
  ),
};

/**
 * `inverted` is the literal swap of `solid` (the on-color as fill, the role as text). It is designed
 * to sit on a **solid, colored surface**, so it is shown here on a dark panel. `warning` honestly
 * inverts to a dark chip — the documented consequence of a symmetric swap, not a special case.
 */
export const Inverted: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div class="flex flex-wrap items-center gap-3 rounded-lg bg-surface-inverse p-6">
      <For each={COLORS}>
        {(color) => (
          <Badge variant="inverted" colorScheme={color}>
            {color}
          </Badge>
        )}
      </For>
    </div>
  ),
};

/** variant × color — the validated matrix. */
export const VariantColorMatrix: Story = {
  parameters: { layout: "padded" },
  // Each `<For>` callback returns a single element (a flex row, or one cell) — never a fragment
  // wrapping another `<For>`, which produces a variable node count per row and breaks Solid's `<For>`
  // DOM tracking. The `inverted` row sits on a dark strip so its light fills stay visible.
  render: () => (
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <span class="w-16" />
        <For each={COLORS}>
          {(color) => (
            <span class="w-20 text-center font-mono text-xs text-foreground-muted">{color}</span>
          )}
        </For>
      </div>
      <For each={VARIANTS}>
        {(variant) => (
          <div
            class={`flex items-center gap-3 rounded-md ${variant === "inverted" ? "bg-surface-inverse py-2" : ""}`}
          >
            <span class="w-16 text-right font-mono text-xs text-foreground-muted">{variant}</span>
            <For each={COLORS}>
              {(color) => (
                <div class="flex w-20 justify-center">
                  <Badge variant={variant} colorScheme={color}>
                    Badge
                  </Badge>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  ),
};

/** The soft variant across every color scheme. */
export const ColorSchemes: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <For each={COLORS}>
        {(color) => (
          <Badge variant="soft" colorScheme={color}>
            {color}
          </Badge>
        )}
      </For>
    </div>
  ),
};

/** xs → lg. */
export const Sizes: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <Badge variant="solid" size="xs">
        xs
      </Badge>
      <Badge variant="solid" size="sm">
        sm
      </Badge>
      <Badge variant="solid" size="md">
        md
      </Badge>
      <Badge variant="solid" size="lg">
        lg
      </Badge>
    </div>
  ),
};

/** sharp / rounded / pill / circle. `circle` squares the aspect for a single glyph or count. */
export const Shapes: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <Badge variant="soft" shape="sharp">
        sharp
      </Badge>
      <Badge variant="soft" shape="rounded">
        rounded
      </Badge>
      <Badge variant="soft" shape="pill">
        pill
      </Badge>
      <Badge variant="solid" colorScheme="danger" shape="circle" size="md">
        3
      </Badge>
    </div>
  ),
};

/** Leading / trailing decorators (the recipe sizes the icon per badge size). */
export const Decorators: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <Badge variant="soft" colorScheme="success" startDecorator={<CheckIcon />}>
        Verified
      </Badge>
      <Badge variant="solid" colorScheme="warning" startDecorator={<StarIcon />}>
        Featured
      </Badge>
    </div>
  ),
};

/** `dot` is a variant: neutral chrome with a role-colored status dot. */
export const Dot: Story = {
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <For each={COLORS}>
        {(color) => (
          <Badge variant="dot" colorScheme={color}>
            {color}
          </Badge>
        )}
      </For>
    </div>
  ),
};

export const FullWidth: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div class="w-80">
      <Badge variant="soft" colorScheme="info" fullWidth>
        Full width
      </Badge>
    </div>
  ),
};

/**
 * The `render` prop swaps the underlying element while keeping Badge's computed props — here a
 * linkable tag rendered as an `<a>`.
 */
export const AsLink: Story = {
  render: () => (
    <Badge
      variant="soft"
      colorScheme="primary"
      render={(p) => (
        <a href="/tags/new" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />
      )}
    >
      Linkable
    </Badge>
  ),
};

/**
 * Light + dark side by side, driven purely by the `.dark` class toggling hope's tokens — the
 * reference for comparing against the validated look-&-feel.
 */
export const LightAndDark: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const panel = (): JSX.Element => (
      <div class="flex flex-col gap-4 bg-surface p-6 text-foreground">
        <div class="flex flex-wrap items-center gap-3">
          <For each={VARIANTS}>{(variant) => <Badge variant={variant}>{variant}</Badge>}</For>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <For each={COLORS}>
            {(color) => (
              <Badge variant="soft" colorScheme={color}>
                {color}
              </Badge>
            )}
          </For>
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
