import { mergeProps, Show, splitProps } from "solid-js";

import { isString } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { iconStyles } from "./icon.styles";

const fallbackIcon = {
  viewBox: "0 0 24 24",
  path: () => (
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
};

export type IconProps<C extends ElementType = "svg"> = HTMLHopeProps<C>;

export const hopeIconClass = "hope-icon";

export function Icon<C extends ElementType = "svg">(props: IconProps<C>) {
  const defaultProps: IconProps<"svg"> = {
    viewBox: fallbackIcon.viewBox,
  };

  const propsWithDefault: IconProps<"svg"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["as", "class", "children", "viewBox"]);

  const classes = () => classNames(local.class, hopeIconClass, iconStyles());

  /**
   * If you're using an icon library.
   * Note: anyone passing the `as` prop, should manage the `viewBox` from the external component
   */
  const shouldRenderSvgComponent = () => local.as && !isString(local.as);

  return (
    <Show
      when={shouldRenderSvgComponent()}
      fallback={
        <hope.svg class={classes()} viewBox={local.viewBox} {...others}>
          <Show when={local.children} fallback={fallbackIcon.path}>
            {local.children}
          </Show>
        </hope.svg>
      }
    >
      <Box as={local.as} class={classes()} {...others} />
    </Show>
  );
}

Icon.toString = () => createClassSelector(hopeIconClass);
