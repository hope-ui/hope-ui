import {
  createPolymorphicComponent,
  createStyles,
  DefaultProps,
  hope,
  mapResponsive,
  ResponsiveValue,
  Selectors,
  useComponentDefaultProps,
} from "@hope-ui/styles";
import { clsx } from "clsx";

import { splitStylesProps } from "../utils/split-styles-props";

interface AspectRatioStylesParams {
  /**
   * The aspect ratio of the Box.
   * Common values are: `21/9`, `16/9`, `9/16`, `4/3`, `1.85/1`
   */
  ratio: ResponsiveValue<number>;
}

const useStyles = createStyles({
  componentName: "AspectRatio",
  styles: (theme, params: AspectRatioStylesParams) => ({
    root: {
      position: "relative",
      "&::before": {
        height: 0,
        content: `""`,
        display: "block",
        paddingBottom: mapResponsive(params.ratio, r => `${(1 / r) * 100}%`),
      },
      "& > *:not(style)": {
        overflow: "hidden",
        position: "absolute",
        inset: 0,
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
  }),
});

type AspectRatioStylesNames = Selectors<typeof useStyles>;

export interface AspectRatioProps
  extends DefaultProps<AspectRatioStylesNames, AspectRatioStylesParams>,
    Partial<AspectRatioStylesParams> {}

/**
 * AspectRatio is used to cropping media (videos, images and maps)
 * to a desired aspect ratio.
 */
export const AspectRatio = createPolymorphicComponent<"div", AspectRatioProps>(props => {
  props = useComponentDefaultProps(
    "AspectRatio",
    {
      ratio: 16 / 9,
    },
    props
  );

  const [local, others] = splitStylesProps(props, ["class", "children", "ratio"]);

  const { styles, getStaticClass } = useStyles(local);

  return (
    <hope.div
      class={clsx(getStaticClass("root"), local.class)}
      __baseStyle={styles().root}
      {...others}
    >
      {props.children}
    </hope.div>
  );
});
