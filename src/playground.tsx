import "./playground.css";

import { render } from "solid-js/web";

import { HopeProvider } from ".";

export function App() {
  return <div>Hope UI</div>;
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
