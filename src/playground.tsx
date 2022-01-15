import { render } from "solid-js/web";

import { HopeProvider } from ".";

function App() {
  return <HopeProvider></HopeProvider>;
}

render(() => <App />, document.getElementById("root") as HTMLElement);
