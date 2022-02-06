import { createCssSelector } from "@/utils/css";
import { JSX } from "solid-js";
import { hopeIconClass } from ".";

import { ElementType } from "../types";
import { Icon, IconProps } from "./icon";

interface CreateIconOptions {
  /**
   * The icon `svg` viewBox
   * @default "0 0 24 24"
   */
  viewBox?: string;

  // `path` needs to be a function that return JSX because in SolidJS JSX create real DOM element.
  // So if `path` is just a JSX.Element, the same generated DOM element will be moved to the next call of the component that use it.
  /**
   * A function that return the `svg` path or group element
   * @type () => JSX.Element | JSX.Element[]
   */
  path: () => JSX.Element | JSX.Element[];

  /**
   * Default props automatically passed to the component; overwriteable
   */
  defaultProps?: IconProps<"svg">;
}

export function createIcon(options: CreateIconOptions) {
  const { viewBox = "0 0 24 24", defaultProps = {} } = options;

  const IconComponent = <C extends ElementType = "svg">(props: IconProps<C>) => {
    return (
      <Icon viewBox={viewBox} {...defaultProps} {...props}>
        {options.path}
      </Icon>
    );
  };

  IconComponent.toString = () => createCssSelector(hopeIconClass);

  return IconComponent;
}
