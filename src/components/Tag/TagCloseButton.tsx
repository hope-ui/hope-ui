import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType, PolymorphicComponentProps } from "@/components";
import { useTagContext } from "@/components/Tag/TagContext";
import { IconCross } from "@/icons";

export type TagCloseButtonOptions = {
  "aria-label": string;
};

export type TagCloseButtonProps<C extends ElementType> = PolymorphicComponentProps<
  C,
  TagCloseButtonOptions
>;

export function TagCloseButton<C extends ElementType = "button">(props: TagCloseButtonProps<C>) {
  const tagContext = useTagContext();

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
    "h-tag-close-btn": true,
    [`h-tag-close-btn--variant-${tagContext.variant}`]: true,
    [`h-tag-close-btn--size-${tagContext.size}`]: true,
    [`h-tag-close-btn--radius-${tagContext.radius}`]: true,
    [`h-tag-close-btn--color-${tagContext.color}`]: true,
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  return (
    <Dynamic component={local.as} classList={rootClassList()} {...others}>
      <IconCross className="h-tag-close-btn--icon" />
    </Dynamic>
  );
}
