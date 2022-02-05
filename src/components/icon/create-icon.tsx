import { JSX } from "solid-js";

import { Icon, IconProps } from "./icon";

interface CreateIconOptions {
  /**
   * The icon `svg` viewBox
   * @default "0 0 24 24"
   */
  viewBox?: string;

  /**
   * The `svg` path or group element
   * @type JSX.Element | JSX.Element[]
   */
  path: JSX.Element | JSX.Element[];

  /**
   * Default props automatically passed to the component; overwriteable
   */
  defaultProps?: IconProps<"svg">;
}

export function createIcon(options: CreateIconOptions) {
  const { viewBox = "0 0 24 24", defaultProps = {} } = options;

  const IconComponent = (props: IconProps<"svg">) => {
    return (
      <Icon viewBox={viewBox} {...defaultProps} {...props}>
        {options.path}
      </Icon>
    );
  };

  return IconComponent;
}
