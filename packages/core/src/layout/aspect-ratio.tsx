import { createHopeComponent, hope, mapResponsive, ResponsiveValue } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js/types/server";

interface AspectRatioOptions {
  /**
   * The aspect ratio of the Box.
   * Common values are: `21/9`, `16/9`, `9/16`, `4/3`, `1.85/1`
   */
  ratio?: ResponsiveValue<number>;
}

const DEFAULT_RATIO = 4 / 3;

/**
 * AspectRatio is used to cropping media (videos, images and maps)
 * to a desired aspect ratio.
 */
export const AspectRatio = createHopeComponent<"div", AspectRatioOptions>(props => {
  const [local, others] = splitProps(props, ["children", "class", "ratio"]);

  return (
    <hope.div
      class={clsx("hope-aspect-ratio", local.class)}
      position="relative"
      _before={{
        height: 0,
        content: `""`,
        display: "block",
        paddingBottom: mapResponsive(local.ratio ?? DEFAULT_RATIO, r => `${(1 / r) * 100}%`),
      }}
      __css={{
        "& > *:not(style)": {
          overflow: "hidden",
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        },
        "& > img, & > video": {
          objectFit: "cover",
        },
      }}
      {...others}
    >
      {props.children}
    </hope.div>
  );
});
