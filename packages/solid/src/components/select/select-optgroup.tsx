import { createContext, createSignal, splitProps, useContext } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { selectOptGroupStyles } from "./select.styles";

export interface SelectOptGroupContextValue {
  setAriaLabelledBy: (id: string) => void;
}

const SelectOptGroupContext = createContext<SelectOptGroupContextValue>();

export type SelectOptGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeSelectOptGroupClass = "hope-select__optgroup";

/**
 * Component used to group multiple options.
 */
export function SelectOptGroup<C extends ElementType = "div">(props: SelectOptGroupProps<C>) {
  const theme = useStyleConfig().Select;

  const [ariaLabelledBy, setAriaLabelledBy] = createSignal<string>();

  const [local, others] = splitProps(props, ["class", "children"]);

  const classes = () => classNames(local.class, hopeSelectOptGroupClass, selectOptGroupStyles());

  const context: SelectOptGroupContextValue = {
    setAriaLabelledBy,
  };

  return (
    <SelectOptGroupContext.Provider value={context}>
      <Box
        role="group"
        aria-labelledby={ariaLabelledBy()}
        class={classes()}
        __baseStyle={theme?.baseStyle?.optgroup}
        {...others}
      >
        {local.children}
      </Box>
    </SelectOptGroupContext.Provider>
  );
}

SelectOptGroup.toString = () => createClassSelector(hopeSelectOptGroupClass);

export function useSelectOptGroupContext() {
  return useContext(SelectOptGroupContext);
}
