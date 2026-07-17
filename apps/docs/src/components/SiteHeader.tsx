import { Link } from "@tanstack/solid-router";
import { createSignal, For, onSettled, Show } from "solid-js";
import { MoonIcon, SearchIcon, SunIcon } from "~/components/Icons";

// The primary top navigation bar: brand + version badge on the left, the section
// tabs (active tab rendered as a filled pill), and a search field + theme toggle
// on the right. Sticky and full-bleed, matching the docs-site shell. Lives outside
// the ThemeProvider (it uses only Tailwind utilities, never useTheme()), so it also
// renders on the error/not-found boundaries.
//
// There is no "Home" tab — the brand wordmark links there, so a tab would be redundant.
const NAV = [
  { to: "/get-started", label: "Get started" },
  { to: "/components", label: "Components" },
  { to: "/changelog", label: "Changelog" },
] as const;

// Tab styling driven entirely by the `data-status="active"` attribute TanStack Link
// emits (no `activeProps`). The idle hover styles are guarded with
// `not-data-[status=active]` so hovering the *active* tab keeps its filled pill instead
// of reverting to the idle-hover background.
const TAB = [
  "rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors dark:text-gray-300",
  "not-data-[status=active]:hover:bg-gray-100 not-data-[status=active]:hover:text-gray-900",
  "dark:not-data-[status=active]:hover:bg-gray-800 dark:not-data-[status=active]:hover:text-white",
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
      class="grid size-9 place-items-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
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
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/85">
      <div class="mx-auto flex h-14 max-w-360 items-center gap-3 px-6">
        <Link to="/" class="flex items-center gap-2.5" aria-label="hope-ui home">
          <span class="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-on-primary">
            H
          </span>
          <span class="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white">
            hope-ui
          </span>
          <span class="rounded-full border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
            beta
          </span>
        </Link>

        <nav class="ml-4 hidden items-center gap-1 md:flex" aria-label="Primary">
          <For each={NAV}>
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
            class="hidden w-56 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-300 sm:flex dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-gray-700"
          >
            <SearchIcon class="size-4 shrink-0" />
            <span>Search…</span>
            <kbd class="ml-auto rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
