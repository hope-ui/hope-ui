import { children, createMemo, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ImageProps } from "../image";
import { createImage } from "../image/create-image";
import { AvatarProps } from "./avatar";
import { avatarImageStyles } from "./avatar.styles";
import { AvatarInitials } from "./avatar-initials";

export type AvatarImageProps = ImageProps &
  Pick<AvatarProps, "getInitials" | "name" | "icon" | "iconLabel" | "borderRadius">;

const hopeAvatarImageClass = "hope-avatar__image";

export function AvatarImage(props: AvatarImageProps) {
  const theme = useComponentStyleConfigs().Avatar;

  const [local, others] = splitProps(props, [
    "class",
    "src",
    "srcSet",
    "onError",
    "getInitials",
    "name",
    "loading",
    "iconLabel",
    "icon",
    "ignoreFallback",
  ]);

  const status = createMemo(() => {
    return createImage({
      src: local.src,
      onError: local.onError,
      ignoreFallback: local.ignoreFallback,
    });
  });

  const classes = () => classNames(local.class, hopeAvatarImageClass, avatarImageStyles());

  const hasLoaded = () => !!local.src && status()() === "loaded";

  const resolvedIcon = children(() => local.icon);

  const fallbackIcon = createMemo(() => {
    const iconElement = resolvedIcon() as Element;
    iconElement.setAttribute("role", "img");

    if (local.iconLabel) {
      iconElement.setAttribute("aria-label", local.iconLabel);
    }

    return iconElement;
  });

  return (
    <Show
      when={hasLoaded()}
      fallback={
        <Show when={local.name} fallback={fallbackIcon}>
          <AvatarInitials getInitials={local.getInitials} name={local.name} />
        </Show>
      }
    >
      <hope.img
        class={classes()}
        src={local.src}
        srcSet={local.srcSet}
        alt={local.name}
        loading={local.loading}
        __baseStyle={theme?.baseStyle?.image}
        {...others}
      />
    </Show>
  );
}

AvatarImage.toString = () => createClassSelector(hopeAvatarImageClass);
