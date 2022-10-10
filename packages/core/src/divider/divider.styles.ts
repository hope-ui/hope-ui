import { createStyleConfig, StyleConfigProps, SystemStyleObject } from "@hope-ui/styles";

type DividerParts = "root" | "labelWrapper";

interface DividerVariants {
  /** The orientation of the divider. */
  orientation: "vertical" | "horizontal";

  /** The placement of the label, if any. */
  labelPlacement: "left" | "right" | "center";

  /** Whether the divider has a label. */
  hasLabel: boolean;
}

const verticalLineStyleWithLabel: SystemStyleObject = {
  content: `""`,
  top: 0,
  left: "50%",
  height: "50%",
  borderTop: 0,
  transform: "none",
};

const horizontalLineStyleWithLabel: SystemStyleObject = {
  content: `""`,
  position: "relative",
  top: "50%",
  //width: "100%",
  transform: "translateY(50%)",
};

export const useDividerStyleConfig = createStyleConfig<DividerParts, DividerVariants>(
  ({ vars }) => ({
    root: {
      baseStyle: {
        whiteSpace: "nowrap",
        borderStyle: "none",
        borderColor: vars.colors.blackAlpha[300],

        _after: {
          borderColor: vars.colors.blackAlpha[300],
        },

        _before: {
          borderColor: vars.colors.blackAlpha[300],
        },
      },
      variants: {
        orientation: {
          horizontal: {
            width: "100%",
          },
          vertical: {
            height: "auto",
            margin: "0 1em",
            display: "inline",
            borderTop: 0,
            borderLeftColor: vars.colors.blackAlpha[300],
          },
        },
        labelPlacement: {},
        hasLabel: {
          true: {
            display: "flex",
            mx: 4,
            my: 0,
          },
          false: {
            margin: 0,
            borderTopColor: vars.colors.blackAlpha[300],
          },
        },
      },
      compoundVariants: [
        {
          variants: {
            orientation: "horizontal",
            labelPlacement: "left",
            hasLabel: true,
          },
          style: {
            _before: {
              ...horizontalLineStyleWithLabel,
              width: "5%",
            },
            _after: {
              ...horizontalLineStyleWithLabel,
              width: "95%",
            },
          },
        },
        {
          variants: {
            orientation: "horizontal",
            labelPlacement: "right",
            hasLabel: true,
          },
          style: {
            _before: {
              ...horizontalLineStyleWithLabel,
              width: "95%",
            },
            _after: {
              ...horizontalLineStyleWithLabel,
              width: "5%",
            },
          },
        },
        {
          variants: {
            orientation: "vertical",
            hasLabel: true,
          },
          style: {
            display: "flex",
            flexDirection: "column",
            borderLeft: 0,
            _after: verticalLineStyleWithLabel,
            _before: verticalLineStyleWithLabel,
          },
        },
      ],
    },
    labelWrapper: {
      baseStyle: {
        display: "inline-block",
        whiteSpace: "nowrap",
        px: 3,
      },
      variants: {
        orientation: {
          vertical: {
            py: 3,
          },
        },
      },
    },
  }),
  {
    orientation: "horizontal",
    labelPlacement: "left",
    hasLabel: false,
  }
);

export type DividerStyleConfigProps = StyleConfigProps<typeof useDividerStyleConfig>;
