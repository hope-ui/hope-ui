import "./playground.css";

import { render } from "solid-js/web";

import {
  Anchor,
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  FormLabel,
  HopeProvider,
  HStack,
  IconButton,
  Input,
  Switch,
  useColorMode,
  useColorModeValue,
  VStack,
} from ".";

export function App() {
  const { toggleColorMode } = useColorMode();
  return <Box p="$4"></Box>;
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
