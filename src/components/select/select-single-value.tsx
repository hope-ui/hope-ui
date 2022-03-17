import { Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectSingleValueStyles } from "./select.styles";

export type SelectSingleValueProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeSelectSingleValueClass = "hope-select__single-value";

/**
 * The part that reflects the selected value (single-select).
 */
export function SelectSingleValue<C extends ElementType = "span">(props: SelectSingleValueProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props as SelectSingleValueProps<"span">, ["class"]);

  const classes = () => classNames(local.class, hopeSelectSingleValueClass, selectSingleValueStyles());

  return (
    <Show when={selectContext.state.hasSelectedOptions}>
      <hope.span class={classes()} __baseStyle={theme?.baseStyle?.singleValue} {...others}>
        {selectContext.state.selectedOptions[0].textValue}
      </hope.span>
    </Show>
  );
}

SelectSingleValue.toString = () => createClassSelector(hopeSelectSingleValueClass);
