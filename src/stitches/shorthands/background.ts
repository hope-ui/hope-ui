import type { PropertyValue } from "@stitches/core";

import { ColorProps } from "../props/styleProps";

export const background: Pick<Record<keyof ColorProps, any>, "bg"> = {
  /**
   * The CSS `background` property
   */
  bg: (value: PropertyValue<"background">) => ({ background: value }),
};
