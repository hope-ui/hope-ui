import { render } from "solid-js/web";

import { HopeProvider } from "../src";

function App() {
  return <HopeProvider>Hello world!</HopeProvider>;
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
