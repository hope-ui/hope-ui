import { clsx } from "clsx";
import { Box } from "../box";
import { useDividerStyleConfig } from "./divider.styles";
import { Show, splitProps } from "solid-js";
import { createHopeComponent, hope, SystemStyleObject } from "@hope-ui/styles";
import { DividerProps } from "./types";

export const Divider = createHopeComponent<"hr", DividerProps>(props => {
  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class", "children"],
    ["variant", "labelPlacement", "orientation", "thickness"]
  );

  const { orientation = "horizontal", thickness = "1px", variant = "solid" } = styleConfigProps;

  const isVertical = orientation === "vertical";
  const hasChildren = local.children ? true : false;
  const hasVerticalChildren = isVertical && hasChildren;

  const lineWidth = {
    top: hasVerticalChildren ? 0 : thickness,
    left: hasVerticalChildren ? thickness : 0,
  };

  const borderSide = isVertical ? "borderLeftStyle" : "borderTopStyle";

  const dividingLineStyle: SystemStyleObject = {
    [borderSide]: variant,
    borderWidth: hasChildren ? 0 : thickness,
    _after: {
      [borderSide]: variant,
      borderWidth: `${lineWidth.top} 0 0 ${lineWidth.left}`,
    },
    _before: {
      [borderSide]: variant,
      borderWidth: `${lineWidth.top} 0 0 ${lineWidth.left}`,
    },
  };

  const { baseClasses, styleOverrides } = useDividerStyleConfig("Divider", {
    hasChildren,
    ...styleConfigProps,
  });

  return (
    <Box
      as={hasChildren ? "div" : "hr"}
      role={hasChildren ? "separator" : undefined}
      class={clsx(baseClasses().root, local.class)}
      __css={{ ...styleOverrides().root, ...dividingLineStyle }}
      {...others}
    >
      <Show fallback={null} when={hasChildren}>
        <hope.span class={baseClasses().wrapper} __css={styleOverrides().wrapper}>
          {local.children}
        </hope.span>
      </Show>
    </Box>
  );
});
