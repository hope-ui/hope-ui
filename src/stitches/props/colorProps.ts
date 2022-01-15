import { Property } from "csstype";

import { ColorTokens } from "../tokens/colors";

export type ColorProps = Partial<{
  color: Property.Color | ColorTokens;
  opacity: Property.Opacity;
}>;

export type ColorPropsKeys = keyof ColorProps;

/**
 * Array based on the `ColorProps`.
 * Used to splitProps in SolidJS components
 */
export const colorPropsKeys: ColorPropsKeys[] = ["color", "opacity"];
