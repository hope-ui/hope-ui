import { Property } from "csstype";

import { BorderStyleTokens } from "../tokens/borderStyles";
import { BorderWidthTokens } from "../tokens/borderWidths";
import { ColorTokens } from "../tokens/colors";

export type BorderProps = Partial<{
  border: Property.Border<ColorTokens>;
  borderWidth: Property.BorderWidth<BorderWidthTokens>;
  borderStyle: Property.BorderStyle | BorderStyleTokens;
  borderColor: Property.BorderColor | ColorTokens;
  borderTop: Property.BorderTop<ColorTokens>;
  borderTopWidth: Property.BorderTopWidth<BorderWidthTokens>;
  borderTopStyle: Property.BorderTopStyle | BorderStyleTokens;
  borderTopColor: Property.BorderTopColor | ColorTokens;
  borderRight: Property.BorderRight<ColorTokens>;
  borderEnd: Property.BorderInlineEnd<ColorTokens>;
  borderRightWidth: Property.BorderRightWidth<BorderWidthTokens>;
  borderEndWidth: Property.BorderInlineEndWidth<BorderWidthTokens>;
  borderRightStyle: Property.BorderRightStyle | BorderStyleTokens;
  borderEndStyle: Property.BorderInlineEndStyle | BorderStyleTokens;
  borderRightColor: Property.BorderRightColor | ColorTokens;
  borderEndColor: Property.BorderInlineEndColor | ColorTokens;
  borderBottom: Property.BorderBottom<ColorTokens>;
  borderBottomWidth: Property.BorderBottomWidth<BorderWidthTokens>;
  borderBottomStyle: Property.BorderBottomStyle | BorderStyleTokens;
  borderBottomColor: Property.BorderBottomColor | ColorTokens;
  borderLeft: Property.BorderLeft<ColorTokens>;
  borderStart: Property.BorderInlineStart<ColorTokens>;
  borderLeftWidth: Property.BorderLeftWidth<BorderWidthTokens>;
  borderStartWidth: Property.BorderInlineStartWidth<BorderWidthTokens>;
  borderLeftStyle: Property.BorderLeftStyle | BorderStyleTokens;
  borderStartStyle: Property.BorderInlineStartStyle | BorderStyleTokens;
  borderLeftColor: Property.BorderLeftColor | ColorTokens;
  borderStartColor: Property.BorderInlineStartColor | ColorTokens;
  borderX: Property.BorderLeft<ColorTokens>;
  borderY: Property.BorderTop<ColorTokens>;
}>;

export type BorderPropsKeys = keyof BorderProps;

/**
 * Array based on the `BorderProps`.
 * Used to splitProps in SolidJS components
 */
export const borderPropsKeys: BorderPropsKeys[] = [
  "border",
  "borderWidth",
  "borderStyle",
  "borderColor",
  "borderTop",
  "borderTopWidth",
  "borderTopStyle",
  "borderTopColor",
  "borderRight",
  "borderEnd",
  "borderRightWidth",
  "borderEndWidth",
  "borderRightStyle",
  "borderEndStyle",
  "borderRightColor",
  "borderEndColor",
  "borderBottom",
  "borderBottomWidth",
  "borderBottomStyle",
  "borderBottomColor",
  "borderLeft",
  "borderStart",
  "borderLeftWidth",
  "borderStartWidth",
  "borderLeftStyle",
  "borderStartStyle",
  "borderLeftColor",
  "borderStartColor",
  "borderX",
  "borderY",
];
