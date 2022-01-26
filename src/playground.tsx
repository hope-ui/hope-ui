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

export function App() {
  return (
    <HopeProvider>
      <Button loader={<IconCheckCircle style={{ color: "yellow" }} />} loading>
        Button
      </Button>
      <Button loader={IconCheckCircle} loading>
        Button
      </Button>
      <Button loading>Button</Button>
      <IconButton aria-label="Chevron down" icon={<IconChevronDown />} />
      <Heading>Heading</Heading>
      <Text>Text</Text>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
