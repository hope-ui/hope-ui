import { isNumber } from "./assertion";

function analyzeCSSValue(value: number | string) {
  const num = parseFloat(value.toString());
  const unit = value.toString().replace(String(num), "");

  return { unitless: !unit, value: num, unit };
}

/** Add `px` unit to a unitless/number value, otherwise return the value as is. */
export function px(value: number | string | null | undefined): string | null {
  if (value == null) {
    return value as string | null;
  }

  const { unitless } = analyzeCSSValue(value);

  return unitless || isNumber(value) ? `${value}px` : value;
}

export function rgbVar(cssVar: string, alpha?: string): string {
  if (alpha == null) {
    return `rgb(${cssVar})`;
  }

  return `rgb(${cssVar} / ${alpha})`;
}
