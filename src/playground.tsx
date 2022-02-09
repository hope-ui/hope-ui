import "./playground.css";

import { createEffect, createSignal, onMount, Show } from "solid-js";
import { render } from "solid-js/web";

import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HopeProvider,
  HStack,
  Icon,
  IconExclamationCircle,
  Input,
} from ".";

export function App() {
  const [required, setRequired] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [invalid, setInvalid] = createSignal(false);
  const [readOnly, setReadOnly] = createSignal(false);
  const [showDiv, setShowDiv] = createSignal(false);

  const focusHandler = (e: FocusEvent) => {
    console.log("focused", e);
  };

  const blurHandler = (e: FocusEvent) => {
    console.log("blured", e);
  };

  let myDiv: any;
  let helperText: any;
  let errorMessage: any;

  const logRefs = () => {
    console.log("my-div", myDiv);

    // console.log("helper-text", helperText);
    // console.log("error-message", errorMessage);
  };

  return (
    <Box p="$4">
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
        <Button onClick={() => setShowDiv(prev => !prev)}>Show div : {showDiv().toString()}</Button>
        <Button onClick={logRefs}>Log refs</Button>
        <Button loading>Loading</Button>
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
        <FormHelperText ref={helperText}>We'll never share your email.</FormHelperText>
        <HStack ref={errorMessage} as={FormErrorMessage} color="$danger9" spacing="$1">
          <IconExclamationCircle />
          <span>An error occured</span>
        </HStack>
      </FormControl>
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
