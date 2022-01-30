import "./playground.css";

import { Show } from "solid-js";
import { render } from "solid-js/web";

import { Box, Button, extendTheme, HopeProvider, IconMoon, IconSun, Text } from ".";
import { useColorMode, useColorModeValue } from "./contexts/ColorModeContext";

const customTheme = extendTheme({
  initialColorMode: "system",
});

export function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const textColor = useColorModeValue("success600", "danger600");

  return (
    <div>
      <Button
        leftIcon={
          <Show when={colorMode() === "light"} fallback={<IconMoon />}>
            <IconSun />
          </Show>
        }
        onClick={toggleColorMode}
      >
        Current mode : {colorMode()}
      </Button>
      <Box bg="danger400" w="full" p={4} color="white">
        Always white
      </Box>
      <Box bg="danger400" w="full" p={4}>
        Color mode adapted
      </Box>
      <Box bg="danger400" w="full" p={4} color="white">
        <Text>Always white in Text</Text>
      </Box>
      <Box bg="danger400" w="full" p={4}>
        <Text>Color mode adapted in Text</Text>
      </Box>
      <Text color={textColor()}>using color mode value</Text>
    </div>
  );
}

render(
  () => (
    <HopeProvider theme={customTheme}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
