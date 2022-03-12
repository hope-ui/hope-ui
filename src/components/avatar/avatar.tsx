import { JSX, mergeProps, splitProps } from "solid-js";

import { SystemStyleObject } from "@/styled-system";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ImageProps } from "../image";
import { ElementType, HTMLHopeProps } from "../types";
import { avatarStyles, AvatarVariants } from "./avatar.styles";
import { DefaultAvatarIcon, initials } from "./avatar.utils";
import { AvatarImage } from "./avatar-image";

export interface AvatarIconProps {
  /**
   * The role of the icon.
   */
  role: string;

  /**
   * A11y: A label that describes the icon
   */
  "aria-label": string;
}

interface ThemeableAvatarOptions extends AvatarVariants {
  /**
   * Defines loading strategy.
   */
  loading?: ImageProps["loading"];

  /**
   * If `true`, opt out of the avatar's `fallback` logic and
   * renders the `img` at all times.
   */
  ignoreFallback?: boolean;

  /**
   * The default avatar used as fallback when `name`, and `src` is not specified.
   */
  icon?: (props: AvatarIconProps) => JSX.Element;

  /**
   * `aria-label` to use with the default avatar icon when no `name` is provided.
   */
  iconLabel?: string;

  /**
   * Function to get the initials to display.
   */
  getInitials?: (name: string) => string;
}

export interface AvatarOptions extends ThemeableAvatarOptions {
  /**
   * The name of the person in the avatar.
   * - if `src` has loaded, the name will be used as the `alt` attribute of the `img`
   * - If `src` is not loaded, the name will be used to create the initials
   */
  name?: string;

  /**
   * The image url of the `Avatar`.
   */
  src?: string;

  /**
   * List of sources to use for different screen resolutions.
   */
  srcSet?: string;

  /**
   * Function called when image failed to load.
   */
  onError?: ImageProps["onError"];
}

export interface AvatarStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    group?: SystemStyleObject;
    image?: SystemStyleObject;
    initials?: SystemStyleObject;
    badge?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableAvatarOptions;
  };
}

export type AvatarProps<C extends ElementType = "span"> = HTMLHopeProps<C, AvatarOptions>;

const hopeAvatarClass = "hope-avatar";

/**
 * Avatar component that renders an user avatar with
 * support for fallback avatar and name-only avatars
 */
export function Avatar<C extends ElementType = "span">(props: AvatarProps<C>) {
  const theme = useComponentStyleConfigs().Avatar;

  const defaultProps: AvatarProps<"span"> = {
    size: theme?.defaultProps?.root?.size ?? "md",
    withBorder: theme?.defaultProps?.root?.withBorder ?? false,
    icon: theme?.defaultProps?.root?.icon ?? (props => <DefaultAvatarIcon {...props} />),
    iconLabel: theme?.defaultProps?.root?.iconLabel ?? "avatar",
    getInitials: theme?.defaultProps?.root?.getInitials ?? initials,
    ignoreFallback: theme?.defaultProps?.root?.ignoreFallback ?? false,
    loading: theme?.defaultProps?.root?.loading,
  };

  const propsWithDefault: AvatarProps<"span"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "children",
    "size",
    "withBorder",
    "src",
    "srcSet",
    "name",
    "borderRadius",
    "onError",
    "getInitials",
    "icon",
    "iconLabel",
    "loading",
    "borderColor",
    "ignoreFallback",
  ]);

  const classes = () => {
    return classNames(
      local.class,
      hopeAvatarClass,
      avatarStyles({
        size: local.size,
        withBorder: local.withBorder,
      })
    );
  };

  return (
    <hope.span class={classes()} __baseStyle={theme?.baseStyle?.root} borderRadius={local.borderRadius} {...others}>
      <AvatarImage
        src={local.src}
        srcSet={local.srcSet}
        loading={local.loading}
        getInitials={local.getInitials}
        name={local.name}
        icon={local.icon}
        iconLabel={local.iconLabel}
        ignoreFallback={local.ignoreFallback}
        borderRadius={local.borderRadius}
        // eslint-disable-next-line solid/reactivity
        onError={local.onError}
      />
      {local.children}
    </hope.span>
  );
}

Avatar.toString = () => createClassSelector(hopeAvatarClass);
