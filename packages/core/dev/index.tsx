import { render } from "solid-js/web";

import { hope, HopeProvider } from "../src";

interface CardProps {
  variant: "outlined" | "soft";
}

const Card = hope<"div", CardProps>("div", {
  excludedProps: ["variant"],
  baseStyle: ({ theme, props }) => ({
    d: "flex",
    border: props.variant === "outlined" ? `1px solid ${theme.colors.slate[700]}` : "none",
    bg: "gray.300",
    shadow: "md",
    p: 4,
  }),
});

function App() {
  return (
    <HopeProvider>
      <Card variant="outlined" mb={4}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque, quia?
      </Card>
      <Card variant="soft">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloremque, quia?
      </Card>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
