import { JSX } from "solid-js";

import { createComponentWithAs, PropsWithAs } from "../factory";
import { Icon } from "./icon";

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
}

export function createIcon(options: CreateIconOptions) {
  const { viewBox = "0 0 24 24" } = options;

  return createComponentWithAs<{}, "svg">((props: PropsWithAs<{}, "svg">) => {
    return (
      <Icon viewBox={viewBox} {...props}>
        {options.path}
      </Icon>
    );
  });
}
