// @refresh reload

import {
  ColorModeScript,
  cookieStorageManagerSSR,
  HopeProvider,
  injectCriticalStyle,
} from "@hope-ui/core";
import { Suspense, useContext } from "solid-js";
import { isServer } from "solid-js/web";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  ServerContext,
} from "solid-start";

export default function Root() {
  const event = useContext(ServerContext);

  const storageManager = cookieStorageManagerSSR(
    isServer ? event.request.headers.get("cookie") ?? "" : document.cookie
  );

  injectCriticalStyle();

  return (
    <Html lang="en">
      <Head>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <ColorModeScript storageType={storageManager.type} />
        <HopeProvider storageManager={storageManager}>
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
