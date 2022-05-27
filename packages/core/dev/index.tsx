import "./index.css";

import { HopeProvider } from "@hope-ui/theme";
import { render } from "solid-js/web";

function App() {
  return <div>Hello Hope UI</div>;
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
