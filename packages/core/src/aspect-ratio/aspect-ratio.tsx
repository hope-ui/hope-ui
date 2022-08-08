import {
  ComponentTheme,
  createPolymorphicComponent,
  createStyles,
  DefaultProps,
  hope,
  mapResponsive,
  PartsOf,
  ResponsiveValue,
  useComponentDefaultProps,
} from "@hope-ui/styles";
import { clsx } from "clsx";

import { splitDefaultProps } from "../utils";

export interface AspectRatioStylesParams {
  /**
   * The aspect ratio of the Box.
   * Common values are: `21/9`, `16/9`, `9/16`, `4/3`, `1.85/1`
   */
  ratio: ResponsiveValue<number>;
}

const useStyles = createStyles((theme, params: AspectRatioStylesParams) => ({
  root: {
    position: "relative",
    maxWidth: "100%",

    "&::before": {
      content: '""',
      height: 0,
      display: "block",
      paddingBottom: mapResponsive(params.ratio, r => `${(1 / r) * 100}%`),
    },

    "&::after": {
      content: '""',
      display: "table",
      clear: "both",
    },

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
  },
}));

export type AspectRatioParts = PartsOf<typeof useStyles>;

export type AspectRatioProps = DefaultProps<AspectRatioParts, AspectRatioStylesParams> &
  Partial<AspectRatioStylesParams>;

export type AspectRatioTheme = ComponentTheme<
  AspectRatioProps,
  AspectRatioParts,
  AspectRatioStylesParams
>;

/**
 * `AspectRatio` is used to cropping media (videos, images and maps)
 * to a desired aspect ratio.
 */
export const AspectRatio = createPolymorphicComponent<"div", AspectRatioProps>(props => {
  props = useComponentDefaultProps("AspectRatio", { ratio: 4 / 3 }, props);

  const [local, others] = splitDefaultProps(props, ["class", "ratio"]);

  const { styles } = useStyles(local as AspectRatioStylesParams, {
    name: "AspectRatio",
    styles: () => local.styles,
    unstyled: () => local.unstyled,
  });

  return (
    <hope.div class={clsx("hope-aspect-ratio", local.class)} __css={styles().root} {...others} />
  );
});
