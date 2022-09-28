import { clsx } from "clsx";
import { Box } from "../box";
import { DividerProps } from "./types";
import { children, Show, splitProps } from "solid-js";
import { useDividerStyleConfig } from "./divider.styles";
import { createHopeComponent, hope, mergeThemeProps, SystemStyleObject } from "@hope-ui/styles";

export const Divider = createHopeComponent<"hr", DividerProps>(props => {
  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class", "children", "thickness"],
    ["variant", "labelPlacement", "orientation", "styleConfigOverride", "unstyled"]
  );

  props = mergeThemeProps(
    "Divider",
    {
      variant: "solid",
      thickness: "1px",
      orientation: "horizontal",
    },
    props
  );

  const resolved = children(() => props.children);
  const isVertical = () => styleConfigProps.orientation === "vertical";
  const hasChildren = () => (resolved() ? true : false);
  const hasVerticalChildren = () => isVertical() && hasChildren();

  const lineWidth = {
    top: hasVerticalChildren() ? 0 : local.thickness,
    left: hasVerticalChildren() ? local.thickness : 0,
  };

  const borderSide = isVertical() ? "borderLeftStyle" : "borderTopStyle";

  const dividingLineStyle: SystemStyleObject = {
    [borderSide]: styleConfigProps.variant,
    borderWidth: hasChildren() ? 0 : local.thickness,
    _after: {
      [borderSide]: styleConfigProps.variant,
      borderWidth: `${lineWidth.top} 0 0 ${lineWidth.left}`,
    },
    _before: {
      [borderSide]: styleConfigProps.variant,
      borderWidth: `${lineWidth.top} 0 0 ${lineWidth.left}`,
    },
  };

  const { baseClasses, styleOverrides } = useDividerStyleConfig("Divider", {
    get hasChildren() {
      return hasChildren();
    },
    get orientation() {
      return styleConfigProps.orientation;
    },
    get variant() {
      return styleConfigProps.variant;
    },
    get labelPlacement() {
      return styleConfigProps.labelPlacement;
    },
    get styleConfigOverride() {
      return styleConfigProps.styleConfigOverride;
    },
    get unstyled() {
      return styleConfigProps.unstyled;
    },
  });

  return (
    <Box
      as={hasChildren() ? "div" : "hr"}
      role={hasChildren() ? "separator" : undefined}
      aria-orientation={isVertical() ? "vertical" : "horizontal"}
      class={clsx(baseClasses().root, local.class)}
      __css={{ ...styleOverrides().root, ...dividingLineStyle }}
      {...others}
    >
      <Show fallback={null} when={hasChildren()}>
        <hope.span class={baseClasses().wrapper} __css={styleOverrides().wrapper}>
          {resolved()}
        </hope.span>
      </Show>
    </Box>
  );
});
