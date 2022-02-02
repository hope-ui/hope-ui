import "./playground.css";

import { render } from "solid-js/web";

import { Box } from ".";

export function App() {
  return (
    <div>
      <Box
        w="$96"
        h={40}
        bg="tomato"
        color="white"
        d="flex"
        alignItems="center"
        justifyContent="center"
      >
        This is the Box.
      </Box>
    </div>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
