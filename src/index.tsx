import { render } from "solid-js/web";

import { globalStyles } from "./lib/stitches/globalStyles";
import App from "./App";

render(() => {
  globalStyles();
  return <App />;
}, document.getElementById("root") as HTMLElement);
