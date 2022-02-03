import "./playground.css";

import { createEffect } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  extendTheme,
  Grid,
  GridItem,
  HopeProvider,
  useColorMode,
  useColorModeValue,
  useTheme,
} from ".";

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

  const areas = ``;

  return (
    <div>
      <Box
        css={{
          transition: "background-color 300ms",
          fontWeight: "$black",
        }}
        w="$96"
        h="40"
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
      <Grid h="200px" templateAreas="'a b b c c''a d d d d'" gap="$4">
        <GridItem area="a" bg="tomato" />
        <GridItem area="b" bg="papayawhip" />
        <GridItem area="c" bg="papayawhip" />
        <GridItem area="d" bg="tomato" />
      </Grid>
      <Grid h="200px" templateRows="repeat(2, 1fr)" templateColumns="repeat(5, 1fr)" gap="$4">
        <GridItem rowSpan={2} bg="tomato" />
        <GridItem colSpan={2} bg="papayawhip" />
        <GridItem colSpan={2} bg="papayawhip" />
        <GridItem colSpan={4} bg="tomato" />
      </Grid>
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
