// @refresh reload
import "./root.css";

import { getCssText, HopeProvider, HopeThemeOverride } from "@hope-ui/core";
import { Suspense } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts } from "solid-start";

const theme: HopeThemeOverride = {
  colors: {
    primary: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
  },
};

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
              <Routes>
                <FileRoutes />
              </Routes>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </Body>
      </Html>
    </HopeProvider>
  );
}
