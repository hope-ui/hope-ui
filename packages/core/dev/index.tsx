import "../styles/index.scss";

import { render } from "solid-js/web";

import { Divider } from "../src";

function App() {
  return (
    <>
      <Divider />
      <Divider variant="dashed">Label</Divider>
    </>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
