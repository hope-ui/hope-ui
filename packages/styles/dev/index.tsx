import { render } from "solid-js/web";

import { ThemeProvider } from "../src";

function App() {
  return <ThemeProvider></ThemeProvider>;
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
