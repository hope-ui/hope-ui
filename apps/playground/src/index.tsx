import "./index.css";

import {
  Checkbox,
  CheckboxControl,
  CheckboxPrimitive,
  CheckboxPrimitiveIndicator,
  createIcon,
  HopeProvider,
  NotificationsProvider,
} from "@hope-ui/solid";
import { render } from "solid-js/web";

const CheckIcon = createIcon({
  viewBox: "0 0 15 15",
  path: () => (
    <path
      d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  ),
});

function App() {
  return (
    <div>
      <CheckboxPrimitive class="cursor-pointer flex justify-center items-center bg-white w-6 h-6 rounded shadow-md hover:bg-violet-100 focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-black">
        <CheckboxPrimitiveIndicator class="flex justify-center items-center text-violet-700">
          <CheckIcon />
        </CheckboxPrimitiveIndicator>
      </CheckboxPrimitive>
      <Checkbox>
        <CheckboxControl />
      </Checkbox>
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
