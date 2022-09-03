// @refresh reload
import "./styles/index.css";
import "./styles/code.css";

import { DEFAULT_THEME, extendTheme, getCssText, HopeProvider } from "@hope-ui/core";
import { Suspense } from "solid-js";
import { MDXProvider } from "solid-mdx";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts } from "solid-start";

import { Layout } from "./components/layout";
import { mdxComponents } from "./mdx-components";

const theme = extendTheme({
  fonts: {
    sans: `Inter, ${DEFAULT_THEME.fonts.sans}`,
    display: `Lexend, ${DEFAULT_THEME.fonts.sans}`,
  },
  sizes: {
    "8xl": "88rem",
  },
});

export default function Root() {
  return (
    <HopeProvider withGlobalStyles theme={theme}>
      <Html lang="en">
        <Head>
          <Meta charset="utf-8" />
          <Meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* eslint-disable-next-line solid/no-innerhtml */}
          <style id="stitches" innerHTML={getCssText()} />
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
