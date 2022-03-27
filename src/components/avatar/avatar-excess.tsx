import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { avatarExcessStyles, AvatarExcessVariants } from "./avatar.styles";
import { useAvatarGroupContext } from "./avatar-group";

export type AvatarExcessProps<C extends ElementType = "span"> = HTMLHopeProps<C, AvatarExcessVariants>;

const hopeAvatarExcessClass = "hope-avatar__excess";

/**
 * Component to show the remaining number of avatars in a group.
 */
export function AvatarExcess<C extends ElementType = "span">(props: AvatarExcessProps<C>) {
  const theme = useComponentStyleConfigs().Avatar;

  const avatarGroupContext = useAvatarGroupContext();

  const [local, others] = splitProps(props, ["class", "size", "withBorder"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeAvatarExcessClass,
      avatarExcessStyles({
        size: local.size ?? avatarGroupContext?.state.size ?? theme?.defaultProps?.root?.size ?? "md",
        withBorder: local.withBorder ?? !!avatarGroupContext ?? theme?.defaultProps?.root?.withBorder ?? false,
      })
    );
  };

  return (
    <hope.span
      class={classes()}
      __baseStyle={theme?.baseStyle?.excess}
      borderRadius={avatarGroupContext?.state.avatarBorderRadius}
      borderColor={avatarGroupContext?.state.avatarBorderColor}
      borderWidth={avatarGroupContext?.state.avatarBorderWidth}
      marginStart={avatarGroupContext?.state.spacing}
      {...others}
    />
  );
}

AvatarExcess.toString = () => createClassSelector(hopeAvatarExcessClass);
