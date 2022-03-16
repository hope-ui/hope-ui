import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { selectPlaceholderStyles } from "./select.styles";

const hopeSelectPlaceholderClass = "hope-select__placeholder";

export type SelectPlaceholderProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

export function SelectPlaceholder<C extends ElementType = "span">(props: SelectPlaceholderProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeSelectPlaceholderClass, selectPlaceholderStyles());

  return <hope.span class={classes()} __baseStyle={theme?.baseStyle?.placeholder} {...others} />;
}

SelectPlaceholder.toString = () => createClassSelector(hopeSelectPlaceholderClass);
