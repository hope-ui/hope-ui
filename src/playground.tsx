import "./playground.css";

import { render } from "solid-js/web";

import {
  Box,
  createIcon,
  extendTheme,
  HopeProvider,
  Icon,
  IconCheckCircle,
  useColorMode,
  useTheme,
} from ".";

export const IconCheckCircle2 = createIcon({
  viewBox: "0 0 20 20",
  path: (
    <g fill="none">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10 18a8 8 0 1 0 0-16a8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586L7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
        fill="currentColor"
      />
    </g>
  ),
});

export function App() {
  return (
    <Box>
      <Icon boxSize={64} />
      <IconCheckCircle2 boxSize={64} color="crimson" />
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
