import { Accessor, createContext, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { inputGroupStyles, InputVariants } from "./input.styles";

export interface InputGroupState {
  size: InputVariants["size"];

  hasLeftElement: boolean;
  hasRightElement: boolean;
  hasLeftAddon: boolean;
  hasRightAddon: boolean;
}

export interface InputGroupContextValue {
  state: InputGroupState;
  setHasLeftElement: (value: boolean) => void;
  setHasRightElement: (value: boolean) => void;
  setHasLeftAddon: (value: boolean) => void;
  setHasRightAddon: (value: boolean) => void;
}

export type InputGroupProps<C extends ElementType> = HopeComponentProps<
  C,
  {
    size?: InputVariants["size"];
  }
>;

const InputGroupContext = createContext<InputGroupContextValue>();

const hopeInputGroupClass = "hope-input-group";

export function InputGroup<C extends ElementType = "div">(props: InputGroupProps<C>) {
  const [state, setState] = createStore<InputGroupState>({
    get size() {
      return props.size ?? "md"; // TODO use themeable option for that
    },
    hasLeftElement: false,
    hasRightElement: false,
    hasLeftAddon: false,
    hasRightAddon: false,
  });

  const [local, others] = splitProps(props, ["size", "class"]);

  const classes = () => classNames(local.class, hopeInputGroupClass, inputGroupStyles());

  const setHasLeftElement = (value: boolean) => setState("hasLeftElement", value);
  const setHasRightElement = (value: boolean) => setState("hasRightElement", value);
  const setHasLeftAddon = (value: boolean) => setState("hasLeftAddon", value);
  const setHasRightAddon = (value: boolean) => setState("hasRightAddon", value);

  const context: Accessor<InputGroupContextValue> = () => ({
    state,
    setHasLeftElement,
    setHasRightElement,
    setHasLeftAddon,
    setHasRightAddon,
  });

  return (
    <InputGroupContext.Provider value={context()}>
      <Box class={classes()} {...others} />
    </InputGroupContext.Provider>
  );
}

InputGroup.toString = () => createCssSelector(hopeInputGroupClass);

export function useInputGroupContext() {
  return useContext(InputGroupContext);
}
