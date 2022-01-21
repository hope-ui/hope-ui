import "./playground.css";

import { render } from "solid-js/web";

import { hope, HopeProvider } from ".";

const SmallButton = hope("button", {
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
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
