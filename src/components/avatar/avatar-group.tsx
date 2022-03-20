import { createContext, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { BorderProps } from "@/styled-system/props/border";
import { MarginProps } from "@/styled-system/props/margin";
import { RadiiProps } from "@/styled-system/props/radii";
import { ResponsiveValue } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { avatarGroupStyles, AvatarVariants } from "./avatar.styles";

export interface ThemeableAvatarGroupOptions {
  /**
   * The size of the avatars.
   */
  size?: AvatarVariants["size"];

  /**
   * The space between the avatars in the group.
   */
  spacing?: ResponsiveValue<MarginProps["margin"]>;

  /**
   * The `border-radius` of the avatars
   */
  avatarBorderRadius?: ResponsiveValue<RadiiProps["borderRadius"]>;

  /**
   * The `border-color` of the avatars
   */
  avatarBorderColor?: ResponsiveValue<BorderProps["borderColor"]>;

  /**
   * The `border-width` of the avatars
   */
  avatarBorderWidth?: ResponsiveValue<BorderProps["borderWidth"]>;
}

type AvatarGroupOptions = ThemeableAvatarGroupOptions;

export type AvatarGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, AvatarGroupOptions>;

type AvatarGroupState = Required<Pick<AvatarGroupOptions, "spacing" | "size">> &
  Pick<AvatarGroupOptions, "avatarBorderRadius" | "avatarBorderColor" | "avatarBorderWidth">;

interface AvatarGroupContextValue {
  state: AvatarGroupState;
}

const AvatarGroupContext = createContext<AvatarGroupContextValue>();

const hopeAvatarGroupClass = "hope-avatar__group";

/**
 * AvatarGroup displays a number of avatars grouped together in a stack.
 */
export function AvatarGroup<C extends ElementType = "div">(props: AvatarGroupProps<C>) {
  const theme = useComponentStyleConfigs().Avatar;

  const [state] = createStore<AvatarGroupState>({
    get size() {
      return props.size ?? theme?.defaultProps?.group?.size ?? "md";
    },
    get spacing() {
      return props.spacing ?? theme?.defaultProps?.group?.spacing ?? "-1em";
    },
    get avatarBorderRadius() {
      return props.avatarBorderRadius ?? theme?.defaultProps?.group?.avatarBorderRadius;
    },
    get avatarBorderColor() {
      return props.avatarBorderColor ?? theme?.defaultProps?.group?.avatarBorderColor;
    },
    get avatarBorderWidth() {
      return props.avatarBorderWidth ?? theme?.defaultProps?.group?.avatarBorderWidth;
    },
  });

  const [local, others] = splitProps(props, [
    "class",
    "size",
    "spacing",
    "avatarBorderRadius",
    "avatarBorderColor",
    "avatarBorderWidth",
  ]);

  const classes = () => classNames(local.class, hopeAvatarGroupClass, avatarGroupStyles());

  const context: AvatarGroupContextValue = {
    state: state as AvatarGroupState,
  };

  return (
    <AvatarGroupContext.Provider value={context}>
      <Box role="group" class={classes()} __baseStyle={theme?.baseStyle?.group} {...others} />
    </AvatarGroupContext.Provider>
  );
}

AvatarGroup.toString = () => createClassSelector(hopeAvatarGroupClass);

export function useAvatarGroupContext() {
  return useContext(AvatarGroupContext);
}
