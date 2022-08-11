/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/aspect-ratio.tsx
 */

import {
  createPolymorphicComponent,
  hope,
  HopeProps,
  mapResponsive,
  ResponsiveValue,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { mergeDefaultProps } from "../utils";

export interface AspectRatioProps extends HopeProps {
  /**
   * The aspect ratio of the Box.
   * Common values are: `21/9`, `16/9`, `9/16`, `4/3`, `1.85/1`
   */
  ratio?: ResponsiveValue<number>;
}

/**
 * `AspectRatio` is used to cropping media (videos, images and maps)
 * to a desired aspect ratio.
 */
export const AspectRatio = createPolymorphicComponent<"div", AspectRatioProps>(props => {
  props = mergeDefaultProps(
    {
      ratio: 4 / 3,
    },
    props
  );

  const [local, others] = splitProps(props, ["class", "ratio"]);

  return (
    <hope.div
      class={clsx("hope-aspect-ratio", local.class)}
      __css={{
        position: "relative",
        maxWidth: "100%",
        "&::before": {
          content: '""',
          height: 0,
          display: "block",
          paddingBottom: mapResponsive(local.ratio, r => `${(1 / r) * 100}%`),
        },
        "& > *:not(style)": {
          overflow: "hidden",
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxSize: "100%",
        },
        "& > img, & > video": {
          objectFit: "cover",
        },
      }}
      {...others}
    />
  );
});
