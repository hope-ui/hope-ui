import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  Button,
  HopeProvider,
  HopeThemeConfig,
  HStack,
  NotificationManager,
  showNotification,
  useColorMode,
} from ".";
import { NotificationVariants } from "./components/notification/notification.styles";

function getRandomStatus() {
  const index = Math.floor(Math.random() * (4 - 0) + 0);
  return ["success", "info", "warning", "danger"][index] as NotificationVariants["status"];
}

export function App() {
  const notify = () => {
    showNotification({
      status: getRandomStatus(),
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
      <NotificationManager placement="bottom-start">
        <App />
      </NotificationManager>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
