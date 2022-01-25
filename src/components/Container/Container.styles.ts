import { css } from "@/stitches/stitches.config";
import { VariantProps } from "@stitches/core";

export const containerStyles = css({
  width: "100%",

  "@sm": { maxWidth: "$containerSm" },
  "@md": { maxWidth: "$containerMd" },
  "@lg": { maxWidth: "$containerLg" },
  "@xl": { maxWidth: "$containerXl" },
  "@2xl": { maxWidth: "$container2xl" },

  variants: {
    /**
     * If `true`, container itself will be centered on the page.
     */
    centered: {
      true: {
        mx: "auto",
      },
    },

    /**
     * If `true`, container will center its children regardless of their width.
     */
    centerContent: {
      true: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
    },
  },

  defaultVariants: {
    centered: true,
    centerContent: false,
  },
});

export type ContainerVariants = VariantProps<typeof containerStyles>;
