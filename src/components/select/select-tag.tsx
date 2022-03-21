import { mergeProps, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useSelectContext } from "./select";
import { selectTagStyles, SelectTagVariants } from "./select.styles";

export type SelectTagProps<C extends ElementType = "span"> = HTMLHopeProps<C, SelectTagVariants>;

const hopeSelectTagClass = "hope-select__tag";

/**
 * Tag representing a selected value in a multi-select.
 */
export function SelectTag<C extends ElementType = "span">(props: SelectTagProps<C>) {
  const theme = useComponentStyleConfigs().Select;

  const selectContext = useSelectContext();

  const defaultProps: SelectTagProps<"span"> = {
    size: selectContext.state.size ?? "md",
    variant: selectContext.state.variant === "filled" ? "outline" : "subtle" ?? "subtle",
  };

  const propsWithDefault: SelectTagProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "size", "variant"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeSelectTagClass,
      selectTagStyles({
        size: local.size,
        variant: local.variant,
      })
    );
  };

  return <hope.span class={classes()} __baseStyle={theme?.baseStyle?.tag} {...others} />;
}

SelectTag.toString = () => createClassSelector(hopeSelectTagClass);
