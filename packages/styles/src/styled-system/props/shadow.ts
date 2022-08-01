import { Property } from "csstype";

import { KeysOf, ThemeShadow } from "../../types";
import { ResponsiveProps } from "./responsive-value";

export type ShadowProps = ResponsiveProps<{
  /** The CSS `box-shadow` property. */
  shadow: Property.BoxShadow | ThemeShadow;
}>;

export const shadowPropNames: KeysOf<ShadowProps> = {
  shadow: true,
};
