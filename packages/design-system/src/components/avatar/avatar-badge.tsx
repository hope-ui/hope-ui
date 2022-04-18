import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { avatarBadgeStyles, AvatarBadgeVariants } from "./avatar.styles";

type AvatarBadgeOptions = AvatarBadgeVariants;

export type AvatarBadgeProps<C extends ElementType = "div"> = HTMLHopeProps<C, AvatarBadgeOptions>;

const hopeAvatarBadgeClass = "hope-avatar__badge";

/**
 * AvatarBadge used to show extra badge to the top-right
 * or bottom-right corner of an avatar.
 */
export function AvatarBadge<C extends ElementType = "div">(props: AvatarBadgeProps<C>) {
  const theme = useStyleConfig().Avatar;

  const [local, others] = splitProps(props, ["class", "placement"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeAvatarBadgeClass,
      avatarBadgeStyles({
        placement: local.placement ?? "bottom-end",
      })
    );
  };

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.badge} {...others} />;
}

AvatarBadge.toString = () => createClassSelector(hopeAvatarBadgeClass);
