import "./playground.css";

import { render } from "solid-js/web";

import { css, HopeProvider } from ".";

const chien = css({
  display: "inline-block",
  width: "$1_5",
  height: "$1_5",
  backgroundColor: "$danger300",
});

export function App() {
  return (
    <HopeProvider>
      <div class={chien()}>Box</div>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
