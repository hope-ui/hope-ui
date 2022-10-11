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
    ["class", "children", "variant", "thickness", "labelProps"],
    ["orientation", "labelPlacement", "styleConfigOverride", "unstyled"]
  );

  const resolvedChildren = children(() => props.children);
  const withLabel = () => !!resolvedChildren();

  const isVertical = () => styleConfigProps.orientation === "vertical";

  const lineStyle: Accessor<SystemStyleObject> = createMemo(() => {
    const borderSideStyle = isVertical() ? "borderLeftStyle" : "borderTopStyle";
    const borderSideWidth = isVertical() ? "borderLeftWidth" : "borderTopWidth";

    if (withLabel()) {
      return {
        _before: {
          [borderSideStyle]: local.variant,
          [borderSideWidth]: local.thickness,
        },
        _after: {
          [borderSideStyle]: local.variant,
          [borderSideWidth]: local.thickness,
        },
      };
    }

    return {
      [borderSideStyle]: local.variant,
      [borderSideWidth]: local.thickness,
    };
  });

  const { baseClasses, styleOverrides } = useDividerStyleConfig("Divider", {
    get orientation() {
      return styleConfigProps.orientation;
    },
    get labelPlacement() {
      return styleConfigProps.labelPlacement;
    },
    get withLabel() {
      return withLabel();
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
      as={withLabel() ? "div" : "hr"}
      role={withLabel() ? "separator" : undefined}
      aria-orientation={isVertical() ? "vertical" : "horizontal"}
      class={clsx(baseClasses().root, local.class)}
      __css={{ ...styleOverrides().root, ...lineStyle() }}
      {...others}
    >
      <Show when={withLabel()}>
        <hope.span class={baseClasses().label} __css={styleOverrides().label} {...local.labelProps}>
          {resolvedChildren()}
        </hope.span>
      </Show>
    </hope.hr>
  );
});
