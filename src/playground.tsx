import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  ColorToken,
  DarkMode,
  extendTheme,
  HopeProvider,
  IconButton,
  IconMoon,
  IconSun,
  LightMode,
  Text,
  useColorMode,
  useColorModeValue,
} from ".";

const customTheme = extendTheme({
  initialColorMode: "system",
});

export function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const textColor = useColorModeValue<ColorToken>("success600", "danger600");
  const icon = useColorModeValue(<IconMoon />, <IconSun />);

  return (
    <Box p="4">
      <IconButton
        variant="ghost"
        colorScheme="neutral"
        aria-label="Toggle color mode"
        icon={icon}
        onClick={toggleColorMode}
      />
      <Text>Current mode : {colorMode()}</Text>
      <Box bg="danger400" w="full" p="4" color="white">
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
      <Box bg="primary500">
        <LightMode>
          <Text>Always light mode</Text>
        </LightMode>
        <DarkMode>
          <Text>Always dark mode</Text>
        </DarkMode>
      </Box>
    </Box>
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
