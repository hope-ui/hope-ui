/// <reference types="vite/client" />

import { I18nProvider } from "@hope-ui/i18n";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/solid-router";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import { SiteHeader } from "~/components/SiteHeader";
import { SITE } from "~/config";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seo({
        title: SITE.name,
        description: SITE.description,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Inter — the docs typeface. Loaded client-side; the prerendered HTML just
      // carries the <link>, so SSG is unaffected. `display=swap` avoids blocking.
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  errorComponent: (props) => (
    <AppProviders>
      <RootLayout>
        <DefaultCatchBoundary {...props} />
      </RootLayout>
    </AppProviders>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

// Theme and locale for the whole app — above <html>, so the site chrome (SiteHeader's hope-ui
// Buttons), the routed page, and the error/not-found boundaries all resolve the same context.
// Both providers are zero-DOM, so wrapping the document costs no markup.
//
// `props.children` is read INSIDE the JSX and never destructured in the signature. Context flows
// through Solid's owner graph, not the DOM tree: a destructured `children` is evaluated when this
// component is called, in the caller's owner scope — above these providers — so every useTheme()
// below would throw "must be rendered inside a ThemeProvider root".
//
// The explicit `locale` is this site following its own advice (get-started/i18n, "Server side
// rendering"): every page is prerendered, and pinning the locale is the deterministic form — no
// detection, so nothing re-renders after hydration and a demo's readout never disagrees with the
// prose around it. `en-US` matches the site's English copy and `<html lang>`/`<html dir>`; demos
// showcasing other locales nest their own provider.
function AppProviders(props: { children: JSX.Element }) {
  return (
    <ThemeProvider preset={hope}>
      <I18nProvider locale="en-US">{props.children}</I18nProvider>
    </ThemeProvider>
  );
}

function RootComponent() {
  return (
    <AppProviders>
      <RootLayout>
        <Outlet />
      </RootLayout>
    </AppProviders>
  );
}

function RootLayout({ children }: { children: JSX.Element }) {
  return (
    // `dir` is the other half of the locale AppProviders pins: hope-ui takes arrow-key direction
    // from the locale and layout direction from the cascade, so declaring only one leaves the two
    // free to disagree (get-started/i18n, "Reading direction"). Written statically rather than from
    // an effect because every page is prerendered English — the form that guide gives for a locale
    // the server already knows. An RTL demo still overrides it on its own subtree.
    <html lang="en" dir="ltr">
      <head>
        <HeadContent />
      </head>
      <body class="relative isolate flex min-h-screen flex-col">
        {/* Decorative polka-dot texture fading in at the very bottom of the page.
            Pinned to the body's bottom, behind all content (-z-10), non-interactive;
            `bg-*` sets the dot color (the pattern itself is a CSS mask — see app.css). */}
        <div
          aria-hidden="true"
          class="dots-fade pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-80 bg-strong"
        />
        <SiteHeader />
        <main class="flex-1">{children}</main>
        {/* Opaque page-colored bg so the decorative dots never sit behind the footer
            text (they read only in the content area above it). */}
        <footer class="relative border-t border-subtle bg-surface-sunken">
          <div class="mx-auto flex max-w-360 flex-col gap-1 px-6 py-8 text-sm text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              {SITE.name} &bull; {SITE.description}
            </p>
            <p>&copy; 2026-present Fabien MARIE-LOUISE.</p>
          </div>
        </footer>
        <Scripts />
      </body>
    </html>
  );
}
