import { children, createContext, createMemo, onCleanup, onMount, Show, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { BorderProps } from "@/styled-system/props/border";
import { MarginProps } from "@/styled-system/props/margin";
import { RadiiProps } from "@/styled-system/props/radii";
import { ResponsiveValue } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { avatarExcessStyles, avatarGroupStyles, AvatarVariants } from "./avatar.styles";

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
   * The maximum number of visible avatars.
   */
  max?: number;
}

export type AvatarGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, AvatarGroupOptions>;

type AvatarGroupState = Required<Pick<AvatarGroupOptions, "spacing" | "size">> &
  Pick<AvatarGroupOptions, "max" | "borderRadius" | "borderColor"> & {
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
const hopeAvatarExcessClass = "hope-avatar__excess";

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
    get max() {
      return props.max;
    },
    get excess() {
      return this.max != null ? this.avatarCount - this.max : 0;
    },
    avatarCount: 0,
  });

  const [local, others] = splitProps(props, ["class", "children", "max", "spacing", "borderColor", "borderRadius"]);

  const classes = () => classNames(local.class, hopeAvatarGroupClass, avatarGroupStyles());

  const excessClasses = () => {
    return classNames(hopeAvatarExcessClass, avatarExcessStyles({ size: state.size, withBorder: true }));
  };

  const shouldShowAvatar = (index: number) => {
    return state.max != null ? index <= state.max : true;
  };

  const registerAvatar = () => {
    // eslint-disable-next-line
    // @ts-ignore
    setState("avatarCount", prev => prev + 1);

    // return an index/position
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
          <hope.span
            class={excessClasses()}
            borderRadius={state.borderRadius}
            borderColor={state.borderColor}
            marginStart={state.spacing}
          >
            +{state.excess}
          </hope.span>
        </Show>
      </Box>
    </AvatarGroupContext.Provider>
  );
}

AvatarGroup.toString = () => createClassSelector(hopeAvatarGroupClass);

export function useAvatarGroupContext() {
  return useContext(AvatarGroupContext);
}
