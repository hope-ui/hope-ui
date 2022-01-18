import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { IconCross } from "@/icons";
import { ElementType, PolymorphicComponentProps } from "@/utils";

export type TagCloseButtonOptions = {
  "aria-label": string;
};

export type TagCloseButtonProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  TagCloseButtonOptions
>;

export function TagCloseButton<C extends ElementType = "button">(props: TagCloseButtonProps<C>) {
  const defaultProps: TagCloseButtonProps<"button"> = {
    as: "button",
    type: "button",
    role: "button",
    "aria-label": "",
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "as",
    "class",
    "className",
    "classList",
    "children",
  ]);

  const rootClassList = () => ({
    "h-tag__close-btn": true,
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  return (
    <Dynamic component={local.as} classList={rootClassList()} {...others}>
      <IconCross className="h-tag__close-btn__icon" />
    </Dynamic>
  );
}
