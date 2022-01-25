import "./playground.css";

import { render } from "solid-js/web";

import { Heading, HopeProvider, Text } from ".";

export function App() {
  return (
    <HopeProvider>
      <Heading>Free and open source</Heading>
      <Text as="span" secondary color="neutral">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae reprehenderit, fuga
        eaque perspiciatis beatae ad? Minima debitis, ullam dolore porro repellendus numquam
        distinctio veritatis ex quae libero, reprehenderit quam nostrum?
      </Text>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
