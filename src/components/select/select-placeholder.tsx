import { mergeProps, Show, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectPlaceholderStyles } from "./select.styles";

const hopeSelectPlaceholderClass = "hope-select__trigger__placeholder";

export type SelectPlaceholderProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

export function SelectPlaceholder<C extends ElementType = "span">(props: SelectPlaceholderProps<C>) {
  const selectContext = useSelectContext();

  const defaultProps: SelectPlaceholderProps<"span"> = {
    as: "span",
  };

  const propsWithDefault: SelectPlaceholderProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class"]);

  const classes = () => classNames(local.class, hopeSelectPlaceholderClass, selectPlaceholderStyles());

  const showPlaceholder = () => selectContext.state.value == null;

  return (
    <Show when={showPlaceholder()}>
      <Box class={classes()} {...others} />
    </Show>
  );
}

SelectPlaceholder.toString = () => createClassSelector(hopeSelectPlaceholderClass);
