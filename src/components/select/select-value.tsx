import { mergeProps, Show, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectValueStyles } from "./select.styles";
import { getOptionLabel } from "./select.utils";

const hopeSelectValueClass = "hope-select__trigger__value";

export type SelectValueProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

/**
 * The part that reflects the selected value.
 * By default the selected option's value will be rendered (or the label if `labelKey` is provided on the select).
 * If you require more control, you can instead control the select and pass your own `children`.
 */
export function SelectValue<C extends ElementType = "span">(props: SelectValueProps<C>) {
  const selectContext = useSelectContext();

  const defaultProps: SelectValueProps<"span"> = {
    as: "span",
  };

  const propsWithDefault: SelectValueProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "children"]);

  const classes = () => classNames(local.class, hopeSelectValueClass, selectValueStyles());

  const showValue = () => selectContext.state.value != null;

  const selectedOptionLabel = () => {
    return getOptionLabel(selectContext.state.value, selectContext.state.labelKey);
  };

  return (
    <Show when={showValue()}>
      <Box class={classes()} {...others}>
        <Show when={local.children} fallback={selectedOptionLabel()}>
          {local.children}
        </Show>
      </Box>
    </Show>
  );
}

SelectValue.toString = () => createClassSelector(hopeSelectValueClass);
