import "./index.css";

import { css, HopeProvider, NotificationsProvider, SwitchPrimitive, SwitchPrimitiveThumb } from "@hope-ui/solid";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";

const switchStyles = css({
  all: "unset",
  width: 42,
  height: 25,
  backgroundColor: "$blackAlpha9",
  borderRadius: "9999px",
  position: "relative",
  boxShadow: "0 2px 10px $colors$blackAlpha7",
  WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",

  "&:focus": {
    boxShadow: `0 0 0 2px black`,
  },

  "&[aria-checked]": {
    backgroundColor: "black",
  },
});

const thumbStyles = css({
  display: "block",
  width: 21,
  height: 21,
  backgroundColor: "white",
  borderRadius: "9999px",
  boxShadow: "0 2px 2px $colors$blackAlpha7",
  transition: "transform 100ms",
  transform: "translateX(2px)",
  willChange: "transform",

  "&[data-checked]": {
    transform: "translateX(19px)",
  },
});

function App() {
  const [isChecked, setIsChecked] = createSignal(false);

  return (
    <div>
      <button onClick={() => setIsChecked(prev => !prev)}>Toggle: {isChecked().toString()}</button>
      <SwitchPrimitive class={switchStyles()} checked={isChecked()} onChange={setIsChecked}>
        <SwitchPrimitiveThumb class={thumbStyles()} />
      </SwitchPrimitive>
    </div>
  );
}

render(
  () => (
    <HopeProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
