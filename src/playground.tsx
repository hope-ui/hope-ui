import "./playground.css";

import { render } from "solid-js/web";

import { Box, HopeProvider } from ".";

export function App() {
  return (
    <div>
      <Box
        css={{
          transition: "background-color 300ms",
          fontWeight: "$black",
        }}
        w="$96"
        h={40}
        bgColor="tomato"
        color="white"
        d="flex"
        alignItems="center"
        justifyContent="center"
        _hover={{
          bgColor: "red",
        }}
      >
        This is the Box.
      </Box>
    </div>
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
