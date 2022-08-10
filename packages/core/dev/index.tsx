import { render } from "solid-js/web";

import { Button, HopeProvider, useColorMode } from "../src";

function Foo() {
  const { toggleColorMode } = useColorMode();

  return <Button onClick={toggleColorMode}>Button</Button>;
}

function App() {
  return (
    <HopeProvider withGlobalStyles>
      <Foo />
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
