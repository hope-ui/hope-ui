// @refresh reload
import "./styles/index.css";
import "./styles/code.css";

import {
  ColorModeScript,
  cookieStorageManagerSSR,
  DEFAULT_THEME,
  extendTheme,
  HopeProvider,
  injectCriticalStyle,
  PopoverTheme,
} from "@hope-ui/core";
import { Suspense, useContext } from "solid-js";
import { isServer } from "solid-js/web";
import { MDXProvider } from "solid-mdx";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  ServerContext,
  Stylesheet,
} from "solid-start";

import { Layout } from "./components/layout";
import { mdxComponents } from "./mdx-components";

export const mods = /*#__PURE__*/ import.meta.glob<
  true,
  any,
  {
    getHeadings: () => {
      depth: number;
      text: string;
      slug: string;
    }[];
  }
>("./routes/docs/**/*.{md,mdx}", {
  eager: true,
  query: {
    meta: "",
  },
});

const theme = extendTheme({
  fonts: {
    sans: `Inter, ${DEFAULT_THEME.fonts.sans}`,
    display: `Lexend, ${DEFAULT_THEME.fonts.sans}`,
  },
  sizes: {
    "8xl": "96rem",
  },
  components: {
    Popover: {
      styleConfigOverride: {
        root: {
          baseStyle: {
            zIndex: "docked",
          },
        },
      },
    } as PopoverTheme,
  },
});

export default function Root() {
  const event = useContext(ServerContext);

  const storageManager = cookieStorageManagerSSR(
    isServer ? event?.request.headers.get("cookie") ?? "" : document.cookie
  );

  injectCriticalStyle();

  return (
    <Html lang="en">
      <Head>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <Link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <Link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <Link rel="manifest" href="/site.webmanifest" />
        <Stylesheet href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" />
      </Head>
      <Body>
        <ColorModeScript storageType={storageManager.type} />
        <HopeProvider theme={theme} storageManager={storageManager}>
          <Suspense>
            <ErrorBoundary>
              <MDXProvider components={mdxComponents}>
                <Layout>
                  <Routes>
                    <FileRoutes />
                  </Routes>
                </Layout>
              </MDXProvider>
            </ErrorBoundary>
          </Suspense>
        </HopeProvider>

        <script src="https://cdn.jsdelivr.net/npm/@docsearch/js@3"></script>
        <script>
          {`docsearch({
            appId: "ZRC9HOY415",
            apiKey: "d1d23c988118ecb0c08000a8ace9a806",
            indexName: "next-hope-ui",
            container: "#docsearch",
            debug: false
          });`}
        </script>
        <Scripts />
      </Body>
    </Html>
  );
}
