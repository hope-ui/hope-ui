import { Link } from "@tanstack/solid-router";
import { createSignal, For, onSettled, Show } from "solid-js";
import { BrandLogoIcon, MoonIcon, SearchIcon, SunIcon } from "~/components/Icons";
import { MobileNav } from "~/components/MobileNav";
import { SITE } from "~/config";
import { PRIMARY_NAV } from "~/lib/nav";

// The primary top navigation bar: brand + version badge on the left, the section
// tabs (active tab rendered as a filled pill), and a search field + theme toggle
// on the right. Sticky and full-bleed, matching the docs-site shell. Lives outside
// the ThemeProvider (it uses only Tailwind utilities, never useTheme()), so it also
// renders on the error/not-found boundaries.
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
    <button
      type="button"
      onClick={toggle}
      class="grid size-9 place-items-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised-hovered hover:text-foreground"
      aria-label="Toggle dark mode"
    >
      <Show when={dark()} fallback={<MoonIcon class="size-4.5" />}>
        <SunIcon class="size-4.5" />
      </Show>
    </button>
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

        <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          <For each={PRIMARY_NAV}>
            {(item) => (
              <Link to={item.to} class={TAB}>
                {item.label}
              </Link>
            )}
          </For>
        </nav>

        <div class="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            title="Search is coming soon"
            aria-label="Search (coming soon)"
            class="hidden w-56 items-center gap-2 rounded-lg border border-subtle bg-surface-sunken px-3 py-1.5 text-sm text-foreground-subtle transition-colors hover:border-strong sm:flex"
          >
            <SearchIcon class="size-4 shrink-0" />
            <span>Search…</span>
            <kbd class="ml-auto rounded border border-subtle bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-foreground-subtle">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
