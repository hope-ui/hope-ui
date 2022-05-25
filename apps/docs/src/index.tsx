import "./index.css";

import Prism from "prismjs";
import { Router } from "solid-app-router";
import { render } from "solid-js/web";

import App from "./App";

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);

setTimeout(() => Prism.highlightAll(), 0);
