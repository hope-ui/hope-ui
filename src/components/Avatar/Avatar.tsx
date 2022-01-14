import { createSignal, Match, mergeProps, splitProps, Switch } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useHopeTheme } from "@/contexts";

import { AvatarType, ElementType } from "..";
import { AvatarProps } from ".";

export function Avatar<C extends ElementType = "span">(props: AvatarProps<C>) {
  const theme = useHopeTheme().components.Avatar;

  const defaultProps: AvatarProps<"span"> = {
    as: "span",
    variant: theme.variant,
    color: theme.color,
    size: theme.size,
    radius: theme.radius,
    icon: theme.icon,
    getInitials: theme.getInitials,
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "as",
    "class",
    "className",
    "classList",
    "variant",
    "color",
    "size",
    "radius",
    "icon",
    "getInitials",
    "src",
    "name",
    "children",
  ]);

  let defaultAvatarType: AvatarType;

  if (local.src) {
    defaultAvatarType = "image";
  } else if (local.name) {
    defaultAvatarType = "name";
  } else {
    defaultAvatarType = "icon";
  }

  const [avatarType, setAvatarType] = createSignal<AvatarType>(defaultAvatarType);

  const rootClassList = () => ({
    "h-avatar": true,
    "h-avatar--with-image": avatarType() === "image",
    [`h-avatar--variant-${local.variant}`]: true,
    [`h-avatar--size-${local.size}`]: true,
    [`h-avatar--radius-${local.radius}`]: true,
    [`h-avatar--color-${local.color}`]: true,
    [local.class || ""]: true,
    [local.className || ""]: true,
    ...local.classList,
  });

  const onFailLoadImageSource = () => {
    setAvatarType(local.name ? "name" : "icon");
  };

  return (
    <Dynamic component={local.as} classList={rootClassList()} {...others}>
      <Switch fallback={local.icon}>
        <Match when={avatarType() === "image"}>
          <img
            className="h-avatar--image"
            src={local.src}
            alt={local.name ?? "avatar"}
            onError={onFailLoadImageSource}
          />
        </Match>
        <Match when={avatarType() === "name"}>{local.getInitials?.(local.name ?? "")}</Match>
      </Switch>
    </Dynamic>
  );
}
