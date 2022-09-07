// @refresh reload
import "./styles/index.css";
import "./styles/code.css";

import {
  DEFAULT_THEME,
  extendTheme,
  HopeCriticalStyle,
  HopeProvider,
  createGlobalStyles,
} from "@hope-ui/core";
import { Suspense } from "solid-js";
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
});

export default function Root() {
  return (
    <HopeProvider theme={theme}>
      <Html lang="en">
        <Head>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
          <Link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <Link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <Link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <Link rel="manifest" href="/site.webmanifest" />
          <HopeCriticalStyle />
        </Head>
        <Body>
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
          <Scripts />
        </Body>
      </Html>
    </HopeProvider>
  );
}
