import "./playground.css";

import { render } from "solid-js/web";

import { Box, extendTheme, HopeProvider, useColorMode, useTheme } from ".";

const customTheme = extendTheme({
  lightTheme: {
    colors: {
      text: "$primary9",
    },
  },
  darkTheme: {
    colors: {
      text: "$success9",
    },
  },
});

export function App() {
  const { theme } = useTheme();
  const { toggleColorMode } = useColorMode();

  const changeTheme = () => {
    toggleColorMode();
    console.log(theme().colors.text);
  };

  return (
    <Box color="$text" onClick={changeTheme}>
      This is the Box
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
