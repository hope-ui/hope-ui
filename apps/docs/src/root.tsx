// @refresh reload
import "./root.css";

import { getCssText, HopeProvider } from "@hope-ui/core";
import { Suspense } from "solid-js";
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts } from "solid-start";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* eslint-disable-next-line solid/no-innerhtml */}
        <style id="stitches" innerHTML={getCssText()} />
      </Head>
      <Body>
        <HopeProvider withGlobalStyles>
          <Suspense>
            <ErrorBoundary>
              <Routes>
                <FileRoutes />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </HopeProvider>
        <Scripts />
      </Body>
    </Html>
  );
}
