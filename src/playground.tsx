import "./playground.css";

import { createEffect } from "solid-js";
import { render } from "solid-js/web";

import { Box, HopeProvider, useColorMode, useColorModeValue, useTheme, extendTheme } from ".";

const customTheme = extendTheme({
  initialColorMode: "dark",
  lightTheme: {
    colors: {
      primary9: "salmon",
    },
  },
  darkTheme: {
    colors: {
      primary9: "tomato",
    },
  },
});

export function App() {
  const theme = useTheme();
  const { colorMode, toggleColorMode } = useColorMode();
  const color = useColorModeValue("cyan", "magenta");

  createEffect(() => {
    console.dir(theme());
  });

  return (
    <div>
      <Box
        css={{
          transition: "background-color 300ms",
          fontWeight: "$black",
        }}
        w="$96"
        h={40}
        bgColor="yellow"
        color={color()}
        d="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{
          bgColor: "red",
        }}
        onClick={toggleColorMode}
      >
        This is the Box - {colorMode()} - {theme().toString()}
      </Box>
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
