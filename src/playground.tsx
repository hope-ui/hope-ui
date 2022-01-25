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
import { iconButtonStyles } from "./components/Button/Button.styles";

export function App() {
  return (
    <HopeProvider>
      <Button loader={<IconCheckCircle style={{ color: "yellow" }} />} loading>
        Button
      </Button>
      <Button loader={IconChevronDown} loading>
        Button
      </Button>
      <Button loading></Button>
      <Button className={iconButtonStyles()} leftIcon={IconChevronDown}></Button>
      <IconButton aria-label="Chevron down" icon={IconChevronDown} />
      <Heading>Heading</Heading>
      <Text>Text</Text>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
