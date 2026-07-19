import { Button } from "@hope-ui/components/button";
import type { JSX } from "@solidjs/web";
import { createFileRoute, Link } from "@tanstack/solid-router";
import { type Component, type ComponentProps, createSignal, For, onSettled, Show } from "solid-js";
import {
  AccessibilityIcon,
  ArrowRightIcon,
  BoxIcon,
  BrandLogoIcon,
  CheckIcon,
  CopyIcon,
  FeatherIcon,
  LayersIcon,
  PaletteIcon,
  SparklesIcon,
  ZapIcon,
} from "~/components/Icons";
import { SITE } from "~/config";

export const Route = createFileRoute("/")({
  component: Home,
});

// ---------------------------------------------------------------------------
// Small, self-contained pieces. Everything is styled with hope-ui's *semantic*
// tokens (bg-surface, text-foreground, bg-primary, border-subtle, …) so the whole
// page themes itself in light and dark with no `dark:` overrides — the same
// contract the components ship with. Motion is CSS-only (see the landing block in
// styles/app.css), so the prerendered page animates without any client JS.
// ---------------------------------------------------------------------------

/** A copyable install command. Client-only clipboard write on click. */
function CopyCommand(props: { command: string; class?: string }) {
  const [copied, setCopied] = createSignal(false);
  const copy = () => {
    void navigator.clipboard?.writeText(props.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy install command: ${props.command}`}
      class={[
        "group inline-flex items-center gap-3 rounded-xl border border-subtle bg-surface-raised/70 px-4 py-2.5 font-mono text-sm text-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        props.class,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span aria-hidden="true" class="select-none text-primary">
        $
      </span>
      <span class="text-xs sm:text-sm">{props.command}</span>
      {/* Icon swap wrapped in host <span>s so the first child of the <Show>
          boundary is a host element, not a component (hydration-safe walk). */}
      <span class="ml-1 grid size-5 shrink-0 place-items-center text-foreground-subtle transition-colors group-hover:text-foreground">
        <Show
          when={copied()}
          fallback={
            <span>
              <CopyIcon class="size-4" />
            </span>
          }
        >
          <span class="text-success">
            <CheckIcon class="size-4" />
          </span>
        </Show>
      </span>
    </button>
  );
}

// The CTAs navigate, so they render a real router Link (client-side nav + preloading) — but
// driven through hope-ui's own Button. Button's `render` polymorphism merges its internal ref
// with the rendered element's into a single function ref, which TanStack's Link honours, so
// these are the live Button component (recipe styling + press behavior) rendered as an <a>.
// `nativeButton={false}` switches Button to the anchor a11y model (role/tabIndex + keyboard
// synthesis) for the swapped-in element; the button→anchor prop cast is the documented
// cross-element `render` boundary (see __internal__/primitives/utils/render/render.md).
function CtaButton(props: {
  to: string;
  children: JSX.Element;
  tone?: "primary" | "neutral";
  class?: string;
}) {
  return (
    <Button
      nativeButton={false}
      variant={props.tone === "neutral" ? "soft" : "solid"}
      colorScheme={props.tone === "neutral" ? "neutral" : "primary"}
      size="xl"
      class={props.class}
      render={(buttonProps) => (
        // Button types `render`'s props against its own element (a <button>); Link wants
        // link-shaped props. Casting at this button→anchor boundary is the documented
        // cross-element `render` trade-off (see render.md). `to` is Link-managed, so it wins.
        <Link {...(buttonProps as unknown as ComponentProps<typeof Link>)} to={props.to} />
      )}
    >
      {props.children}
    </Button>
  );
}

// The window-chrome "traffic light" dots for the floating preview panel.
function WindowDots() {
  return (
    <div class="flex gap-1.5">
      <span class="size-2.5 rounded-full bg-danger/70" />
      <span class="size-2.5 rounded-full bg-warning/80" />
      <span class="size-2.5 rounded-full bg-success/70" />
    </div>
  );
}

// The floating "mini-app" panel on the right of the hero — a real slice of UI
// built from hope-ui Buttons and semantic-token surfaces, floating over a glow.
function HeroPanel() {
  return (
    <div class="relative mx-auto w-full max-w-md lg:mx-0">
      {/* Soft primary glow behind the panel. */}
      <div
        aria-hidden="true"
        class="hope-glow absolute -inset-8 -z-10 rounded-[3rem] bg-primary/25 blur-3xl"
      />

      {/* Main panel. */}
      <div class="hope-float rounded-2xl border border-subtle bg-surface-raised/80 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl">
        <div class="flex items-center justify-between">
          <WindowDots />
          <span class="font-mono text-[11px] text-foreground-subtle">Preview</span>
        </div>

        {/* Mock content card. */}
        <div class="mt-4 rounded-xl border border-subtle bg-surface p-4">
          <div class="flex items-center gap-3">
            <div class="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary shadow-sm">
              <FeatherIcon class="size-5" />
            </div>
            <div class="min-w-0">
              <div class="truncate text-sm font-semibold text-foreground">Fabien MARIE-LOUISE</div>
              <div class="truncate text-xs text-foreground-muted">@verstaple</div>
            </div>
            <span class="ml-auto rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success-emphasis">
              Active
            </span>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="solid" colorScheme="primary">
              Follow
            </Button>
            <Button size="sm" variant="soft" colorScheme="neutral">
              Message
            </Button>
          </div>
        </div>

        {/* Token swatch strip — the semantic role palette. */}
        <div class="mt-4 grid grid-cols-6 gap-2">
          <For
            each={["bg-primary", "bg-success", "bg-info", "bg-warning", "bg-danger", "bg-neutral"]}
          >
            {(c) => <div class={`h-8 rounded-lg ${c} shadow-sm ring-1 ring-black/5`} />}
          </For>
        </div>
      </div>

      {/* Floating satellite chips — pinned to the OUTER corners so they read as
          floating beside the panel without covering its content. */}
      <div class="hope-float-slow absolute -left-6 -top-5 z-10 hidden rounded-xl border border-subtle bg-surface-overlay/90 px-3 py-2 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-2">
        <span class="grid size-6 place-items-center rounded-md bg-info-soft text-info-emphasis">
          <AccessibilityIcon class="size-3.5" />
        </span>
        <span class="text-xs font-medium text-foreground">a11y built in</span>
      </div>
      <div class="hope-float absolute -right-5 -bottom-5 z-10 hidden rounded-xl border border-subtle bg-surface-overlay/90 px-3 py-2 shadow-xl backdrop-blur-md sm:flex sm:items-center sm:gap-2">
        <span class="grid size-6 place-items-center rounded-md bg-primary-soft text-primary-emphasis">
          <SparklesIcon class="size-3.5" />
        </span>
        <span class="text-xs font-medium text-foreground">light + dark</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section class="relative overflow-x-clip">
      {/* Layered decorative background: faint grid + two drifting glow blobs. */}
      <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
        <div class="hope-grid absolute inset-0" />
        <div class="hope-glow absolute -top-24 left-1/4 size-128 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div class="hope-glow absolute -top-10 right-0 size-104 rounded-full bg-info/15 blur-3xl [animation-delay:2s]" />
      </div>

      <div class="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:gap-10 lg:py-28">
        {/* Left column: copy + CTAs. Staggered fade-up on load. */}
        <div class="text-center lg:text-left">
          <span class="hope-fade-up inline-flex items-center gap-2 rounded-full border border-primary-line bg-primary-soft/60 px-3 py-1 text-xs font-medium text-primary-emphasis backdrop-blur-sm">
            <SparklesIcon class="size-3.5" />
            Now in {SITE.version.replace(/-/g, " ")}
          </span>

          <h1 class="hope-fade-up mt-6 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl [animation-delay:80ms]">
            Beautiful components,
            <br class="hidden sm:block" /> built on{" "}
            <span class="hope-gradient-text bg-linear-to-r from-primary via-info to-primary bg-clip-text text-transparent">
              hope
            </span>
            .
          </h1>

          <p class="hope-fade-up mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-foreground-muted lg:mx-0 [animation-delay:160ms]">
            {SITE.description} Powered by semantic design tokens and Tailwind&nbsp;v4 — so every
            component is themeable, accessible, and SSR-ready out of the box.
          </p>

          <div class="hope-fade-up mt-8 flex flex-row justify-center items-center gap-3 lg:justify-start [animation-delay:240ms]">
            <CtaButton to="/get-started">
              Get started
              <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-0.5" />
            </CtaButton>
            <CtaButton to="/components" tone="neutral">
              Browse components
            </CtaButton>
          </div>

          <div class="hope-fade-up mt-6 flex justify-center lg:justify-start [animation-delay:320ms]">
            <CopyCommand command="npm i @hope-ui/components" />
          </div>
        </div>

        {/* Right column: the floating showcase panel. */}
        <div class="hope-fade-up [animation-delay:200ms]">
          <HeroPanel />
        </div>
      </div>
    </section>
  );
}

// A seamless, edge-faded marquee of the library's headline qualities.
const MARQUEE_ITEMS = [
  "Semantic tokens",
  "Light & dark",
  "WAI-ARIA patterns",
  "SSR-ready",
  "Tree-shakeable",
  "TypeScript-first",
  "Tailwind v4",
  "Themeable presets",
  "SolidJS 2.0",
] as const;

function FeatureMarquee() {
  return (
    <section class="border-y border-subtle bg-surface/50 py-6">
      <div class="hope-marquee-mask overflow-hidden">
        <div class="hope-marquee-track flex w-max items-center gap-3" aria-hidden="true">
          {/* Two identical copies → a seamless -50% loop. */}
          <For each={[...MARQUEE_ITEMS, ...MARQUEE_ITEMS]}>
            {(item) => (
              <span class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-subtle bg-surface-raised px-4 py-1.5 text-sm font-medium text-foreground-muted">
                <span class="size-1.5 rounded-full bg-primary" />
                {item}
              </span>
            )}
          </For>
        </div>
      </div>
      {/* Accessible, non-animated equivalent for assistive tech + no-motion. */}
      <p class="sr-only">hope-ui features: {MARQUEE_ITEMS.join(", ")}.</p>
    </section>
  );
}

// The three uniform feature cards shown in a row beneath the full-width
// "Themeable" banner (which is custom — see BentoFeatures).
const FEATURES: {
  icon: Component<{ class?: string }>;
  title: string;
  desc: string;
}[] = [
  {
    icon: AccessibilityIcon,
    title: "Accessible by default",
    desc: "WAI-ARIA patterns, focus management, and full keyboard interaction are built into every primitive — verified with axe on real browsers.",
  },
  {
    icon: ZapIcon,
    title: "Built for SolidJS 2.0",
    desc: "Fine-grained reactivity with clean server rendering and hydration, characterized against the 2.0 beta so upgrades never surprise you.",
  },
  {
    icon: LayersIcon,
    title: "Tailwind v4 + variants",
    desc: "Styling flows through tailwind-variants recipes into clean, unprefixed utilities — no runtime CSS-in-JS, no style tags to hydrate.",
  },
];

function FeatureIcon(props: { icon: Component<{ class?: string }>; class?: string }) {
  // A host <div> chip wrapping the icon component keeps the icon out of any
  // control-flow boundary's first-child slot.
  return (
    <div class="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary-emphasis">
      <props.icon class={props.class ?? "size-5.5"} />
    </div>
  );
}

function BentoFeatures() {
  return (
    <section class="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div class="hope-reveal mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Everything you need, nothing you don't
        </h2>
        <p class="mt-4 text-lg leading-relaxed text-foreground-muted">
          A carefully composed system — from the design tokens up to the polished components.
        </p>
      </div>

      <div class="mt-14 grid gap-4 lg:grid-cols-3">
        {/* "Themeable" — full-width banner across the top: copy on the left, the
            live semantic role palette on the right (stacks on mobile). */}
        <article class="hope-card hope-reveal group flex flex-col items-start gap-8 rounded-2xl border border-subtle bg-surface-raised p-7 shadow-sm transition-all! hover:-translate-y-1 hover:shadow-xl lg:col-span-3 lg:flex-row lg:items-center lg:gap-12">
          <div class="lg:max-w-sm lg:shrink-0">
            <FeatureIcon icon={PaletteIcon} />
            <h3 class="mt-5 text-xl font-semibold text-foreground">Themeable to the core</h3>
            <p class="mt-2 text-foreground-muted">
              Every color, surface, and interaction state resolves through one semantic token
              vocabulary. Flip to dark mode or swap a preset, and your entire UI follows — no
              per-component overrides.
            </p>
          </div>

          {/* Visual: the semantic role palette (solid + soft), which restyles itself
              in light and dark purely through the tokens. */}
          <div class="w-full lg:flex-1">
            <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
              <For
                each={[
                  { name: "primary", solid: "bg-primary", soft: "bg-primary-soft" },
                  { name: "success", solid: "bg-success", soft: "bg-success-soft" },
                  { name: "info", solid: "bg-info", soft: "bg-info-soft" },
                  { name: "warning", solid: "bg-warning", soft: "bg-warning-soft" },
                  { name: "danger", solid: "bg-danger", soft: "bg-danger-soft" },
                  { name: "neutral", solid: "bg-neutral", soft: "bg-neutral-soft" },
                ]}
              >
                {(role) => (
                  <div class="space-y-1.5">
                    <div class={`h-12 rounded-lg ${role.solid} shadow-sm ring-1 ring-black/5`} />
                    <div class={`h-4 rounded-md ${role.soft}`} />
                    <div class="text-center font-mono text-[10px] text-foreground-subtle">
                      {role.name}
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </article>

        {/* Three uniform feature cards in a row below the banner. */}
        <For each={FEATURES}>
          {(feature) => (
            <article class="hope-card hope-reveal group flex flex-col rounded-2xl border border-subtle bg-surface-raised p-7 shadow-sm transition-all! hover:-translate-y-1 hover:shadow-xl">
              <FeatureIcon icon={feature.icon} />
              <h3 class="mt-5 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p class="mt-2 text-sm leading-relaxed text-foreground-muted">{feature.desc}</p>
            </article>
          )}
        </For>
      </div>
    </section>
  );
}

// A live gallery of the real Button component across variants, roles, and states.
function ComponentShowcase() {
  return (
    <section class="relative overflow-x-clip border-y border-subtle bg-surface-sunken/60 py-20 sm:py-28">
      <div
        aria-hidden="true"
        class="hope-glow pointer-events-none absolute left-1/2 top-0 -z-10 size-144 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div class="mx-auto max-w-7xl px-6">
        <div class="hope-reveal mx-auto max-w-2xl text-center">
          <span class="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface-raised px-3 py-1 text-xs font-medium text-foreground-muted">
            <BoxIcon class="size-3.5 text-primary" />
            Real components, right here
          </span>
          <h2 class="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Polished, out of the box
          </h2>
          <p class="mt-4 text-lg leading-relaxed text-foreground-muted">
            Every one of these is a live hope-ui component — hover it, tab to it, toggle the theme.
            What you see is exactly what ships.
          </p>
        </div>

        <div class="hope-reveal mt-12 overflow-hidden rounded-2xl border border-subtle bg-surface-raised shadow-sm">
          {/* Variants row. */}
          <div class="doc-preview flex flex-wrap items-center justify-center gap-3 border-b border-subtle p-8">
            <Button variant="solid" colorScheme="primary">
              Solid
            </Button>
            <Button variant="soft" colorScheme="primary">
              Soft
            </Button>
            <Button variant="outline" colorScheme="primary">
              Outline
            </Button>
            <Button variant="ghost" colorScheme="primary">
              Ghost
            </Button>
            <Button variant="link" colorScheme="primary">
              Link
            </Button>
          </div>

          {/* Color schemes row. */}
          <div class="doc-preview flex flex-wrap items-center justify-center gap-3 border-b border-subtle p-8">
            <Button variant="solid" colorScheme="primary">
              Primary
            </Button>
            <Button variant="solid" colorScheme="success">
              Success
            </Button>
            <Button variant="solid" colorScheme="info">
              Info
            </Button>
            <Button variant="solid" colorScheme="warning">
              Warning
            </Button>
            <Button variant="solid" colorScheme="danger">
              Danger
            </Button>
            <Button variant="soft" colorScheme="neutral">
              Neutral
            </Button>
          </div>

          {/* Sizes + states row. */}
          <div class="doc-preview flex flex-wrap items-center justify-center gap-3 p-8">
            <Button size="xs" variant="soft" colorScheme="primary">
              Extra small
            </Button>
            <Button size="sm" variant="soft" colorScheme="primary">
              Small
            </Button>
            <Button size="lg" variant="solid" colorScheme="primary">
              Large
            </Button>
            <Button size="lg" variant="solid" colorScheme="primary" loading>
              Loading
            </Button>
            <Button size="lg" variant="outline" colorScheme="neutral" disabled>
              Disabled
            </Button>
          </div>
        </div>

        <div class="hope-reveal mt-8 flex justify-center">
          <Link
            to="/components"
            class="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hovered"
          >
            Explore all components
            <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// A short snippet of usage, hand-syntax-highlighted with semantic text tokens
// (no build-time Shiki needed on the homepage).
function UsageSnippet() {
  return (
    <div class="overflow-hidden rounded-2xl border border-subtle bg-surface-sunken shadow-sm">
      <div class="flex items-center gap-2 border-b border-subtle bg-surface-raised px-4 py-2.5">
        <WindowDots />
        <span class="ml-1 font-mono text-xs text-foreground-subtle">App.tsx</span>
      </div>
      <pre class="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
        <code>
          <span class="text-foreground-subtle">{"// one import per component subpath"}</span>
          {"\n"}
          <span class="text-primary">import</span>
          <span class="text-foreground"> {"{ Button }"} </span>
          <span class="text-primary">from</span>
          <span class="text-success-emphasis"> "@hope-ui/components/button"</span>
          <span class="text-foreground">;</span>
          {"\n\n"}
          <span class="text-foreground">&lt;</span>
          <span class="text-info-emphasis">Button</span>
          <span class="text-warning-emphasis"> variant</span>
          <span class="text-foreground">=</span>
          <span class="text-success-emphasis">"soft"</span>
          <span class="text-warning-emphasis"> colorScheme</span>
          <span class="text-foreground">=</span>
          <span class="text-success-emphasis">"primary"</span>
          <span class="text-foreground">&gt;</span>
          {"\n  "}
          <span class="text-foreground">Save changes</span>
          {"\n"}
          <span class="text-foreground">&lt;/</span>
          <span class="text-info-emphasis">Button</span>
          <span class="text-foreground">&gt;</span>
        </code>
      </pre>
    </div>
  );
}

const THEMING_POINTS = [
  "A single set of role tokens — primary, success, info, warning, danger, neutral.",
  "Elevation surfaces and a foreground ramp that stay legible on every background.",
  "Each token carries its own dark value, so one class drives both modes.",
] as const;

function ThemingSpotlight() {
  return (
    <section class="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        {/* min-w-0 on both grid items: a grid item defaults to min-width:auto, so
            below `lg` (single implicit track) the UsageSnippet's long code line would
            size the track to its min-content (~449px) and overflow the viewport,
            dragging the text column wide with it. min-w-0 lets the track shrink to the
            container and the <pre>'s overflow-x-auto scroll instead. */}
        <div class="hope-reveal min-w-0">
          <span class="inline-flex items-center gap-2 rounded-full border border-primary-line bg-primary-soft/60 px-3 py-1 text-xs font-medium text-primary-emphasis">
            <PaletteIcon class="size-3.5" />
            Theming
          </span>
          <h2 class="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Speak in tokens, not hex codes
          </h2>
          <p class="mt-4 text-lg leading-relaxed text-foreground-muted">
            You never hard-code a color. Components reference finished semantic tokens, and a preset
            maps them to a palette — so restyling or theming is a contract, not a rewrite.
          </p>

          <ul class="mt-8 space-y-4">
            <For each={THEMING_POINTS}>
              {(point) => (
                <li class="flex gap-3">
                  <span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success-emphasis">
                    <CheckIcon class="size-3.5" />
                  </span>
                  <span class="text-foreground-muted">{point}</span>
                </li>
              )}
            </For>
          </ul>

          <div class="mt-8">
            <Link
              to="/get-started"
              class="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hovered"
            >
              Read the theming guide
              <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div class="hope-reveal min-w-0 space-y-4">
          <UsageSnippet />

          {/* Elevation surfaces demo. */}
          <div class="rounded-2xl border border-subtle bg-surface-sunken p-4">
            <div class="grid grid-cols-3 gap-3">
              <For
                each={[
                  { name: "sunken", cls: "bg-surface-sunken shadow-inner" },
                  { name: "surface", cls: "bg-surface" },
                  { name: "raised", cls: "bg-surface-raised shadow-sm" },
                ]}
              >
                {(s) => (
                  <>
                    <div
                      class={`flex flex-col justify-end h-16 rounded-xl border border-subtle p-3 ${s.cls}`}
                    >
                      <div class="text-center font-mono text-xs text-foreground-subtle">
                        {s.name}
                      </div>
                    </div>
                  </>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section class="mx-auto max-w-7xl px-6 pb-24">
      {/* `isolate` forces a permanent stacking context so the `-z-10` glow/grid
          backdrop always paints above the card's opaque background. Without it the
          backdrop only shows while the reveal's transform creates a temporary
          context, then vanishes when the transform is removed. */}
      <div class="hope-reveal relative isolate overflow-hidden rounded-3xl border border-subtle bg-surface-raised px-6 py-16 text-center shadow-xl sm:px-16">
        {/* Rich glow backdrop. */}
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
          <div class="hope-glow absolute -left-20 -top-24 size-96 rounded-full bg-primary/25 blur-3xl" />
          <div class="hope-glow absolute -bottom-24 -right-16 size-96 rounded-full bg-info/20 blur-3xl [animation-delay:3s]" />
          <div class="hope-grid absolute inset-0 opacity-60" />
        </div>

        <div class="mx-auto grid size-14 place-items-center rounded-2xl border border-primary-line bg-primary-soft text-primary-emphasis shadow-sm">
          <BrandLogoIcon class="size-10" />
        </div>
        <h2 class="mt-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Start building with{" "}
          <span class="hope-gradient-text bg-linear-to-r from-primary via-info to-primary bg-clip-text text-transparent">
            hope
          </span>
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-foreground-muted">
          Install the components, drop in a preset, and ship an interface you're proud of —
          themeable and accessible from the very first line.
        </p>
        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaButton to="/get-started" class="w-full sm:w-auto">
            Get started
            <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-0.5" />
          </CtaButton>
          <CopyCommand command="npm i @hope-ui/components" />
        </div>
      </div>
    </section>
  );
}

function Home() {
  // Progressive-enhancement scroll reveal. With no JS the `.hope-reveal` elements
  // are already visible (see app.css); after hydration we stamp the root and
  // observe them, so they animate in as they enter the viewport. Runs client-only
  // in onSettled, mutating the DOM directly (never reactive JSX) — so the server
  // and client render identical markup and hydration stays clean.
  let root: HTMLDivElement | undefined;
  onSettled(() => {
    const el = root;
    if (!el) {
      return;
    }
    const items = el.querySelectorAll<HTMLElement>(".hope-reveal");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      for (const n of items) {
        n.classList.add("is-visible");
      }
      return;
    }
    el.setAttribute("data-reveal-root", "");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    for (const n of items) {
      io.observe(n);
    }
  });

  return (
    <div ref={root} class="overflow-x-clip">
      <Hero />
      <FeatureMarquee />
      <BentoFeatures />
      <ComponentShowcase />
      <ThemingSpotlight />
      <FinalCta />
    </div>
  );
}
