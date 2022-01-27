import "./playground.css";

import { render } from "solid-js/web";

import { HopeProvider, Text } from ".";

export function App() {
  return (
    <HopeProvider>
      <Text color="info500">Hope UI</Text>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
