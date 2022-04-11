import { createContext, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { inputGroupStyles, InputVariants } from "./input.styles";

export type ThemeableInputGroupOptions = Pick<InputVariants, "variant" | "size">;

export type InputGroupState = Required<ThemeableInputGroupOptions> & {
  hasLeftElement: boolean;
  hasRightElement: boolean;
  hasLeftAddon: boolean;
  hasRightAddon: boolean;
};

export interface InputGroupContextValue {
  state: InputGroupState;
  setHasLeftElement: (value: boolean) => void;
  setHasRightElement: (value: boolean) => void;
  setHasLeftAddon: (value: boolean) => void;
  setHasRightAddon: (value: boolean) => void;
}

export type InputGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, ThemeableInputGroupOptions>;

const InputGroupContext = createContext<InputGroupContextValue>();

export function useInputGroupContext() {
  return useContext(InputGroupContext);
}

const hopeInputGroupClass = "hope-input-group";

export function InputGroup<C extends ElementType = "div">(props: InputGroupProps<C>) {
  const theme = useStyleConfig().Input;

  const [state, setState] = createStore<InputGroupState>({
    get variant() {
      return props.variant ?? theme?.defaultProps?.group?.variant ?? "outline";
    },
    get size() {
      return props.size ?? theme?.defaultProps?.group?.size ?? "md";
    },
    hasLeftElement: false,
    hasRightElement: false,
    hasLeftAddon: false,
    hasRightAddon: false,
  });

  const [local, others] = splitProps(props, ["variant", "size", "class"]);

  const classes = () => classNames(local.class, hopeInputGroupClass, inputGroupStyles());

  const setHasLeftElement = (value: boolean) => setState("hasLeftElement", value);
  const setHasRightElement = (value: boolean) => setState("hasRightElement", value);
  const setHasLeftAddon = (value: boolean) => setState("hasLeftAddon", value);
  const setHasRightAddon = (value: boolean) => setState("hasRightAddon", value);

  const context: InputGroupContextValue = {
    state,
    setHasLeftElement,
    setHasRightElement,
    setHasLeftAddon,
    setHasRightAddon,
  };

  return (
    <InputGroupContext.Provider value={context}>
      <Box class={classes()} __baseStyle={theme?.baseStyle?.group} {...others} />
    </InputGroupContext.Provider>
  );
}

InputGroup.toString = () => createClassSelector(hopeInputGroupClass);
