import { Button } from "@hope-ui/components/button";
import type { JSX } from "@solidjs/web";
import { Link } from "@tanstack/solid-router";
import { createSignal, For, omit, onSettled, Show } from "solid-js";
import { BrandLogoIcon, GitHubIcon, MoonIcon, SearchIcon, SunIcon } from "~/components/Icons";
import { MobileNav } from "~/components/MobileNav";
import { SITE } from "~/config";
import { PRIMARY_NAV } from "~/lib/nav";

// The primary top navigation bar: brand + version badge on the left, the section
// tabs (active tab rendered as a filled pill), and a search field, repo link and
// theme toggle on the right. Sticky and full-bleed, matching the docs-site shell.
// The two icon affordances are real hope-ui Buttons, so the site's own chrome is
// dogfooding the library; that needs a ThemeProvider above the header, which is why
// `__root.tsx` mounts the providers around <html> — on the error and not-found
// boundaries too, where this header also renders.
//
// The section tabs collapse below `md`; on small viewports MobileNav (the hamburger
// + drawer, rendered in the right cluster) is the sole navigation. Both read the
// section list from the shared PRIMARY_NAV. There is no "Home" tab — the brand
// wordmark links there, so a tab would be redundant.

// Tab styling driven entirely by the `data-status="active"` attribute TanStack Link
// emits (no `activeProps`). The idle hover styles are guarded with
// `not-data-[status=active]` so hovering the *active* tab keeps its filled pill instead
// of reverting to the idle-hover background.
const TAB = [
  "rounded-md px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors",
  "not-data-[status=active]:hover:bg-surface-raised-hovered not-data-[status=active]:hover:text-foreground",
  "data-[status=active]:bg-primary data-[status=active]:text-on-primary",
].join(" ");

// `md` is the 32px icon-only square. `ghost`/`neutral` is the recipe's quietest chrome, and the
// label slot carries the header's own muted foreground so the icons sit at the weight of the nav
// text rather than the recipe's `neutral-emphasis`.
const ICON_BUTTON = {
  iconOnly: true,
  variant: "ghost",
  colorScheme: "neutral",
  size: "md",
  slotClasses: {
    label: "text-foreground-muted",
  },
} as const;

// Client-only light/dark switch. It toggles `.dark` on <html>, which is what the
// hope preset's `dark` variant keys on. The initial state is read after mount
// (never during SSR/hydration render, so no mismatch); the server always emits the
// light markup.
function ThemeToggle() {
  const [dark, setDark] = createSignal(false);

  onSettled(() => {
    const stored = localStorage.getItem("hope-docs-theme");
    const isDark =
      stored === "dark" ||
      (stored == null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
  });

  const toggle = () => {
    const next = !dark();
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("hope-docs-theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <Button {...ICON_BUTTON} onClick={toggle} aria-label="Toggle dark mode">
      <Show when={dark()} fallback={<MoonIcon />}>
        <SunIcon />
      </Show>
    </Button>
  );
}

// The repo link. `nativeButton={false}` switches Button to the non-native a11y model
// (role/tabIndex + keyboard synthesis) for the swapped-in <a>, the same boundary the
// homepage CTAs cross — see `__internal__/primitives/render/render.md`.
function RepositoryLink() {
  return (
    <Button
      {...ICON_BUTTON}
      nativeButton={false}
      aria-label={`${SITE.name} on GitHub`}
      render={(buttonProps) => (
        // Button types `render`'s props against its own <button>; the cast is the documented
        // cost of crossing to an anchor (render.md, "cross-element `render` typing").
        //
        // `role` is omitted rather than overwritten: this navigates, and an <a href> already
        // announces as a link, so the non-native model's `role="button"` would misname it.
        // Everything else that model brings is still wanted — the press engine adds Space
        // activation on top of the anchor's native Enter.
        <a
          {...(omit(buttonProps, "role") as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={SITE.repository}
          target="_blank"
          rel="noreferrer"
        />
      )}
    >
      <GitHubIcon />
    </Button>
  );
}

export function SiteHeader() {
  return (
    <header class="sticky top-0 z-40 border-b border-subtle bg-surface/85 backdrop-blur-sm">
      <div class="mx-auto flex h-14 max-w-360 items-center gap-3 px-6">
        <Link to="/" class="flex items-center gap-2.5" aria-label="hope-ui home">
          <BrandLogoIcon class="size-10" />
          <span class="text-base font-semibold tracking-tight text-foreground">{SITE.name}</span>
          <span class="rounded-full border border-primary-line bg-primary-soft px-1.5 py-0.5 font-medium font-mono text-[10px] text-primary-emphasis">
            {SITE.version}
          </span>
        </Link>

        <nav class="ms-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          <For each={PRIMARY_NAV}>
            {(item) => (
              <Link to={item.to} class={TAB}>
                {item.label}
              </Link>
            )}
          </For>
        </nav>

        <div class="ms-auto flex items-center gap-1.5">
          <button
            type="button"
            title="Search is coming soon"
            aria-label="Search (coming soon)"
            class="hidden w-56 items-center gap-2 rounded-lg border border-subtle bg-surface-sunken px-3 py-1.5 text-sm text-foreground-subtle transition-colors hover:border-strong sm:flex"
          >
            <SearchIcon class="size-4 shrink-0" />
            <span>Search…</span>
            <kbd class="ms-auto rounded border border-subtle bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-foreground-subtle">
              ⌘K
            </kbd>
          </button>
          <RepositoryLink />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
