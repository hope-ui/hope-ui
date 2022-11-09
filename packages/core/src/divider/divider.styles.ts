import { createStyleConfig, StyleConfigProps } from "@hope-ui/styles";

type DividerParts = "root" | "label";

interface DividerVariants {
  /** The orientation of the divider. */
  orientation: "vertical" | "horizontal";

  /** Whether the divider has a label. */
  withLabel: boolean;

  /** The placement of the label, if any. */
  labelPlacement: "start" | "center" | "end";
}

export const useDividerStyleConfig = createStyleConfig<DividerParts, DividerVariants>(
  {
    root: {
      baseStyle: {
        color: { light: "neutral.300", dark: "neutral.700" },
      },
      variants: {
        orientation: {
          horizontal: {
            width: "100%",
            margin: 0,
            border: 0,
            borderTopColor: "currentColor",
          },
          vertical: {
            alignSelf: "stretch",
            height: "auto",
            border: 0,
            borderLeftColor: "currentColor",
          },
        },
        withLabel: {
          true: {
            display: "flex",
            alignItems: "center",
            gap: 3,

            border: "0 !important",

            _before: {
              content: '""',
              flex: 1,
              height: "1px",
              border: 0,
              borderColor: "currentColor",
            },
            _after: {
              content: '""',
              flex: 1,
              border: 0,
              borderColor: "currentColor",
            },
          },
        },
        labelPlacement: {
          start: {
            _before: {
              display: "none",
            },
          },
          end: {
            _after: {
              display: "none",
            },
          },
        },
      },
      compoundVariants: [
        {
          variants: {
            orientation: "vertical",
            withLabel: true,
          },
          style: {
            flexDirection: "column",
          },
        },
      ],
    },
    label: {
      baseStyle: {
        color: "common.foreground",
      },
    },
  },
  {
    orientation: "horizontal",
    labelPlacement: "start",
    withLabel: false,
  }
);

export type DividerStyleConfigProps = StyleConfigProps<typeof useDividerStyleConfig>;
