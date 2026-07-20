import type { JSX } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Alert, type AlertColorScheme, type AlertVariant } from ".";

const meta = {
  title: "Components/Alert",
  component: Alert.Root,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Alert.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS: AlertVariant[] = ["default", "solid", "soft", "subtle", "outline"];
const COLORS: AlertColorScheme[] = ["primary", "neutral", "success", "info", "warning", "danger"];

// A plain demo glyph for the primary/neutral roles (which ship no built-in status icon).
const SparklesIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
  </svg>
);

/** The default variant: a role-neutral raised surface whose icon + title carry the role color. */
export const Default: Story = {
  render: () => (
    <div class="max-w-md">
      <Alert.Root
        colorScheme="info"
        title="Update available"
        description="A new version is ready to install."
      />
    </div>
  ),
};

/** The five variants at `info`. Only `default` keeps a role-neutral surface (icon + title colored). */
export const Variants: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-3">
      <For each={VARIANTS}>
        {(variant) => (
          <Alert.Root
            variant={variant}
            colorScheme="info"
            title={variant}
            description="The quick brown fox jumps over the lazy dog."
          />
        )}
      </For>
    </div>
  ),
};

/** variant × colorScheme — the validated matrix. */
export const VariantColorMatrix: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div class="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
      <For each={VARIANTS}>
        {(variant) => (
          <div class="flex flex-col gap-2">
            <span class="font-mono text-xs text-foreground-muted">{variant}</span>
            <For each={COLORS}>
              {(color) => (
                <Alert.Root
                  variant={variant}
                  colorScheme={color}
                  icon={color === "primary" || color === "neutral" ? <SparklesIcon /> : undefined}
                  title={color}
                  description="A short description line."
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  ),
};

/** sm → lg. */
export const Sizes: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-3">
      <Alert.Root
        size="sm"
        colorScheme="success"
        title="Small"
        description="Compact density (sm)."
      />
      <Alert.Root
        size="md"
        colorScheme="success"
        title="Medium"
        description="Default density (md)."
      />
      <Alert.Root size="lg" colorScheme="success" title="Large" description="Roomy density (lg)." />
    </div>
  ),
};

/** Convenience props (Root auto-composes) vs the explicit compound anatomy — same result. */
export const ConvenienceVsCompound: Story = {
  render: () => (
    <div class="flex max-w-md flex-col gap-3">
      <Alert.Root
        colorScheme="warning"
        title="Convenience"
        description="Auto-composed from title/description/icon props."
      />
      <Alert.Root colorScheme="warning">
        <Alert.Icon>
          <SparklesIcon />
        </Alert.Icon>
        <Alert.Content>
          <Alert.Title>Compound</Alert.Title>
          <Alert.Description>
            Built from Alert.Icon / Content / Title / Description.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    </div>
  ),
};

/** Title only (no description) and title + rich description with an actions row. */
export const WithActions: Story = {
  render: () => (
    <div class="max-w-md">
      <Alert.Root colorScheme="danger" title="Your session is about to expire">
        <Alert.Content>
          <Alert.Title>Your session is about to expire</Alert.Title>
          <Alert.Description>Save your work or extend the session to keep going.</Alert.Description>
          <Alert.Actions>
            <button
              type="button"
              class="rounded-md bg-danger px-3 py-1 text-sm font-medium text-on-danger"
            >
              Extend session
            </button>
            <button
              type="button"
              class="rounded-md px-3 py-1 text-sm font-medium text-danger-emphasis"
            >
              Log out
            </button>
          </Alert.Actions>
        </Alert.Content>
      </Alert.Root>
    </div>
  ),
};

/**
 * `closable` renders an `Alert.CloseTrigger`. Dismissing plays the exit transition (opacity + slide), then
 * unmounts and fires `onExitComplete`. "Show again" re-opens it (controlled `open`).
 */
export const Dismissible: Story = {
  render: () => {
    const [open, setOpen] = createSignal(true);
    return (
      <div class="flex max-w-md flex-col items-start gap-3">
        <Alert.Root
          open={open()}
          onOpenChange={setOpen}
          closable
          colorScheme="success"
          title="Saved"
          description="Dismiss me — I fade and slide out."
        />
        <button
          type="button"
          class="rounded-md border border-subtle px-3 py-1 text-sm font-medium text-foreground"
          onClick={() => setOpen(true)}
        >
          Show again
        </button>
      </div>
    );
  },
};

/** A custom instance icon overrides the default status glyph. */
export const CustomIcon: Story = {
  render: () => (
    <div class="max-w-md">
      <Alert.Root
        colorScheme="primary"
        icon={<SparklesIcon />}
        title="Now with sparkles"
        description="An explicit `icon` prop wins over the role default."
      />
    </div>
  ),
};

/** Long content wraps and the icon stays top-aligned; the close button never shrinks. */
export const LongContent: Story = {
  render: () => (
    <div class="max-w-md">
      <Alert.Root
        colorScheme="info"
        closable
        title="Scheduled maintenance"
        description="Our services will be briefly unavailable on Saturday between 2:00 and 4:00 AM UTC while we upgrade the database. During this window you may see intermittent errors. No action is required on your part; sessions will resume automatically once the migration completes."
      />
    </div>
  ),
};

/** Light + dark side by side, driven purely by the `.dark` class toggling hope's tokens. */
export const LightAndDark: Story = {
  parameters: { layout: "fullscreen" },
  render: () => {
    const panel = (): JSX.Element => (
      <div class="flex flex-col gap-3 bg-surface p-6 text-foreground">
        <For each={VARIANTS}>
          {(variant) => (
            <Alert.Root
              variant={variant}
              colorScheme="danger"
              title={variant}
              description="The quick brown fox jumps over the lazy dog."
            />
          )}
        </For>
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
