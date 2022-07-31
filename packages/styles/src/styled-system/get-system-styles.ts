import {
  CSSObject,
  SystemStyleProps,
  ThemeBase,
  ThemeColor,
  ThemeSize,
  ThemeSpace,
} from "../types";
import { Shade, ThemeColorShade } from "../types/token";

function getSpaceValue(value: ThemeSpace | number | null | undefined, theme: ThemeBase) {
  if (value == null) {
    return undefined;
  }

  return theme.space[String(value)] ?? value;
}

function getSizeValue(value: ThemeSize | number | null | undefined, theme: ThemeBase) {
  if (value == null) {
    return undefined;
  }

  return theme.size[String(value)] ?? value;
}

function getColorValue(value: ThemeColorShade | string | null | undefined, theme: ThemeBase) {
  if (value == null) {
    return undefined;
  }

  const parts = value.split(".");

  if (parts.length !== 2) {
    return value;
  }

  const [color, shade] = parts as [ThemeColor, Shade];

  return theme.colors[color]?.[shade] ?? value;
}

export function getSystemStyles(systemProps: SystemStyleProps, theme: ThemeBase) {
  const styles: CSSObject = {};
  return styles;
}
