import { Portal } from "@solidjs/web";
import { useLocation } from "@tanstack/solid-router";
import { createEffect, createSignal, For, Show } from "solid-js";
import { BrandLogoIcon, CloseIcon, MenuIcon } from "~/components/Icons";
import { PathLink } from "~/components/PathLink";
import { SectionNav } from "~/components/SectionNav";
import { SITE } from "~/config";
import { PRIMARY_NAV, sectionFromPathname } from "~/lib/nav";

// Focusable elements inside the open drawer, for the focus trap below.
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// The small-viewport navigation. On desktop (`md:`+) the header tabs and the
// DocsSection sidebar carry every link; below that both are hidden, so this
// supplies the *only* navigation: a hamburger button that opens a full-height
// drawer with the primary section switcher plus the current section's page list
// (the same auto-generated SectionNav the desktop sidebar renders, so it scales
// to 40+ component pages for free).
//
// TODO(Sheet): the drawer below is hand-rolled — both its dialog *behavior*
// (focus trap, Escape, scroll lock, aria-modal wiring) and its drawer styling.
// Replace the whole thing with hope-ui's **Sheet** component (a full-featured,
// already-styled drawer) once it ships: that collapses both the behavior and the
// styling into one themed component. Kept hand-rolled until then — do NOT reach
// for @hope-ui/components/dialog in the meantime (it's still unfinished).
//
// Rendered inside SiteHeader but the overlay is Portal-ed to <body>: the header
// sets `backdrop-blur`, which makes it a containing block for `position: fixed`
// descendants — a `fixed inset-0` scrim nested in it would size to the 3.5rem
// header, not the viewport. The Portal escapes that. The overlay only mounts
// while `open()` (false on the server and at hydration), so there is no SSR
// Portal to gate and no hydration mismatch.
export function MobileNav() {
  const [open, setOpen] = createSignal(false);
  const pathname = useLocation({ select: (location) => location.pathname });
  const section = () => sectionFromPathname(pathname());

  let triggerRef: HTMLButtonElement | undefined;
  let panelRef: HTMLDivElement | undefined;

  // Guarded so the route-change effect below (which fires on every navigation,
  // including desktop ones and the initial mount) never steals focus when the
  // drawer wasn't open. Only a real close restores focus to the trigger.
  const close = () => {
    if (!open()) {
      return;
    }
    setOpen(false);
    triggerRef?.focus();
  };

  // Close on any route change — covers in-drawer link taps and browser
  // back/forward. The split-form effect runs once on mount too; `close()`
  // no-ops while closed, so that first run is harmless.
  createEffect(
    () => pathname(),
    () => close(),
  );

  // While open: trap Tab focus within the panel, close on Escape, and lock
  // background scroll. All DOM access lives inside the effect, so it never runs
  // on the server. The returned teardown restores everything on close/dispose.
  createEffect(
    () => open(),
    (isOpen) => {
      if (!isOpen) {
        return;
      }
      const focusables = () =>
        panelRef ? Array.from(panelRef.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
      focusables()[0]?.focus();

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          close();
          return;
        }
        if (event.key !== "Tab") {
          return;
        }
        const items = focusables();
        if (items.length === 0) {
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === panelRef)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener("keydown", onKeyDown);

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = previousOverflow;
      };
    },
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open() ? "true" : "false"}
        aria-controls="mobile-nav-drawer"
        aria-haspopup="dialog"
        class="grid size-9 place-items-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised-hovered hover:text-foreground lg:hidden"
      >
        <MenuIcon class="size-5" />
      </button>

      <Show when={open()}>
        <Portal>
          {/* Scrim — a full-viewport button so closing on tap needs no static
              interactive element (kept out of the tab order; Escape and the
              in-panel close button are the keyboard affordances). */}
          <button
            type="button"
            tabindex={-1}
            aria-label="Close navigation menu"
            onClick={close}
            class="hope-scrim-in fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          <div
            ref={panelRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            tabindex={-1}
            class="hope-drawer-in fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-surface shadow-xl"
          >
            <div class="flex h-14 shrink-0 items-center gap-2.5 border-b border-subtle px-4">
              <BrandLogoIcon class="size-8" />
              <span class="text-base font-semibold tracking-tight text-foreground">
                {SITE.name}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close navigation menu"
                class="ml-auto grid size-9 place-items-center rounded-md text-foreground-muted transition-colors hover:bg-surface-raised-hovered hover:text-foreground"
              >
                <CloseIcon class="size-5" />
              </button>
            </div>

            <nav
              class="flex-1 space-y-6 overflow-y-auto px-4 py-6"
              aria-label="Site and section navigation"
            >
              <ul class="space-y-1">
                <For each={PRIMARY_NAV}>
                  {(item) => (
                    <li>
                      <PathLink
                        to={item.to}
                        onClick={close}
                        activeOptions={{ exact: false }}
                        class="block rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-raised-hovered hover:text-foreground"
                        activeProps={{ class: "bg-primary text-on-primary hover:bg-primary" }}
                      >
                        {item.label}
                      </PathLink>
                    </li>
                  )}
                </For>
              </ul>

              <Show when={section()}>
                {(kind) => (
                  <div class="space-y-6 border-t border-subtle pt-6">
                    <SectionNav kind={kind()} onNavigate={close} />
                  </div>
                )}
              </Show>
            </nav>
          </div>
        </Portal>
      </Show>
    </>
  );
}
