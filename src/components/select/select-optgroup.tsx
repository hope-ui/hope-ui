import { createUniqueId, JSX, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectOptGroupStyles } from "./select.styles";
import { SelectLabel } from "./select-label";

interface SelectOptGroupOptions {
  /**
   * The label of the group.
   */
  label?: JSX.Element;
}

export type SelectOptGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, SelectOptGroupOptions>;

const hopeSelectOptGroupClass = "hope-select__optgroup";

/**
 * Component used to group multiple options.
 */
export function SelectOptGroup<C extends ElementType = "div">(props: SelectOptGroupProps<C>) {
  const labelIdSuffix = createUniqueId();

  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const [local, others] = splitProps(props, ["class", "children", "label"]);

  const classes = () => classNames(local.class, hopeSelectOptGroupClass, selectOptGroupStyles());

  const labelId = () => `${selectContext.state.labelIdPrefix}-${labelIdSuffix}`;

  return (
    <Box
      role="group"
      aria-labelledby={labelId()}
      class={classes()}
      __baseStyle={theme?.baseStyle?.optgroup}
      {...others}
    >
      <Show when={local.label}>
        <SelectLabel id={labelId()}>{local.label}</SelectLabel>
      </Show>
      {local.children}
    </Box>
  );
}

SelectOptGroup.toString = () => createClassSelector(hopeSelectOptGroupClass);
