import "./index.css";

import {
  AriaSwitchProps,
  createFocusRing,
  createSwitch,
  createToggleState,
  createVisuallyHidden,
} from "@hope-ui/primitives";
import { render } from "solid-js/web";

function Switch(props: AriaSwitchProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createSwitch(props, state, ref);
  const { visuallyHiddenProps } = createVisuallyHidden();
  const { isFocusVisible, focusRingProps } = createFocusRing();

  return (
    <label
      class={`switch ${state.isSelected() ? "bg-cyan-500" : "bg-slate-300"} ${
        isFocusVisible() && "ring ring-red-500 ring-opacity-75"
      }`}
    >
      <div {...visuallyHiddenProps()}>
        <input {...inputProps()} {...focusRingProps()} ref={ref} />
      </div>
      <span
        aria-hidden="true"
        class={`switch__thumb ${state.isSelected() ? "translate-x-9" : "translate-x-0"}`}
      />
    </label>
  );
}

function App() {
  return (
    <div class="p-4">
      <Switch />
    </div>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
