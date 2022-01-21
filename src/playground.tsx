import "./playground.css";

import { render } from "solid-js/web";

import { hope, HopeProvider } from ".";

const SmallButton = hope("a", {
  p: "$4",
  color: "$success600",

  variants: {
    kind: {
      primary: {
        backgroundColor: "blue",
      },
    },
  },
});

const LargeButton = hope(SmallButton, {
  //...
});

export function App() {
  return (
    <HopeProvider>
      <LargeButton>Large Button</LargeButton>
      <LargeButton kind="primary">Large Button</LargeButton>
      <hope.div></hope.div>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
