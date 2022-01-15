import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { ElementType } from "@/components";
import { createStyles } from "@/stitches";
import { styledComponentOptionsKeys, StyledComponentProps } from "@/stitches/props";

export function Box<C extends ElementType = "div">(props: StyledComponentProps<C>) {
  const defaultProps: StyledComponentProps<"div"> = { as: "div", sx: {} };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, styleProps, others] = splitProps(
    propsWithDefault,
    ["as", "class", "className", "classList", "sx"],
    styledComponentOptionsKeys
  );

  const rootClassList = () => {
    const stitchesClass = createStyles(styleProps);
    const stitchesClassWithSxOverride = stitchesClass({ css: local.sx });

    return {
      [stitchesClassWithSxOverride]: true,
      [local.class || ""]: true,
      [local.className || ""]: true,
      ...local.classList,
    };
  };

  return <Dynamic component={local.as} classList={rootClassList()} {...others} />;
}
