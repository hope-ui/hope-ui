import { isFunction } from "@/utils/assertion";
import { valueToPercent } from "@/utils/number";

export interface GetProgressPropsOptions {
  value?: number;
  min: number;
  max: number;
  indeterminate?: boolean;
  valueText?: string;
  getValueText?(value: number, percent: number): string;
}

/**
 * Get the common `aria-*` attributes for both the linear and circular
 * progress components.
 */
export function getProgressProps(options: GetProgressPropsOptions) {
  const { value = 0, min, max, valueText, getValueText, indeterminate } = options;

  const percent = valueToPercent(value, min, max);

  const getAriaValueText = () => {
    if (value == null) return undefined;
    return isFunction(getValueText) ? getValueText(value, percent) : valueText;
  };

  return {
    bind: {
      "data-indeterminate": indeterminate ? "" : undefined,
      "aria-valuemax": max,
      "aria-valuemin": min,
      "aria-valuenow": indeterminate ? undefined : value,
      "aria-valuetext": getAriaValueText(),
      role: "progressbar",
    },
    percent,
    value,
  };
}
