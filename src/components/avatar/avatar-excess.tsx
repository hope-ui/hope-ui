import { mergeProps, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { avatarExcessStyles, AvatarExcessVariants } from "./avatar.styles";
import { useAvatarGroupContext } from "./avatar-group";

interface AvatarExcessOptions extends AvatarExcessVariants {
  /**
   * The number of avatar in excess.
   */
  count?: number | string;
}

export type AvatarExcessProps<C extends ElementType = "span"> = HTMLHopeProps<C, AvatarExcessOptions>;

const hopeAvatarExcessClass = "hope-avatar__excess";

/**
 * Component to show the excess number of avatars in a group.
 */
export function AvatarExcess<C extends ElementType = "span">(props: AvatarExcessProps<C>) {
  const theme = useComponentStyleConfigs().Avatar;

  const avatarGroupContext = useAvatarGroupContext();

  const defaultProps: AvatarExcessProps<"span"> = {
    size: avatarGroupContext?.state.size ?? theme?.defaultProps?.root?.size ?? "md",
    withBorder: !!avatarGroupContext ?? theme?.defaultProps?.root?.withBorder ?? false,

    borderRadius: avatarGroupContext?.state.borderRadius,
    borderColor: avatarGroupContext?.state.borderColor,
    borderWidth: avatarGroupContext?.state.borderWidth,
    marginStart: avatarGroupContext?.state.spacing,
  };

  const propsWithDefault: AvatarExcessProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "children", "count", "size", "withBorder"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeAvatarExcessClass,
      avatarExcessStyles({ size: local.size, withBorder: local.withBorder })
    );
  };

  return (
    <hope.span class={classes()} __baseStyle={theme?.baseStyle?.excess} {...others}>
      +{local.count}
    </hope.span>
  );
}

AvatarExcess.toString = () => createClassSelector(hopeAvatarExcessClass);
