import { render } from "solid-js/web";

import { HopeProvider } from "../src";

function App() {
  return <HopeProvider withGlobalStyles></HopeProvider>;
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
