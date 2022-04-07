import { Property } from "csstype";
import { mergeProps, splitProps } from "solid-js";

import { SpaceScaleValue } from "../../styled-system";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { IconSpinner } from "../icons/IconSpinner";
import { ElementType, HTMLHopeProps } from "../types";
import { buttonIconSpinnerStyles, buttonLoaderStyles } from "./button.styles";

export type ButtonLoaderProps<C extends ElementType = "div"> = HTMLHopeProps<
  C,
  {
    withLoadingText?: boolean;
    spacing?: Property.Margin<SpaceScaleValue>;
    placement?: "start" | "end";
  }
>;

const hopeButtonLoaderClass = "hope-button__loader";

export function ButtonLoader<C extends ElementType = "div">(props: ButtonLoaderProps<C>) {
  const defaultProps: ButtonLoaderProps<"div"> = {
    spacing: "0.5rem",
    children: <IconSpinner class={buttonIconSpinnerStyles()} />,
  };

  const propsWithDefault: ButtonLoaderProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "children",
    "withLoadingText",
    "placement",
    "spacing",
  ]);

  const marginProp = () => (local.placement === "start" ? "marginEnd" : "marginStart");

  const loaderStyles = () => ({
    [marginProp()]: local.withLoadingText ? local.spacing : 0,
  });

  const classes = () => {
    return classNames(
      local.class,
      hopeButtonLoaderClass,
      buttonLoaderStyles({ withLoadingText: local.withLoadingText })
    );
  };

  return (
    <hope.div class={classes()} {...loaderStyles} {...others}>
      {local.children}
    </hope.div>
  );
}

ButtonLoader.toString = () => createClassSelector(hopeButtonLoaderClass);
