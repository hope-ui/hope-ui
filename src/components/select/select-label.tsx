import { createUniqueId, onMount, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectLabelStyles } from "./select.styles";
import { useSelectOptGroupContext } from "./select-optgroup";

export type SelectLabelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeSelectLabelClass = "hope-select__label";

/**
 * Component used to render the label of a group.
 */
export function SelectLabel<C extends ElementType = "div">(props: SelectLabelProps<C>) {
  const defaultIdSuffix = createUniqueId();

  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();
  const selectOptGroupContext = useSelectOptGroupContext();

  const [local, others] = splitProps(props as SelectLabelProps<"div">, ["class", "id"]);

  const id = () => local.id ?? `${selectContext.state.labelIdPrefix}-${defaultIdSuffix}`;

  const classes = () => classNames(local.class, hopeSelectLabelClass, selectLabelStyles());

  onMount(() => {
    selectOptGroupContext?.setAriaLabelledBy(id());
  });

  return <Box id={id()} class={classes()} __baseStyle={theme?.baseStyle?.label} {...others} />;
}

SelectLabel.toString = () => createClassSelector(hopeSelectLabelClass);
