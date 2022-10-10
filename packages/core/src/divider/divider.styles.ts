import { createStyleConfig, PseudoSelectorValue, StyleConfigProps } from "@hope-ui/styles";

type DividerParts = "root" | "wrapper";

const verticalLineStyle: PseudoSelectorValue = {
  top: 0,
  left: "50%",
  height: "50%",
  borderTop: 0,
  transform: "none",
};

/** horizontal line style when it has children prop. */
const horizontalLineStyleWithChildren: PseudoSelectorValue = {
  top: "50%",
  width: "100%",
  content: `""`,
  position: "relative",
  transform: "translateY(50%)",
};

const tenPresentWidth = { width: "10%" };
const nintyPresentWidth = { width: "90%" };

interface DividerVariants {
  /** the visual style of dividing line. */
  variant: "solid" | "dashed" | "dotted";

  /** The orientation of the divider. */
  orientation: "vertical" | "horizontal";

  /** The placement of the divider text, if any. */
  labelPlacement: "left" | "right" | "center";

  /** has children prop */
  hasChildren: boolean;
}

export const useDividerStyleConfig = createStyleConfig<DividerParts, DividerVariants>(
  ({ vars }) => ({
    root: {
      baseStyle: {
        whiteSpace: "nowrap",
        borderStyle: "none",
        borderColor: vars.colors.blackAlpha[300],
        _after: { borderColor: vars.colors.blackAlpha[300] },
        _before: { borderColor: vars.colors.blackAlpha[300] },
      },
      variants: {
        hasChildren: {
          true: {
            margin: "14px 0",
            display: "flex",
            _after: horizontalLineStyleWithChildren,
            _before: horizontalLineStyleWithChildren,
          },
          false: {
            margin: "24px 0",
            borderTopColor: vars.colors.blackAlpha[300],
          },
        },
        labelPlacement: {
          left: {
            _before: tenPresentWidth,
            _after: nintyPresentWidth,
          },
          right: {
            _after: tenPresentWidth,
            _before: nintyPresentWidth,
          },
          center: {},
        },
        orientation: {
          horizontal: {},
          vertical: {
            height: "auto",
            margin: "0 1em",
            display: "inline",
            borderTop: 0,
            borderLeft: vars.colors.blackAlpha[300],
          },
        },
      },
      compoundVariants: [
        {
          variants: {
            hasChildren: true,
            orientation: "vertical",
          },
          style: {
            borderLeft: 0,
            display: "flex",
            flexDirection: "column",
            _after: verticalLineStyle,
            _before: verticalLineStyle,
          },
        },
      ],
    },
    wrapper: {
      baseStyle: {
        display: "inline-block",
        whiteSpace: "nowrap",
        paddingLeft: "3",
        paddingRight: "3",
      },
      compoundVariants: [
        {
          variants: {
            orientation: "vertical",
            hasChildren: true,
          },
          style: {
            paddingTop: "3",
            paddingBottom: "3",
          },
        },
      ],
    },
  }),
  {
    hasChildren: false,
    orientation: "horizontal",
    labelPlacement: "center",
  }
);

export type DividerStyleConfigProps = StyleConfigProps<typeof useDividerStyleConfig>;
