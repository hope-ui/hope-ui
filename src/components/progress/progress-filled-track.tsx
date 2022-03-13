import { createMemo, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { progressFilledTrackStyles, ProgressFilledTrackVariants } from "./progress.styles";
import { getProgressProps, GetProgressPropsOptions } from "./progress.utils";

type ProgressFilledTrackOptions = GetProgressPropsOptions & ProgressFilledTrackVariants;

export type ProgressFilledTrackProps<C extends ElementType = "div"> = HTMLHopeProps<C, ProgressFilledTrackOptions>;

const hopeProgressFilledTrackClass = "hope-progress__filled-track";

/**
 * ProgressFilledTrack (Linear)
 *
 * The progress component that visually indicates the current level of the progress bar.
 * It applies `background-color` and changes its width.
 */
export function ProgressFilledTrack<C extends ElementType = "div">(props: ProgressFilledTrackProps<C>) {
  const [local, others] = splitProps(props, [
    "class",
    "min",
    "max",
    "value",
    "colorScheme",
    "striped",
    "animated",
    "indeterminate",
  ]);

  const progress = createMemo(() => {
    return getProgressProps({
      value: local.value,
      min: local.min,
      max: local.max,
      indeterminate: local.indeterminate,
    });
  });

  const progressProps = () => progress().bind;

  const width = () => `${progress().percent}%`;

  const classes = () => {
    return classNames(
      local.class,
      hopeProgressFilledTrackClass,
      progressFilledTrackStyles({
        colorScheme: local.colorScheme,
        striped: local.striped,
        animated: local.animated,
        indeterminate: local.indeterminate === true ? true : false, // ensure a boolean is passed so compound variants works correctly
      })
    );
  };

  return <Box class={classes()} width={width()} {...progressProps} {...others} />;
}

ProgressFilledTrack.toString = () => createClassSelector(hopeProgressFilledTrackClass);
