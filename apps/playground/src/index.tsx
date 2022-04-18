import "./index.css";

import {
  AriaSwitchProps,
  combineProps,
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

  return (
    <label
      class={`${state.isSelected() ? "bg-cyan-500" : "bg-slate-300"}
    relative inline-flex flex-shrink-0 h-[38px] w-[74px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200`}
    >
      <div {...visuallyHiddenProps()}>
        <input {...inputProps()} ref={ref} />
      </div>
      <span
        aria-hidden="true"
        class={`${state.isSelected() ? "translate-x-9" : "translate-x-0"}
        pointer-events-none inline-block h-[34px] w-[34px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
      />
    </label>
  );
}

function App() {
  const onFocus = () => console.log("focused");
  const onBlur = () => console.log("blurred");

  return (
    <div class="p-4">
      <Switch onFocus={onFocus} onBlur={onBlur} />
    </div>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
