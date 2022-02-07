import "./playground.css";

import { createEffect, createSignal, onMount, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HopeProvider,
  HStack,
  IconExclamationCircle,
  Input,
} from ".";

export function App() {
  const [required, setRequired] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [invalid, setInvalid] = createSignal(false);
  const [readOnly, setReadOnly] = createSignal(false);

  const focusHandler = (e: FocusEvent) => {
    console.log("focused", e);
  };

  const blurHandler = (e: FocusEvent) => {
    console.log("blured", e);
  };

  let helperText: any;
  let errorMessage: any;

  const logRefs = () => {
    console.log("helper-text", helperText);
    console.log("error-message", errorMessage);
  };

  return (
    <div>
      <HStack spacing="$4">
        <Button onClick={() => setRequired(prev => !prev)}>
          required : {required().toString()}
        </Button>
        <Button onClick={() => setDisabled(prev => !prev)}>
          disabled : {disabled().toString()}
        </Button>
        <Button onClick={() => setInvalid(prev => !prev)}>invalid : {invalid().toString()}</Button>
        <Button onClick={() => setReadOnly(prev => !prev)}>
          readOnly : {readOnly().toString()}
        </Button>
        <Button onClick={logRefs}>Log refs</Button>
      </HStack>
      <FormControl
        maxW="max-content"
        id="email"
        required={required()}
        invalid={invalid()}
        disabled={disabled()}
        readOnly={readOnly()}
      >
        <FormLabel
          for="email"
          _focus={{
            color: "tomato",
          }}
        >
          Email address
        </FormLabel>
        <Input type="email" placeholder="Placeholder" onFocus={focusHandler} onBlur={blurHandler} />
        <Show
          when={invalid()}
          fallback={<FormHelperText ref={helperText}>We'll never share your email.</FormHelperText>}
        >
          <HStack ref={errorMessage} as={FormErrorMessage} color="$danger9" spacing="$1">
            <IconExclamationCircle />
            <span>An error occured</span>
          </HStack>
        </Show>
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
