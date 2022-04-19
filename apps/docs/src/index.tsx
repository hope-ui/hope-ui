import "./index.css";

import { HopeProvider, HopeThemeConfig, NotificationsProvider } from "@hope-ui/solid";
import Prism from "prismjs";
import { Router } from "solid-app-router";
import { render } from "solid-js/web";

import App from "./App";

const config: HopeThemeConfig = {
  initialColorMode: "system",
  components: {
    Menu: {
      baseStyle: {
        content: {
          zIndex: 10,
        },
      },
    },
    Popover: {
      baseStyle: {
        content: {
          zIndex: 10,
        },
      },
    },
    Tooltip: {
      baseStyle: {
        zIndex: 10,
      },
    },
  },
};

render(
  () => (
    <Router>
      <HopeProvider config={config}>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </HopeProvider>
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);

setTimeout(() => {
  Prism.highlightAll();
}, 0);
