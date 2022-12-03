import { createStyleConfig, StyleConfigProps } from "@hope-ui/styles";

type DividerParts = "root" | "list" | "item" | "link" | "separator";

interface DividerVariants {
  /** whether is the current page. */
  currentPage: boolean;
}

export const useBreadcrumbStyleConfig = createStyleConfig<DividerParts, DividerVariants>(
  ({ vars }) => ({
    root: {
      baseStyle: {
        display: "block",
        fontSize: vars.fontSizes.base,
        lineHeight: vars.lineHeights[6],
      },
    },
    list: {
      baseStyle: {
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        margin: "0",
        padding: "0",
      },
    },
    item: {
      baseStyle: {
        display: "inline-flex",
        alignItems: "center",
      },
    },
    link: {
      baseStyle: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        outline: "none",
        backgroundColor: "transparent",
        color: vars.colors.neutral[500],
        textDecoration: "none",
        cursor: "pointer",
        transition: "color 250ms ease 0s, text-decoration 250ms ease 0s",
        _hover: {
          color: vars.colors.primary[500],
        },
      },
      variants: {
        currentPage: {
          true: {
            cursor: "default",
            color: vars.colors.neutral[900],
            _hover: {
              color: vars.colors.neutral[900],
            },
          },
        },
      },
    },
    separator: {
      baseStyle: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
  }),
  {
    currentPage: false,
  }
);

export type BreadcrumbStyleConfigProps = StyleConfigProps<typeof useBreadcrumbStyleConfig>;
