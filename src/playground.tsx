import "./playground.css";

import { Show } from "solid-js";
import { render } from "solid-js/web";

import { Box, Button, extendTheme, HopeProvider, IconButton, IconMoon, IconSun, Text } from ".";
import { useColorMode, useColorModeValue } from "./contexts/ColorModeContext";
import { ColorToken } from "./theme/types";

const customTheme = extendTheme({
  initialColorMode: "system",
});

export function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const textColor = useColorModeValue<ColorToken, ColorToken>("success600", "danger600");
  const icon = useColorModeValue(<IconMoon />, <IconSun />);

  return (
    <div>
      <IconButton
        variant="ghost"
        colorScheme="neutral"
        aria-label="Toggle color mode"
        icon={icon}
        onClick={toggleColorMode}
      />
      <Text>Current mode : {colorMode()}</Text>
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
