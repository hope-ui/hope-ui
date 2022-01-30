import "./playground.css";

import { render } from "solid-js/web";

import { HopeProvider } from ".";

export function App() {
  return <HopeProvider>Hope UI</HopeProvider>;
}

render(() => <App />, document.getElementById("root") as HTMLElement);
