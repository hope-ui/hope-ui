import "./playground.css";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import { Box, Button, Checkbox, HopeProvider, HStack } from ".";

export function App() {
  const [checked, setChecked] = createSignal(false);
  const [indeterminate, setIndeterminate] = createSignal(false);

  const changeHandler = (e: Event) => {
    setChecked((e.target as HTMLInputElement).checked);
  };

  return (
    <Box p="$4">
      <HStack spacing="$5">
        <Button onClick={() => setChecked(prev => !prev)}>checked : {checked().toString()}</Button>
        <Button onClick={() => setIndeterminate(prev => !prev)}>
          indeterminate : {indeterminate().toString()}
        </Button>
        <Checkbox checked={checked()} indeterminate={indeterminate()} onChange={changeHandler}>
          Controlled
        </Checkbox>
        <Checkbox indeterminate={indeterminate()}>Uncontrolled</Checkbox>
        <Checkbox
          invalid
          checked={checked()}
          indeterminate={indeterminate()}
          onChange={changeHandler}
        >
          Controlled
        </Checkbox>
        <Checkbox invalid indeterminate={indeterminate()}>
          Uncontrolled
        </Checkbox>
      </HStack>
    </Box>
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
