import "./playground.css";

import { render } from "solid-js/web";

import { FormControl, FormHelperText, FormLabel, HopeProvider, Input } from ".";

export function App() {
  return (
    <div>
      <FormControl>
        <FormLabel>Email address</FormLabel>
        <Input type="email" />
        <FormHelperText>We'll never share your email.</FormHelperText>
      </FormControl>
    </div>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
