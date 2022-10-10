import { createHopeComponent, hope, mergeThemeProps, SystemStyleObject } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Accessor, children, createMemo, Show, splitProps } from "solid-js";

import { useDividerStyleConfig } from "./divider.styles";
import { DividerProps } from "./types";

export const Divider = createHopeComponent<"hr", DividerProps>(props => {
  props = mergeThemeProps(
    "Divider",
    {
      variant: "solid",
      thickness: "1px",
    },
    props
  );

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class", "children", "variant", "thickness"],
    ["orientation", "labelPlacement", "styleConfigOverride", "unstyled"]
  );

  const resolvedChildren = children(() => props.children);
  const hasLabel = () => !!resolvedChildren();

  const isVertical = () => styleConfigProps.orientation === "vertical";
  const isVerticalWithLabel = () => isVertical() && hasLabel();

  const lineStyle: Accessor<SystemStyleObject> = createMemo(() => {
    const borderSide = isVertical() ? "borderLeftStyle" : "borderTopStyle";

    const topWidth = isVerticalWithLabel() ? 0 : local.thickness;
    const leftWidth = isVerticalWithLabel() ? local.thickness : 0;

    return {
      [borderSide]: local.variant,
      borderWidth: hasLabel() ? 0 : local.thickness,
      _after: {
        [borderSide]: local.variant,
        borderWidth: 0,
        borderTopWidth: topWidth,
        borderLeftWidth: leftWidth,
      },
      _before: {
        [borderSide]: local.variant,
        borderWidth: 0,
        borderTopWidth: topWidth,
        borderLeftWidth: leftWidth,
      },
    };
  });

  const { baseClasses, styleOverrides } = useDividerStyleConfig("Divider", {
    get orientation() {
      return styleConfigProps.orientation;
    },
    get labelPlacement() {
      return styleConfigProps.labelPlacement;
    },
    get hasLabel() {
      return hasLabel();
    },
    get styleConfigOverride() {
      return styleConfigProps.styleConfigOverride;
    },
    get unstyled() {
      return styleConfigProps.unstyled;
    },
  });

  return (
    <hope.hr
      as={hasLabel() ? "div" : "hr"}
      role={hasLabel() ? "separator" : undefined}
      aria-orientation={isVertical() ? "vertical" : "horizontal"}
      class={clsx(baseClasses().root, local.class)}
      __css={{ ...styleOverrides().root, ...lineStyle() }}
      {...others}
    >
      <Show when={hasLabel()}>
        <hope.span class={baseClasses().labelWrapper} __css={styleOverrides().labelWrapper}>
          {resolvedChildren()}
        </hope.span>
      </Show>
    </hope.hr>
  );
});
