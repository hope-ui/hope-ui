/// <reference types="vite/client" />

import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/solid-router";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seo({
        title: "hope-ui",
        description: "Batteries-included, themed, accessible components for SolidJS.",
      }),
    ],
    links: [{ rel: "stylesheet", href: appCss }],
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
      <body>
        <div class="p-2 flex gap-4 text-lg border-b">
          <Link to="/" activeProps={{ class: "font-bold" }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/docs" activeProps={{ class: "font-bold" }}>
            Docs
          </Link>
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
