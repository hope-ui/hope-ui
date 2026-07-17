/// <reference types="vite/client" />

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
    <RootLayout>
      <DefaultCatchBoundary {...props} />
    </RootLayout>
  ),
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  // ThemeProvider must DIRECTLY wrap <Outlet/> in the same component that writes
  // the Outlet. Placing it in a separate layout component that receives the
  // Outlet as `children` puts the Outlet in the parent's owner scope, above the
  // provider — so useTheme() in a routed component can't see the context and
  // throws "must be rendered inside a ThemeProvider root". Context flows through
  // Solid's owner graph, not the DOM tree.
  return (
    <RootLayout>
      <ThemeProvider preset={hope}>
        <Outlet />
      </ThemeProvider>
    </RootLayout>
  );
}

function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html lang="en">
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
