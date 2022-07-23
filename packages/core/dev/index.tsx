import "../scss/hope-ui.scss";

import { render } from "solid-js/web";

import { HopeApp, HopePortal } from "../src";

function App() {
  return (
    <HopeApp>
      <div>hi mom</div>
      <HopePortal>hi dad</HopePortal>
    </HopeApp>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
