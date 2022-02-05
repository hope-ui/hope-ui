import "./playground.css";

import { render } from "solid-js/web";

import { Box, HopeProvider, HStack, Icon, IconInfoCircle, IconMoon, Tag, TagLabel } from ".";

export function App() {
  return (
    <HStack spacing="$4" p="$4">
      <IconMoon />
      <IconMoon />
      <IconMoon />
      <Tag size="sm" colorScheme="primary">
        <IconInfoCircle />
        <TagLabel>Primary</TagLabel>
      </Tag>
      <Tag size="md" colorScheme="primary">
        <IconInfoCircle />
        <TagLabel>Primary</TagLabel>
      </Tag>
      <Tag size="lg" colorScheme="primary">
        <IconInfoCircle />
        <TagLabel>Primary</TagLabel>
      </Tag>
    </HStack>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
