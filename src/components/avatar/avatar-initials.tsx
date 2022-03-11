import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { HTMLHopeProps } from "../types";
import { AvatarOptions } from "./avatar";

type AvatarInitialsProps = HTMLHopeProps<"div", Pick<AvatarOptions, "getInitials" | "name">>;

const hopeAvatarInitialsClass = "hope-avatar__initials";

/**
 * The avatar initials container.
 */
export function AvatarInitials(props: AvatarInitialsProps) {
  const theme = useComponentStyleConfigs().Avatar;

  const [local, others] = splitProps(props, ["class", "getInitials", "name"]);

  const diplayInitials = () => (local.name ? local.getInitials?.(local.name) : null);

  const classes = () => classNames(local.class, hopeAvatarInitialsClass);

  return (
    <Box role="img" aria-label={local.name} class={classes()} __baseStyle={theme?.baseStyle?.initials} {...others}>
      {diplayInitials()}
    </Box>
  );
}

AvatarInitials.toString = () => createClassSelector(hopeAvatarInitialsClass);
