import "./index.css";

import { hope, HopeProvider, NotificationsProvider, SwitchPrimitive, SwitchPrimitiveThumb } from "@hope-ui/solid";
import { render } from "solid-js/web";

const StyledSwitch = hope(SwitchPrimitive, {
  baseStyle: {
    all: "unset",
    width: 42,
    height: 25,
    backgroundColor: "$blackAlpha9",
    borderRadius: "9999px",
    position: "relative",
    boxShadow: "0 2px 10px $colors$blackAlpha7",
    WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",

    "&[data-focus]": {
      boxShadow: `0 0 0 2px black`,
    },

    "&[data-checked]": {
      backgroundColor: "black",
    },
  },
});

const StyledThumb = hope(SwitchPrimitiveThumb, {
  baseStyle: {
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
  },
});

function App() {
  return (
    <div>
      <StyledSwitch>
        <StyledThumb />
      </StyledSwitch>
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
