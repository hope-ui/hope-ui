import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb
 * -----------------------------------------------------------------------------------------------*/

export const breadcrumbStyles = css({
  display: "block",
  fontSize: "$base",
  lineHeight: "$6",
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb - List
 * -----------------------------------------------------------------------------------------------*/

export const breadcrumbListStyles = css({
  display: "flex",
  alignItems: "center",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb - item
 * -----------------------------------------------------------------------------------------------*/

export const breadcrumbItemStyles = css({
  display: "inline-flex",
  alignItems: "center",
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb - separator
 * -----------------------------------------------------------------------------------------------*/

export const breadcrumbSeparatorStyles = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb - link
 * -----------------------------------------------------------------------------------------------*/

export const breadcrumbLinkStyles = css({
  position: "relative",

  display: "inline-flex",
  alignItems: "center",

  outline: "none",
  backgroundColor: "transparent",

  color: "$neutral11",
  textDecoration: "none",
  cursor: "pointer",
  transition: "color 250ms, text-decoration 250ms",

  "&:focus": {
    boxShadow: "$outline",
  },

  variants: {
    currentPage: {
      true: {
        color: "$neutral12",
        cursor: "default",
      },
      false: {
        "&:hover": {
          color: "$primary11",
        },
      },
    },
  },
});
