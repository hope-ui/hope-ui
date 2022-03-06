import { createUniqueId, onMount, splitProps } from "solid-js";

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
  const selectContext = useSelectContext();
  const selectOptGroupContext = useSelectOptGroupContext();

  const defaultId = `${selectContext.state.labelIdPrefix}-${createUniqueId()}`;

  const [local, others] = splitProps(props as SelectLabelProps<"div">, ["class", "id"]);

  const id = () => local.id ?? defaultId;

  const classes = () => classNames(local.class, hopeSelectLabelClass, selectLabelStyles());

  onMount(() => {
    selectOptGroupContext.setAriaLabelledBy(id());
  });

  return <Box id={id()} class={classes()} {...others} />;
}

SelectLabel.toString = () => createClassSelector(hopeSelectLabelClass);
