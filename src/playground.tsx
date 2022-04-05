import "./playground.css";

import { render } from "solid-js/web";

import { Box, Button, HopeProvider, NotificationsProvider, showNotification } from ".";

export function App() {
  const notify = () => {
    showNotification({
      title: "Default notification",
      description: "This is default notification with title and body",
    });
  };

  return (
    <Box p="$4">
      <Button onClick={notify}>Notify</Button>
    </Box>
  );
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
