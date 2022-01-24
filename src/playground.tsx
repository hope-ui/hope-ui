import "./playground.css";

import { render } from "solid-js/web";

import { HopeProvider } from ".";

export function App() {
  return <HopeProvider></HopeProvider>;
}

render(() => <App />, document.getElementById("root") as HTMLElement);
