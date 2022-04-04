import "./playground.css";

import { render } from "solid-js/web";

import { Box, Button, HopeProvider, HopeThemeConfig, HStack, useColorMode } from ".";

export function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Box p="$4">
      <HStack spacing="$4" mb="$4">
        <Button variant="subtle" colorScheme="neutral" onClick={toggleColorMode}>
          Toggle color mode
        </Button>
      </HStack>
    </Box>
  );
}

const config: HopeThemeConfig = {};

render(
  () => (
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);

/**
<Notification status="info" gap="$2_5">
  <NotificationIcon />
  <VStack alignItems="flex-start">
    <NotificationTitle>Default notification</NotificationTitle>
    <NotificationDescription>This is default notification with title and body</NotificationDescription>
  </VStack>
  <CloseButton size="sm" position="absolute" top="$1" right="$1" />
</Notification>

showNotification({
  id: "custom-id",
  status: 'info',
  title: "You've been compromised",
  description: 'Leave the building immediately',
  closable: true,
  duration: 5000,
  position: "top-right",
  render: () => (<span>Custom JSX rendered</span>),
  onClose: () => console.log('unmounted'),
})
 */
