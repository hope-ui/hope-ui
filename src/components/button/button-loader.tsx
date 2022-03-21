import { Property } from "csstype";
import { mergeProps, splitProps } from "solid-js";

import { SpaceScaleValue } from "@/styled-system";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { createIcon } from "../icon/create-icon";
import { ElementType, HTMLHopeProps } from "../types";
import { buttonIconSpinnerStyles, buttonLoaderStyles } from "./button.styles";

const ButtonIconSpinner = createIcon({
  path: () => (
    <g fill="none">
      <path
        opacity=".2"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 19a7 7 0 1 0 0-14a7 7 0 0 0 0 14zm0 3c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10z"
        fill="currentColor"
      />
      <path d="M2 12C2 6.477 6.477 2 12 2v3a7 7 0 0 0-7 7H2z" fill="currentColor" />
    </g>
  ),
});

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
    children: <ButtonIconSpinner class={buttonIconSpinnerStyles()} />,
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
