import {
  ComponentTheme,
  createHopeComponent,
  hope,
  mergeThemeProps,
  STYLE_CONFIG_PROP_NAMES,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { JSX, splitProps } from "solid-js";

import { XMarkIcon } from "../icon/icon-set";
import { CloseButtonStyleConfigProps, useCloseButtonStyleConfig } from "./close-button.styles";

export interface CloseButtonProps extends CloseButtonStyleConfigProps {
  /** A label that describes the button. */
  "aria-label"?: string;

  /** The icon to be used in the button. */
  children?: JSX.Element;
}

export type CloseButtonTheme = ComponentTheme<CloseButtonProps, "size">;

/**
 * A button with a close icon, used to handle the close functionality in feedback and overlay components.
 */
export const CloseButton = createHopeComponent<"button", CloseButtonProps>(props => {
  props = mergeThemeProps(
    "CloseButton",
    {
      "aria-label": "Close",
      children: () => <XMarkIcon />,
    },
    props
  );

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class"],
    [...STYLE_CONFIG_PROP_NAMES, "size"]
  );

  const { baseClasses, styleOverrides } = useCloseButtonStyleConfig(
    "CloseButton",
    styleConfigProps
  );

  return (
    <hope.button
      type="button"
      class={clsx(baseClasses().root, local.class)}
      __css={styleOverrides().root}
      {...others}
    />
  );
});
