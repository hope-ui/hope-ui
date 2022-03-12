import { createContext, Show, splitProps, useContext } from "solid-js";
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
import { AvatarExcess } from "./avatar-excess";

interface AvatarGroupOptions {
  /**
   * The space between the avatars in the group.
   */
  spacing?: ResponsiveValue<MarginProps["margin"]>;

  /**
   * The size of the avatars.
   */
  size?: AvatarVariants["size"];

  /**
   * The `border-radius` of the avatars
   */
  borderRadius?: ResponsiveValue<RadiiProps["borderRadius"]>;

  /**
   * The `border-color` of the avatars
   */
  borderColor?: ResponsiveValue<BorderProps["borderColor"]>;

  /**
   * The `border-width` of the avatars
   */
  borderWidth?: ResponsiveValue<BorderProps["borderWidth"]>;

  /**
   * The maximum number of visible avatars.
   */
  max?: number;
}

export type AvatarGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, AvatarGroupOptions>;

type AvatarGroupState = Required<Pick<AvatarGroupOptions, "spacing" | "size">> &
  Pick<AvatarGroupOptions, "max" | "borderRadius" | "borderColor" | "borderWidth"> & {
    /**
     * The number of avatar children in the group.
     */
    avatarCount: number;

    /**
     * The number of avatars in excess.
     */
    excess: number;
  };

interface AvatarGroupContextValue {
  state: AvatarGroupState;
  shouldShowAvatar: (index: number) => boolean;
  registerAvatar: () => number;
}

const AvatarGroupContext = createContext<AvatarGroupContextValue>();

const hopeAvatarGroupClass = "hope-avatar__group";

/**
 * AvatarGroup displays a number of avatars grouped together in a stack.
 */
export function AvatarGroup<C extends ElementType = "div">(props: AvatarGroupProps<C>) {
  const theme = useComponentStyleConfigs().Avatar;

  const [state, setState] = createStore<AvatarGroupState>({
    get spacing() {
      return props.spacing ?? "-1em";
    },
    get size() {
      return props.size ?? "md";
    },
    get borderRadius() {
      return props.borderRadius;
    },
    get borderColor() {
      return props.borderColor;
    },
    get borderWidth() {
      return props.borderWidth;
    },
    get max() {
      return props.max;
    },
    get excess() {
      return this.max != null ? this.avatarCount - this.max : 0;
    },
    avatarCount: 0,
  });

  const [local, others] = splitProps(props, [
    "class",
    "children",
    "max",
    "spacing",
    "borderRadius",
    "borderColor",
    "borderWidth",
  ]);

  const classes = () => classNames(local.class, hopeAvatarGroupClass, avatarGroupStyles());

  const shouldShowAvatar = (index: number) => {
    return state.max != null ? index < state.max : true;
  };

  const registerAvatar = () => {
    // eslint-disable-next-line
    // @ts-ignore
    setState("avatarCount", prev => prev + 1);

    // return the avatar index/position
    return state.avatarCount - 1;
  };

  const context: AvatarGroupContextValue = {
    // eslint-disable-next-line
    // @ts-ignore
    state,
    shouldShowAvatar,
    registerAvatar,
  };

  return (
    <AvatarGroupContext.Provider value={context}>
      <Box role="group" class={classes()} __baseStyle={theme?.baseStyle?.group} {...others}>
        {local.children}
        <Show when={state.excess > 0}>
          <AvatarExcess>+{state.excess}</AvatarExcess>
        </Show>
      </Box>
    </AvatarGroupContext.Provider>
  );
}

AvatarGroup.toString = () => createClassSelector(hopeAvatarGroupClass);

export function useAvatarGroupContext() {
  return useContext(AvatarGroupContext);
}
