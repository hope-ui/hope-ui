import "./playground.css";

import { render } from "solid-js/web";

import { Box, HopeProvider, NotificationsProvider } from ".";

export function App() {
  return <Box p="$4"></Box>;
}

render(
  () => (
    <HopeProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
