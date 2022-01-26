import "./playground.css";

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
import { createSignal } from "solid-js";

export function App() {
  const [color, setColor] = createSignal("success");

  return (
    <HopeProvider>
      <Button loader={<IconCheckCircle style={{ color: "yellow" }} />} loading>
        Button
      </Button>
      <Button loader={IconCheckCircle} loading color={color() as any}>
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
