import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import {
  Button,
  Heading,
  HopeProvider,
  IconButton,
  IconCheckCircle,
  IconChevronDown,
  Text,
} from ".";

export function App() {
  const [color, setColor] = createSignal("success");

  return (
    <HopeProvider>
      <Button loader={<IconCheckCircle style={{ color: "yellow" }} />} loading>
        Button
      </Button>

      <Button onClick={() => setColor("danger")}>Button</Button>
      <IconButton color={color() as any} aria-label="Chevron down" icon={<IconChevronDown />} />
      <Heading>Heading</Heading>
      <Text>Text</Text>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
