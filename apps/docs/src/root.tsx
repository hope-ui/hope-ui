// @refresh reload
import "./root.css";

import { ButtonTheme, extendTheme, getCssText, HopeProvider } from "@hope-ui/core";
import { Suspense } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts } from "solid-start";

const theme = extendTheme({
  cssVarPrefix: "chien",
  colors: {
    light: {
      primary: {
        outlinedBackground: "red",
        outlinedHoverBorder: "green",
      },
    },
  },
  components: {
    Button: {
      styles: (vars, params) => ({
        base: {
          root: {
            rounded: "full",
          },
        },
        variants: {
          variant: {
            outlined: {
              root: {
                background: vars.colors[params.colorScheme]["900"],
              },
            },
          },
        },
      }),
    } as ButtonTheme,
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
