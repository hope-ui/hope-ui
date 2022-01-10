import { createSignal } from "solid-js";

import Button from "./lib/components/Button/Button";
import { UIColor } from "./lib/utils/types";

export default function App() {
  const [color, setColor] = createSignal<UIColor>("primary");

  const changeColor = () => setColor(c => (c === "primary" ? "danger" : "primary"));

  return (
    <div>
      <Button color={color()} onClick={changeColor}>
        Color is : {color()}
      </Button>
    </div>
  );
}
