import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ColorScaleValue, SizeScaleValue } from "@/styled-system/types";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { HTMLHopeProps } from "../types";
import { CircleProgressIndicatorVariants, circularProgressIndicatorStyles } from "./circular-progress.styles";
import { useComponentStyleConfigs } from "@/theme/provider";

interface CircularProgressIndicatorOptions extends CircleProgressIndicatorVariants {
  /**
   * The stroke color of the progress indicator.
   */
  stroke?: Property.Stroke | ColorScaleValue;

  /**
   * The stroke width of the progress indicator.
   */
  strokeWidth?: Property.StrokeWidth<SizeScaleValue> | number;
}

type CircularProgressIndicatorProps = HTMLHopeProps<"circle", CircularProgressIndicatorOptions>;

const hopeCircularProgressIndicatorClass = "hope-circular-progress__indicator";

/**
 * ProgressIndicator (Circular)
 *
 * The progress component that visually indicates the current level of the circular progress bar.
 */
export function CircularProgressIndicator(props: CircularProgressIndicatorProps) {
  const theme = useComponentStyleConfigs().CircularProgress;

  const [local, others] = splitProps(props, ["class", "stroke", "strokeWidth", "withRoundCap", "spin"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeCircularProgressIndicatorClass,
      circularProgressIndicatorStyles({
        withRoundCap: local.withRoundCap,
        spin: local.spin === true ? true : false, // ensure a boolean is passed so the `true/false` values works correctly
        css: {
          stroke: local.stroke,
          strokeWidth: local.strokeWidth,
        },
      })
    );
  };

  return (
    <hope.circle
      class={classes()}
      cx={50}
      cy={50}
      r={42}
      fill="transparent"
      __baseStyle={theme?.baseStyle?.indicator}
      {...others}
    />
  );
}

CircularProgressIndicator.toString = () => createClassSelector(hopeCircularProgressIndicatorClass);
