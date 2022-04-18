import { HopeProvider, NotificationsProvider } from "@hope-ui/design-system";
import {
  AriaSwitchProps,
  createSwitch,
  createToggleState,
  createVisuallyHidden,
} from "@hope-ui/primitives";
import { render } from "solid-js/web";

type SwitchProps = AriaSwitchProps;

function Switch(props: SwitchProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createSwitch(props, state, ref);
  const { visuallyHiddenProps } = createVisuallyHidden();

  return (
    <label style={{ display: "flex", "align-items": "center" }}>
      <div {...visuallyHiddenProps}>
        <input {...inputProps} ref={ref} />
      </div>
      <svg width={40} height={24} aria-hidden="true" style={{ "margin-right": 4 }}>
        <rect
          x={4}
          y={4}
          width={32}
          height={16}
          rx={8}
          fill={state.isSelected() ? "orange" : "gray"}
        />
        <circle cx={state.isSelected() ? 28 : 12} cy={12} r={5} fill="white" />
      </svg>
      {props.children}
    </label>
  );
}

function App() {
  return (
    <div>
      Hello world <Switch>Test</Switch>
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
