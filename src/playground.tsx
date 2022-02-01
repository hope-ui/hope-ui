import "./playground.css";

import { render } from "solid-js/web";

import { Box, HopeProvider, HopeThemeContextConfig, useColorMode, useTheme } from ".";

/*
const customTheme: HopeThemeContextConfig = {
  initialColorMode: "light",
  lightTheme: {
    colors: {
      ...
    }
  },
  darkTheme: {
    colors: {
      ...
    }
  },
  components: {
    Button: {
      baseStyle: {
        ...
      },
      defaultProps: {
        ...
      }
    }
  }
})
*/

export function App() {
  const theme = useTheme();
  const { colorMode, toggleColorMode } = useColorMode();

  console.dir(theme);

  return (
    <Box as="button" onClick={toggleColorMode} bg="danger1">
      {colorMode()}
    </Box>
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
