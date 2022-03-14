import { Property } from "csstype";
import { splitProps } from "solid-js";

import { ColorScaleValue, SizeScaleValue } from "@/styled-system";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { HTMLHopeProps } from "../types";
import { circularProgressTrackStyles } from "./circular-progress.styles";

interface CircularProgressTrackOptions {
  /**
   * The stroke color of the progress track.
   */
  stroke?: Property.Stroke | ColorScaleValue;

  /**
   * The stroke width of the progress track.
   */
  strokeWidth?: Property.StrokeWidth<SizeScaleValue> | number;
}

type CircularProgressTrackProps = HTMLHopeProps<"circle", CircularProgressTrackOptions>;

const hopeCircularProgressTrackClass = "hope-circular-progress__track";

export function CircularProgressTrack(props: CircularProgressTrackProps) {
  const theme = useComponentStyleConfigs().CircularProgress;

  const [local, others] = splitProps(props, ["class", "stroke", "strokeWidth"]);

  const classes = () =>
    classNames(
      local.class,
      hopeCircularProgressTrackClass,
      circularProgressTrackStyles({
        css: {
          stroke: local.stroke,
          strokeWidth: local.strokeWidth,
        },
      })
    );

  return (
    <hope.circle
      class={classes()}
      cx={50}
      cy={50}
      r={42}
      fill="transparent"
      __baseStyle={theme?.baseStyle?.track}
      {...others}
    />
  );
}

CircularProgressTrack.toString = () => createClassSelector(hopeCircularProgressTrackClass);
