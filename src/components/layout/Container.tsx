import { hope } from "../factory";

/**
 * Layout component used to wrap app or website content
 *
 * By default it sets `margin-left` and `margin-right` to `auto`,
 * to keep its content centered.
 *
 */
export const Container = hope("div", {
  width: "100%",

  "@sm": { maxWidth: "$2xl" },
  "@md": { maxWidth: "$3xl" },
  "@lg": { maxWidth: "$4xl" },
  "@xl": { maxWidth: "$5xl" },
  "@2xl": { maxWidth: "$6xl" },

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
