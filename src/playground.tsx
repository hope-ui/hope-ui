import "./playground.css";

import { render } from "solid-js/web";

import { hope, HopeProvider } from ".";

const Card = hope("div", {
  borderRadius: "$lg",
  bg: "white",

  variants: {
    color: {
      primary: {
        color: "$primary600",
      },
      danger: {
        color: "$danger600",
      },
    },
  },
});

export function App() {
  return (
    <HopeProvider>
      <Card
        boxSize={40}
        color="primary"
        bg="salmon"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        Content
      </Card>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
