import "./playground.scss";

import { render } from "solid-js/web";

import { Container } from "@/components";
import { HopeProvider } from "@/contexts";

function App() {
  return (
    <HopeProvider>
      <Container as="main" className="red-box">
        hello
      </Container>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
