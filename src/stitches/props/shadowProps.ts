import { Property } from "csstype";

import { ShadowTokens } from "../tokens/shadows";

export type ShadowProps = Partial<{
  textShadow: Property.TextShadow | ShadowTokens;
  shadow: Property.BoxShadow | ShadowTokens;
  boxShadow: Property.BoxShadow | ShadowTokens;
}>;

export type ShadowPropsKeys = keyof ShadowProps;

/**
 * Array based on the `ShadowProps`.
 * Used to splitProps in SolidJS components
 */
export const shadowPropsKeys: ShadowPropsKeys[] = ["textShadow", "shadow", "boxShadow"];
