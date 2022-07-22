import "../scss/index.scss";

import { render } from "solid-js/web";

function App() {
  return <div class="hope-app"></div>;
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
